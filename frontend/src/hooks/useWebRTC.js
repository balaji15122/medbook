import { useEffect, useRef, useState, useCallback } from "react";
import socketService from "../services/socketService.js";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (appointmentId, userRole) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connStatus, setConnStatus] = useState("disconnected"); // disconnected, connecting, connected, failed
  const [peerJoined, setPeerJoined] = useState(false);

  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingCandidates = useRef([]);

  // End call cleanup
  const cleanUp = useCallback(() => {
    console.log("Cleaning up WebRTC peer connection...");

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
      setLocalStream(null);
    }

    setRemoteStream(null);
    remoteStreamRef.current = null;
    setConnStatus("disconnected");
    setPeerJoined(false);
    pendingCandidates.current = [];
  }, []);

  // Initialize peer connection
  const createPeerConnection = useCallback((targetSocketId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    console.log("Creating RTCPeerConnection...");
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("Sending ICE candidate to peer:", targetSocketId);
        socketRef.current.emit("ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        remoteStreamRef.current = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected") {
        setConnStatus("connected");
      } else if (pc.iceConnectionState === "disconnected") {
        setConnStatus("disconnected");
      } else if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "closed"
      ) {
        setConnStatus("failed");
      }
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Initiate call (Offer)
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
      console.error("Failed to initiate call:", err);
      setConnStatus("failed");
    }
  }, [createPeerConnection]);

  // Main hook logic
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        console.log("Requesting camera and microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Get socket instance
        const socket = socketService.getSocket();
        if (!socket) {
          console.error("Socket not connected");
          setConnStatus("failed");
          return;
        }
        socketRef.current = socket;

        // 1. Listen for new peer joining
        socket.on("user-joined", async ({ socketId, role }) => {
          console.log(`Peer joined: ${role} (${socketId})`);
          setPeerJoined(true);
          // The peer already in the room initiates the call
          await initiateCall(socketId);
        });

        // 2. Listen for existing peers list
        socket.on("room-peers", async ({ peers }) => {
          console.log("Room peers received:", peers);
          if (peers && peers.length > 0) {
            setPeerJoined(true);
            // Connect to the first peer in the list
            const firstPeer = peers[0];
            setConnStatus("connecting");
            createPeerConnection(firstPeer.socketId);
          }
        });

        // 3. Listen for incoming offer
        socket.on("offer", async ({ senderSocketId, offer }) => {
          console.log("Received offer from:", senderSocketId);
          try {
            const pc = createPeerConnection(senderSocketId);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            console.log("Creating answer...");
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("answer", {
              targetSocketId: senderSocketId,
              answer,
            });

            // Process any queued candidates
            while (pendingCandidates.current.length > 0) {
              const cand = pendingCandidates.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (err) {
            console.error("Failed to handle offer:", err);
          }
        });

        // 4. Listen for incoming answer
        socket.on("answer", async ({ senderSocketId, answer }) => {
          console.log("Received answer from:", senderSocketId);
          try {
            const pc = peerConnectionRef.current;
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
              
              // Process any queued candidates
              while (pendingCandidates.current.length > 0) {
                const cand = pendingCandidates.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            }
          } catch (err) {
            console.error("Failed to handle answer:", err);
          }
        });

        // 5. Listen for ICE candidates
        socket.on("ice-candidate", async ({ senderSocketId, candidate }) => {
          console.log("Received ICE candidate from:", senderSocketId);
          try {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              // Queue candidate if remote description is not set yet
              pendingCandidates.current.push(candidate);
            }
          } catch (err) {
            console.error("Failed to add ICE candidate:", err);
          }
        });

        // 6. Listen for peer leaving
        socket.on("user-left", ({ socketId, role }) => {
          console.log(`Peer left: ${role} (${socketId})`);
          setPeerJoined(false);
          setRemoteStream(null);
          remoteStreamRef.current = null;
          setConnStatus("disconnected");
          
          // Re-create peer connection listener state
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        });

        // Register with room
        const roomToken = sessionStorage.getItem(`roomToken_${appointmentId}`);
        const roomId = `room_${appointmentId}`;
        socket.emit("join-room", { roomId, token: roomToken });

      } catch (err) {
        console.error("Error setting up local media or socket events:", err);
        setConnStatus("failed");
      }
    };

    init();

    return () => {
      active = false;
      cleanUp();
      const socket = socketRef.current;
      if (socket) {
        socket.off("user-joined");
        socket.off("room-peers");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-left");
      }
    };
  }, [appointmentId, createPeerConnection, initiateCall, cleanUp]);

  // Toggle Audio Mute
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  }, []);

  // Toggle Video Mute
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted((prev) => !prev);
    }
  }, []);

  const [facingMode, setFacingMode] = useState("user");

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return;
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    try {
      console.log(`Switching camera to facingMode: ${newFacingMode}`);
      
      // Stop existing video track(s)
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => track.stop());

      // Get new video track with target facingMode
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace video track in localStream
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
      }
      localStreamRef.current.addTrack(newVideoTrack);

      // Replace track on RTCPeerConnection sender
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find((sender) => sender.track && sender.track.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      setFacingMode(newFacingMode);
      // Trigger state updates
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

    } catch (err) {
      console.error("Failed to switch camera:", err);
    }
  }, [facingMode]);

  // Simple reconnect mechanism
  const reconnectCall = useCallback(() => {
    const pc = peerConnectionRef.current;
    if (pc && socketRef.current && peerJoined) {
      console.log("Attempting call renegotiation/reconnection...");
      // Trigger a new offer
      const socketId = socketRef.current.id;
      // We can reset connection state and renegotiate
      setConnStatus("connecting");
      initiateCall(socketId);
    }
  }, [peerJoined, initiateCall]);

  return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    connStatus,
    peerJoined,
    toggleAudio,
    toggleVideo,
    reconnectCall,
    switchCamera,
  };
};

export default useWebRTC;
