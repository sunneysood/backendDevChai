import dotenv from "dotenv";
import connectDB from "./db/db_index.js";
import app from "./app.js";

dotenv.config({ path: "./env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`MONGODB Server running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MONGODB Connection Failed: ${error}`);
  });
