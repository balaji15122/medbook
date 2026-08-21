import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, RefreshCw } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";
import socketService from "../../services/socketService.js";

// Multi-provider STUN/TURN server configuration for WebRTC NAT traversal
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    // Backup public STUNs
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.ideasip.com" },
  ],
};

export const CameraStreamCanvas = ({ appointmentId, user, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteFrame, setRemoteFrame] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connStatus, setConnStatus] = useState("connecting"); // disconnected, connecting, connected, failed
  const [peerJoined, setPeerJoined] = useState(false);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isLocalFloating, setIsLocalFloating] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const pendingCandidates = useRef([]);
  const peerSocketIdRef = useRef(null);
  const localStreamRef = useRef(null); // Stable ref to prevent loop triggers

  // Audio Context and nodes for Web Audio API audio streaming
  const audioContextRef = useRef(null);
  const micSourceRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const nextAudioStartTimeRef = useRef(0);

  // Canvas drawing ref
  const canvasIntervalIdRef = useRef(null);

  // Keep refs of mutable states to read inside event handlers without re-running effects
  const isFallbackRef = useRef(false);
  const isAudioMutedRef = useRef(false);

  useEffect(() => {
    isFallbackRef.current = isFallbackActive;
  }, [isFallbackActive]);

  useEffect(() => {
    isAudioMutedRef.current = isAudioMuted;
  }, [isAudioMuted]);

  // Clean up resources on unmount
  const cleanUp = useCallback(() => {
    console.log("Cleaning up camera stream and connections...");

    // Stop fallback broadcaster tasks
    if (canvasIntervalIdRef.current) {
      clearInterval(canvasIntervalIdRef.current);
      canvasIntervalIdRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    setRemoteStream(null);
    setRemoteFrame(null);
    setConnStatus("disconnected");
    setPeerJoined(false);
    setIsFallbackActive(false);
    pendingCandidates.current = [];
    peerSocketIdRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Start fallback broadcasting (drawing video to canvas and capturing audio via Web Audio API)
  const startFallbackBroadcasting = useCallback(() => {
    const currentStream = localStreamRef.current;
    if (!currentStream) return;
    console.log("Starting WebSockets fallback stream broadcasting...");
    setIsFallbackActive(true);

    // 1. Fallback Video: draw local stream to canvas and emit JPEG data URLs
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext("2d");

    if (canvasIntervalIdRef.current) clearInterval(canvasIntervalIdRef.current);
    canvasIntervalIdRef.current = setInterval(() => {
      if (localVideoRef.current && localVideoRef.current.readyState >= 2) {
        context.drawImage(localVideoRef.current, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.80);
          socketRef.current?.emit("stream_frame", { streamId: appointmentId, frame: dataUrl });
        } catch (err) {
          console.error("Failed to convert/emit canvas frame:", err);
        }
      }
    }, 100); // 10fps

    // 2. Fallback Audio: capture PCM samples using Web Audio API ScriptProcessorNode
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const audioTracks = currentStream.getAudioTracks();
      if (audioTracks.length > 0) {
        // Disconnect existing nodes if any
        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (micSourceRef.current) micSourceRef.current.disconnect();

        const micSource = audioContextRef.current.createMediaStreamSource(new MediaStream([audioTracks[0]]));
        // Using ScriptProcessorNode as specified
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          // Check if audio is muted or fallback is turned off
          if (isAudioMutedRef.current || !isFallbackRef.current) return;

          const inputBuffer = e.inputBuffer.getChannelData(0); // float32 PCM data
          const wavBuffer = encodeWAV(inputBuffer, audioContextRef.current.sampleRate);
          const base64Wav = arrayBufferToBase64(wavBuffer);
          
          socketRef.current?.emit("stream_audio", { streamId: appointmentId, audio: base64Wav });
        };

        micSource.connect(processor);
        processor.connect(audioContextRef.current.destination);

        micSourceRef.current = micSource;
        scriptProcessorRef.current = processor;
      }
    } catch (err) {
      console.error("Web Audio API fallback setup failed:", err);
    }
  }, [appointmentId]);

  // Stop fallback broadcasting
  const stopFallbackBroadcasting = useCallback(() => {
    console.log("Stopping WebSockets fallback stream broadcasting...");
    setIsFallbackActive(false);

    if (canvasIntervalIdRef.current) {
      clearInterval(canvasIntervalIdRef.current);
      canvasIntervalIdRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
  }, []);

  // Web Audio API playback for remote audio chunks
  const playAudioChunk = useCallback(async (base64Wav) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const arrayBuffer = base64ToArrayBuffer(base64Wav);
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const sourceNode = audioContextRef.current.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      if (nextAudioStartTimeRef.current < currentTime) {
        nextAudioStartTimeRef.current = currentTime + 0.05; // 50ms scheduling buffer delay
      }

      sourceNode.start(nextAudioStartTimeRef.current);
      nextAudioStartTimeRef.current += audioBuffer.duration;
    } catch (err) {
      console.error("Failed to decode and queue fallback audio chunk:", err);
    }
  }, []);

  // Initialize WebRTC Peer Connection
  const createPeerConnection = useCallback((targetSocketId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    console.log("Initializing RTCPeerConnection...");
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("Sending ICE Candidate to peer:", targetSocketId);
        socketRef.current.emit("ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote media stream track:", event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        // Once remote tracks are rendering via WebRTC, stop fallback streaming
        stopFallbackBroadcasting();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State Change:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected") {
        setConnStatus("connected");
        stopFallbackBroadcasting();
      } else if (pc.iceConnectionState === "disconnected") {
        setConnStatus("disconnected");
        // Start fallback streaming on packet drop / temporary disconnects
        startFallbackBroadcasting();
      } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
        setConnStatus("failed");
        startFallbackBroadcasting();
      }
    };

    // Add local media tracks to peer connection
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [startFallbackBroadcasting, stopFallbackBroadcasting]);

  // Initiate WebRTC Call
  const initiateCall = useCallback(async (targetSocketId) => {
    try {
      setConnStatus("connecting");
      const pc = createPeerConnection(targetSocketId);

      console.log("Creating offer...");
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        targetSocketId,
        offer,
      });
    } catch (err) {
      console.error("Failed to initiate WebRTC call offer:", err);
      setConnStatus("failed");
      startFallbackBroadcasting();
    }
  }, [createPeerConnection, startFallbackBroadcasting]);

  // Reconnection action
  const reconnectCall = useCallback(() => {
    if (peerSocketIdRef.current) {
      console.log("Retrying connection...");
      initiateCall(peerSocketIdRef.current);
    }
  }, [initiateCall]);

  // Media configuration initialization
  useEffect(() => {
    let active = true;

    const initMedia = async () => {
      try {
        console.log("Requesting camera/microphone access (up to 1080p)...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: facingMode,
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const socket = socketService.getSocket();
        if (!socket) {
          console.error("Socket instance is missing.");
          setConnStatus("failed");
          return;
        }
        socketRef.current = socket;

        // Watchdog: If WebRTC hasn't connected in 6s after peer joined, trigger fallback
        let connectionWatchdog = null;

        const startWatchdog = () => {
          if (connectionWatchdog) clearTimeout(connectionWatchdog);
          connectionWatchdog = setTimeout(() => {
            if (peerConnectionRef.current?.iceConnectionState !== "connected") {
              console.warn("WebRTC connection timed out. Falling back to Socket.IO stream...");
              startFallbackBroadcasting();
            }
          }, 6000);
        };

        // Listen for new user joining
        socket.on("user-joined", async ({ socketId, role }) => {
          console.log(`User joined: ${role} (${socketId})`);
          peerSocketIdRef.current = socketId;
          setPeerJoined(true);
          startWatchdog();
          await initiateCall(socketId);
        });

        // Listen for list of current peers inside the room
        socket.on("room-peers", async ({ peers }) => {
          console.log("Peers in room received:", peers);
          if (peers && peers.length > 0) {
            setPeerJoined(true);
            const primaryPeer = peers[0];
            peerSocketIdRef.current = primaryPeer.socketId;
            setConnStatus("connecting");
            startWatchdog();
            createPeerConnection(primaryPeer.socketId);
          }
        });

        // Listen for WebRTC offer
        socket.on("offer", async ({ senderSocketId, offer }) => {
          console.log("Received WebRTC offer from sender:", senderSocketId);
          peerSocketIdRef.current = senderSocketId;
          setPeerJoined(true);
          try {
            const pc = createPeerConnection(senderSocketId);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            console.log("Creating WebRTC answer...");
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("answer", {
              targetSocketId: senderSocketId,
              answer,
            });

            // Process any cached ICE candidates
            while (pendingCandidates.current.length > 0) {
              const cand = pendingCandidates.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (err) {
            console.error("Failed to process incoming WebRTC offer:", err);
          }
        });

        // Listen for WebRTC answer
        socket.on("answer", async ({ senderSocketId, answer }) => {
          console.log("Received WebRTC answer from:", senderSocketId);
          try {
            const pc = peerConnectionRef.current;
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));

              while (pendingCandidates.current.length > 0) {
                const cand = pendingCandidates.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            }
          } catch (err) {
            console.error("Failed to process WebRTC answer:", err);
          }
        });

        // Listen for ICE candidates
        socket.on("ice-candidate", async ({ senderSocketId, candidate }) => {
          console.log("Received ICE Candidate from:", senderSocketId);
          try {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              pendingCandidates.current.push(candidate);
            }
          } catch (err) {
            console.error("Failed to add ICE candidate:", err);
          }
        });

        // Fallback Listeners: receive frames and play them if WebRTC is not connected
        socket.on("stream_frame", ({ senderSocketId, frame }) => {
          // If WebRTC is currently connected, ignore incoming fallback frames
          if (peerConnectionRef.current?.iceConnectionState === "connected") return;
          setRemoteFrame(frame);
        });

        socket.on("stream_audio", ({ senderSocketId, audio }) => {
          if (peerConnectionRef.current?.iceConnectionState === "connected") return;
          playAudioChunk(audio);
        });

        // Listen for user leaving
        socket.on("user-left", ({ socketId, role }) => {
          console.log(`User left room: ${role} (${socketId})`);
          if (connectionWatchdog) clearTimeout(connectionWatchdog);
          setPeerJoined(false);
          setRemoteStream(null);
          setRemoteFrame(null);
          setConnStatus("disconnected");
          stopFallbackBroadcasting();
          peerSocketIdRef.current = null;

          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        });

        // Trigger room join signaling
        const roomToken = sessionStorage.getItem(`roomToken_${appointmentId}`);
        const roomId = `room_${appointmentId}`;
        socket.emit("join-room", { roomId, token: roomToken });

      } catch (err) {
        console.error("Error initializing local media stream or sockets:", err);
        setConnStatus("failed");
        startFallbackBroadcasting();
      }
    };

    initMedia();

    return () => {
      active = false;
      cleanUp();
      const socket = socketService.getSocket();
      if (socket) {
        socket.off("user-joined");
        socket.off("room-peers");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("stream_frame");
        socket.off("stream_audio");
        socket.off("user-left");
      }
    };
  }, [appointmentId, facingMode, cleanUp, createPeerConnection, initiateCall, startFallbackBroadcasting, stopFallbackBroadcasting, playAudioChunk]);

  // Feed binding effects
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, peerJoined]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, peerJoined]);

  // Toggle controls
  const toggleAudio = useCallback(() => {
    const currentStream = localStreamRef.current;
    if (currentStream) {
      const audioTracks = currentStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const currentStream = localStreamRef.current;
    if (currentStream) {
      const videoTracks = currentStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted((prev) => !prev);
    }
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // PCM encoding to 16-bit WAV helpers
  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // format PCM
    view.setUint16(22, 1, true); // 1 channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // 16-bit
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);
    return buffer;
  };

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return (
    <>
      {/* Top Bar / Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          background: "rgba(15, 23, 42, 0.8)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 10,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
            Video Consultation Room
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Appt ID: {appointmentId}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Status Indicator */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background:
                connStatus === "connected"
                  ? "rgba(34, 197, 94, 0.2)"
                  : connStatus === "connecting"
                  ? "rgba(234, 179, 8, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              color:
                connStatus === "connected"
                  ? "#22c55e"
                  : connStatus === "connecting"
                  ? "#eab308"
                  : "#ef4444",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  connStatus === "connected"
                    ? "#22c55e"
                    : connStatus === "connecting"
                    ? "#eab308"
                    : "#ef4444",
              }}
            />
            {isFallbackActive ? "FALLBACK (SOCKET)" : connStatus.toUpperCase()}
          </span>

          {connStatus === "failed" && (
            <button
              onClick={reconnectCall}
              title="Reconnect Connection"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "#fff",
                padding: "0.35rem 0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
              }}
            >
              <RefreshCw size={13} /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Video Screens Area */}
      {!peerJoined ? (
        /* Lobby waiting screen */
        <div className="lobby-wrapper">
          <div className="lobby-card">
            <div className="lobby-video-container">
              {isVideoMuted ? (
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                  <VideoOff size={48} style={{ marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "0.875rem" }}>Your Camera is Off</div>
                </div>
              ) : localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Loader message="Accessing camera..." />
              )}

              {/* User Name Pill */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0.75rem",
                  left: "0.75rem",
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "#fff",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <span>You ({user?.name || "User"})</span>
                {isAudioMuted && <MicOff size={11} style={{ color: "#ef4444" }} />}
              </div>
            </div>

            <div className="lobby-waiting-message">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  animation: "pulse 2s infinite",
                }}
              >
                <VideoIcon size={20} style={{ color: "#38bdf8" }} />
              </div>
              <h4 style={{ margin: "0 0 0.25rem", color: "#f1f5f9", fontSize: "0.95rem" }}>
                Waiting for the {user?.role === "doctor" ? "patient" : "doctor"} to join...
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                The consultation will start automatically as soon as they enter the room.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Video Call Grid */
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            padding: "1rem",
            background: "#020617",
            position: "relative",
            minHeight: 0,
          }}
          className="video-grid peer-in-room"
        >
          {/* Local Stream */}
          <div
            onClick={() => setIsLocalFloating((prev) => !prev)}
            className={`local-video-box ${isLocalFloating ? "floating" : "fullscreen"}`}
            style={{
              position: "relative",
              background: "#1e293b",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            {isVideoMuted ? (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <VideoOff size={48} style={{ marginBottom: "0.5rem" }} />
                <div style={{ fontSize: "0.875rem" }}>Your Camera is Off</div>
              </div>
            ) : localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Loader message="Accessing camera..." />
            )}

            {/* User Name Pill */}
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                left: "0.75rem",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#fff",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span>You ({user?.name || "User"})</span>
              {isAudioMuted && <MicOff size={11} style={{ color: "#ef4444" }} />}
            </div>
          </div>

          {/* Remote Feed (WebRTC Video or Fallback Image) */}
          <div
            onClick={() => setIsLocalFloating((prev) => !prev)}
            className={`remote-video-box ${isLocalFloating ? "fullscreen" : "floating"}`}
            style={{
              position: "relative",
              background: "#1e293b",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            {connStatus === "connected" && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : remoteFrame ? (
              /* Fallback Viewer playback rendering JPEG frames directly */
              <img
                src={remoteFrame}
                alt="Remote Stream Fallback Feed"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <Loader message="Connecting feed..." />
              </div>
            )}

            {/* Peer Name Pill */}
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                left: "0.75rem",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#fff",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {user?.role === "doctor" ? "Patient" : "Doctor"}
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1.25rem",
          background: "rgba(15, 23, 42, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Toggle Audio Button */}
        <button
          onClick={toggleAudio}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: isAudioMuted ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isAudioMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Toggle Video Button */}
        <button
          onClick={toggleVideo}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: isVideoMuted ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title={isVideoMuted ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoMuted ? <VideoOff size={22} /> : <VideoIcon size={22} />}
        </button>

        {/* Rotate Camera Button (Switch front/back) */}
        {!isVideoMuted && localStream && (
          <button
            type="button"
            onClick={switchCamera}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Switch Camera (Front/Back)"
          >
            <RefreshCw size={22} />
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          style={{
            width: "60px",
            height: "50px",
            borderRadius: "var(--radius-md)",
            border: "none",
            cursor: "pointer",
            background: "#ef4444",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            fontWeight: 700,
          }}
          title="End Consultation"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </>
  );
};

export default CameraStreamCanvas;
