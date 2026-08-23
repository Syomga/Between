import "dotenv/config";
import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { dialoguesRouter } from "./routes/dialogues";
import { messagesRouter } from "./routes/messages";
import { preferencesRouter } from "./routes/preferences";
import { usersRouter } from "./routes/users";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { uploadsDirectory } from "./middleware/upload";
import { createSocketServer } from "./socket";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/dialogues", dialoguesRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/users/preferences", preferencesRouter);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api|\/uploads|\/socket\.io).*/, (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

createSocketServer(server);

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
