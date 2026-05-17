import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import {
  roomsCollection,
  connectDB,
} from "./config/db.js";
import { ObjectId } from "mongodb";

const port = process.env.PORT;

connectDB();






app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
