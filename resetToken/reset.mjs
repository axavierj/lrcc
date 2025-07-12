// utils/token.js
import jwt from "jsonwebtoken";

const RESET_SECRET = process.env.JWT_RESET_SECRET || "super-secret-reset"; // use a separate secret
const RESET_EXPIRATION = "15m"; // or "1h", "24h", etc.

export function generateResetToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.username, // if you're using 'username' as email
    },
    RESET_SECRET,
    { expiresIn: RESET_EXPIRATION }
  );
}
export function verifyResetToken(token) {
  try {
    return jwt.verify(token, JWT_RESET_SECRET);
  } catch (error) {
    console.error("Invalid reset token:", error);
    return null; // or throw an error if you prefer
  }
}
