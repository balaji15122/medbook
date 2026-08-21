import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import socketService from "../../services/socketService.js";
import appointmentService from "../../services/appointmentService.js";
import CameraStreamCanvas from "./CameraStreamCanvas.jsx";

export const VideoConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <CameraStreamCanvas
        appointmentId={appointmentId}
        user={user}
        onEndCall={handleEndCall}
      />

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
          justify-content: center;
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
