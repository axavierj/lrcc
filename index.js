import Koa from "koa";
import bodyParser from "koa-bodyparser";
import recipesRouter from "./routes/recipe/index.mjs";
import cors from "@koa/cors";
import authRouter from "./routes/auth/index.mjs";
import userRouter from "./routes/user/index.js";
import KoaRatelimit from "koa-ratelimit";

const app = new Koa();

app.use(
  cors({
    origin: "https://webproject-yrz5.onrender.com", // Allow all origins, adjust as needed for security
    allowMethods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use(bodyParser());

app.use(
  KoaRatelimit({
    driver: "memory",
    db: new Map(),
    duration: 60000, // 1 minute
    errorMessage: "Too many requests, please try again later.",
    id: (ctx) => ctx.ip,
    max: 100, // Limit each IP to 100 requests per minute
    disableHeader: false,
  })
);

app.use(recipesRouter.routes());
app.use(recipesRouter.allowedMethods());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
