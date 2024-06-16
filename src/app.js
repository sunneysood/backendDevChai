import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import logger from "./utils/logger.js";
import morgan from "morgan";
//routes import
import userRouter from "./routes/user.routes.js";

const morganFormat = ":method :url :status :response-time ms";

const app = express();

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kB" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


//routes decleration
app.use("/api/v1/users", userRouter);

export default app;
