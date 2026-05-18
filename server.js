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
    res.status(200).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    res.status(501).json({ success: false, message: "Internal Server Error" });
  }
});

// get rooms with searching

app.get("/rooms", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const amenities = req.query.amenities?.trim();

    let queryRoom = {};

    if (search) {
      queryRoom.roomName = {
        $regex: search,
        $options: "i",
      };
    }

    if (amenities) {
      queryRoom.amenities = {
        $in: [amenities],
      };
    }

    const resultRoom = await roomsCollection().find(queryRoom).toArray();

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: resultRoom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
