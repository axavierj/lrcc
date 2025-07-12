import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export async function authRequired(ctx, next) {
  try {
    const header = ctx.headers["authorization"];

    if (!header) ctx.throw(401, "Missing Authorization header");

    const token = header.split(" ")[1];

    if (!token) ctx.throw(401, "Invalid Authorization header");

    const payload = jwt.verify(token, JWT_SECRET, function (err, decoded) {
      if (err) {
        ctx.throw(401, "Invalid or expired token");
      }
      return decoded;
    });

    ctx.user = payload;
    return next();
  } catch {
    ctx.throw(401, "Invalid or expired token");
  }
}
