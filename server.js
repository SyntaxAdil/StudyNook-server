import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { roomsCollection, connectDB, userCollection } from "./config/db.js";
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

// get rooms with searching + amenities

app.get("/rooms", async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const amenities = req.query.amenities?.trim();
    const minRate = req.query.min?.trim();
    const maxRate = req.query.max?.trim();

    let queryRoom = {};

    if (search) {
      queryRoom.roomName = {
        $regex: search,
        $options: "i",
      };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());

      queryRoom.amenities = {
        $in: amenitiesArray,
      };
    }

    if (minRate || maxRate) {
      queryRoom.hourlyRate = {};

      if (minRate) {
        queryRoom.hourlyRate.$gte = Number(minRate);
      }

      if (maxRate) {
        queryRoom.hourlyRate.$lte = Number(maxRate);
      }
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

// available study  room home route
app.get("/feautred-rooms", async (req, res) => {
  try {
    const resultRoom = await roomsCollection()
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

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

// get a rooms by id

app.get("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const resultRoom = await roomsCollection()
      .find({ _id: new ObjectId(id) })
      .toArray();
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

// provide user data

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const user = await userCollection()
      .find({ _id: new ObjectId(id) })
      .toArray();
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User data fetched successfully",
        data: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "User Not found",
      });
    }
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
