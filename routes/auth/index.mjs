import Router from "koa-router";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";
import { generateResetToken } from "../../resetToken/reset.mjs";
import { sendResetEmail } from "../../email/resend.mjs";

const authRouter = new Router();
const JWT_SECRET = process.env.JWT_SECRET;

authRouter.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.body = { message: "Email and password are required" };
    ctx.status = 400;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: email },
  });

  if (!user) {
    ctx.body = { message: "User not found" };
    ctx.status = 404;
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    ctx.body = { message: "Invalid password" };
    ctx.status = 401;
    return;
  }

  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  ctx.body = {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
    },
  };
});

authRouter.post("/register", async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.body = { message: "Email and password are required" };
    ctx.status = 400;
    return;
  }
  const errors = [];
  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("a number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("a special character");
  }

  if (errors.length > 0) {
    ctx.body = {
      message: `Password must include ${errors.join(", ")}.`,
    };
    ctx.status = 400;
    return;
  }

  // Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { username: email },
  });
  if (existingUser) {
    ctx.body = { message: "Email is already registered" };
    ctx.status = 409;
    return;
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      username: email,
      password: hashed,
    },
  });

  // Respond with 201 Created
  ctx.status = 201;
  ctx.body = { message: "User registered", user: { email } };
});

authRouter.post("/password-request", async (ctx) => {
  const { email } = ctx.request.body;

  if (!email) {
    ctx.body = { message: "Email is required" };
    ctx.status = 400;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: email },
  });

  if (!user) {
    ctx.body = { message: "User not found" };
    ctx.status = 404;
    return;
  }
  // Generate reset token
  const token = generateResetToken(user);

  // Send reset email
  try {
    await sendResetEmail({
      to: email,
      token,
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    ctx.body = { message: "Failed to send reset email" };
    ctx.status = 500;
    return;
  }

  ctx.body = { message: "Password reset link sent to your email" };
});

authRouter.post("/reset-password", async (ctx) => {
  const { token, password } = ctx.request.body;

  try {
    const payload = jwt.verify(
      token.trim(),
      process.env.JWT_RESET_SECRET,
      function (err, decoded) {
        console.log(decoded, err);

        if (err) {
          throw new Error("Invalid or expired token");
        }
        return decoded;
      }
    );
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) throw new Error("User not found");

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    ctx.body = { message: "Password updated successfully" };
    ctx.status = 200;
  } catch (err) {
    ctx.status = 400;
    ctx.body = { message: "Invalid or expired token" };
  }
});

export default authRouter;
