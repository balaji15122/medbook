import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useWebRTC from "../../hooks/useWebRTC.js";
import socketService from "../../services/socketService.js";
import appointmentService from "../../services/appointmentService.js";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, RefreshCw } from "lucide-react";
import Loader from "../../components/common/Loader.jsx";

export const VideoConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLocalFloating, setIsLocalFloating] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize socket first
  useEffect(() => {
    const token = sessionStorage.getItem(`roomToken_${appointmentId}`);
    if (!token) {
      alert("Unauthorized access. Token not found.");
      navigate(user?.role === "doctor" ? "/doctor/appointments" : "/patient/appointments");
      return;
    }
    
    console.log("Connecting socket service...");
    socketService.connect(token);

    return () => {
      console.log("Disconnecting socket service...");
      socketService.disconnect();
    };
  }, [appointmentId, navigate, user]);

  // Hook up WebRTC connection
  const {
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
  } = useWebRTC(appointmentId, user?.role);

  // Set streams to video elements
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

  // Handle call end
  const handleEndCall = async () => {
    if (!window.confirm("Are you sure you want to end this video consultation?")) {
      return;
    }

    try {
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("leave-room");
      }

      await appointmentService.endVideoCall(appointmentId);
      sessionStorage.removeItem(`roomToken_${appointmentId}`);
      
      alert("Consultation call ended.");
      navigate(user?.role === "doctor" ? "/doctor/appointments" : "/patient/appointments");
    } catch (err) {
      console.error("Failed to cleanly end call:", err.message);
      navigate(user?.role === "doctor" ? "/doctor/appointments" : "/patient/appointments");
    }
  };

  return (
    <div
      className="consultation-room"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "#0f172a",
        overflow: "hidden",
        position: "relative",
      }}
    >
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
            {connStatus.toUpperCase()}
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
        /* Lobby waiting screen (Mobile UI preview centered on Desktop) */
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
          {/* Local Stream (or patient feed) */}
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

          {/* Remote Stream (Peer) */}
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
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
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
          onClick={handleEndCall}
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

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .lobby-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: #020617;
        }

        .lobby-card {
          width: 100%;
          max-width: 440px;
          background: #1e293b;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lobby-video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #0f172a;
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .lobby-waiting-message {
          padding: 1.5rem;
          text-align: center;
          background: rgba(15, 23, 42, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        @media (max-width: 768px) {
          .consultation-room {
            height: 100dvh !important;
            max-height: none !important;
            border-radius: 0 !important;
          }

          .video-grid.peer-in-room {
            display: block !important;
            position: relative !important;
            overflow: hidden !important;
            padding: 0 !important;
          }
          
          .fullscreen {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important;
            border-radius: 0 !important;
          }
          
          .floating {
            position: absolute !important;
            top: 1rem !important;
            right: 1rem !important;
            width: 110px !important;
            height: 165px !important;
            z-index: 20 !important;
            border-radius: var(--radius-md) !important;
            border: 2px solid rgba(255, 255, 255, 0.45) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6) !important;
            cursor: pointer !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          .floating:hover {
            transform: scale(1.02);
          }
          
          .floating video {
            border-radius: var(--radius-md) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoConsultation;
