import jwt from "jsonwebtoken";

export default function videoCallSocket(io) {
  io.on("connection", (socket) => {
    console.log("New socket connection established:", socket.id);

    // Join room event
    socket.on("join-room", ({ roomId, token }) => {
      try {
        if (!token) {
          socket.emit("error-msg", { message: "Access denied. Token missing." });
          return;
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "ERIEUHP9CEDRY7UW347jrdbjbgdhjfbirejheb"
        );

        if (decoded.roomId !== roomId) {
          socket.emit("error-msg", { message: "Access denied. Invalid room ID." });
          return;
        }

        // Attach properties to socket object for tracking
        socket.roomId = roomId;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        socket.join(roomId);
        console.log(`User ${decoded.userId} (${decoded.role}) joined room: ${roomId}`);

        // Broadcast to other users in the room
        socket.to(roomId).emit("user-joined", {
          socketId: socket.id,
          userId: decoded.userId,
          role: decoded.role,
        });

        // Send list of current peers in the room to the newly joined peer
        const clients = io.sockets.adapter.rooms.get(roomId);
        const peers = [];
        if (clients) {
          for (const clientSocketId of clients) {
            if (clientSocketId !== socket.id) {
              const clientSocket = io.sockets.sockets.get(clientSocketId);
              peers.push({
                socketId: clientSocketId,
                userId: clientSocket?.userId,
                role: clientSocket?.userRole,
              });
            }
          }
        }
        socket.emit("room-peers", { peers });

      } catch (err) {
        console.error("Socket room join token error:", err.message);
        socket.emit("error-msg", { message: "Invalid or expired join token." });
      }
    });

    // Signaling: Forward offer to the target peer
    socket.on("offer", ({ targetSocketId, offer }) => {
      socket.to(targetSocketId).emit("offer", {
        senderSocketId: socket.id,
        offer,
      });
    });

    // Signaling: Forward answer to the target peer
    socket.on("answer", ({ targetSocketId, answer }) => {
      socket.to(targetSocketId).emit("answer", {
        senderSocketId: socket.id,
        answer,
      });
    });

    // Signaling: Forward ICE candidates to the target peer
    socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
      socket.to(targetSocketId).emit("ice-candidate", {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Handle leaving the room explicitly
    socket.on("leave-room", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", {
          socketId: socket.id,
          role: socket.userRole,
        });
        socket.leave(socket.roomId);
        console.log(`Socket ${socket.id} left room ${socket.roomId}`);
        socket.roomId = null;
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-left", {
          socketId: socket.id,
          role: socket.userRole,
        });
      }
      console.log("Socket connection closed:", socket.id);
    });
  });
}
