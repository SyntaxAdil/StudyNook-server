import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { roomsCollection, connectDB } from "./config/db.js";
import { ObjectId } from "mongodb";

const port = process.env.PORT;

connectDB();

// create a new room

app.post("/rooms", async (req, res) => {
  try {
    const body = req.body;

    if (!body)
      res.status(400).json({ success: false, message: "Give valid data" });

    const newRoom = await roomsCollection().insertOne(body);
    res.status(200).json({ success: true, message: "Room created successfully" });
  } catch (error) {
    res.status(501).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
