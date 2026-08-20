import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user
 * @param {string} userId
 * @param {string} role
 * @param {object} extraPayload
 * @returns {string} JWT Token
 */
export const generateToken = (userId, role, extraPayload = {}) => {
  return jwt.sign(
    {
      id: userId,
      _id: userId,
      role,
      ...extraPayload,
    },
    process.env.JWT_SECRET || "default_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export default generateToken;
