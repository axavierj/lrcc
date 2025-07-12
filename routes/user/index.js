import Router from "koa-router";
import prisma from "../../prisma/prismaClient.js";
import { authRequired } from "./../../middleware/auth.js";
import bcrypt from "bcryptjs";

const userRouter = new Router({
  prefix: "/user",
});

userRouter.patch("/email", authRequired, async (ctx) => {
  const { email } = ctx.request.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ctx.status = 400;
    ctx.body = { message: "Invalid email format" };
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    ctx.status = 409;
    ctx.body = { message: "Email already in use" };
    return;
  }

  const updated = await prisma.user.update({
    where: { id: ctx.state.user.id },
    data: { email },
  });

  ctx.body = {
    message: "Email updated",
    user: { id: updated.id, email: updated.email },
  };
});

userRouter.patch("/password", authRequired, async (ctx) => {
  console.log("Updating password for user:", ctx.request.body);
  const { password } = ctx.request.body;

  if (!password || password.length < 8) {
    ctx.status = 400;
    ctx.body = {
      message: "Password must be at least 8 characters long",
    };
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

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: ctx.user.id },
    data: { password: hashed },
  });

  ctx.body = { message: "Password updated successfully" };
});

export default userRouter;
