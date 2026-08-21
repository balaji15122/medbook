import jwt from "jsonwebtoken";

/**
 * Generate a cryptographically signed JWT access token for LiveKit rooms.
 * Uses jsonwebtoken to generate the exact claim structure expected by the LiveKit SFU.
 * 
 * @param {string} roomName - The name of the room to join
 * @param {string} participantIdentity - The identity of the participant
 * @param {boolean} [isPublisher=true] - Whether the participant can publish stream
 * @returns {string} The signed JWT token
 */
export function generateLiveKitToken(roomName, participantIdentity, isPublisher = true) {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";

  const payload = {
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: isPublisher,
      canSubscribe: true,
    },
    metadata: "",
  };

  return jwt.sign(payload, apiSecret, {
    issuer: apiKey,
    subject: participantIdentity,
    expiresIn: "2h",
  });
}
