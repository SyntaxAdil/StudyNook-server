import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

import {
  roomsCollection,
  connectDB,
  bookingCollection,
  userCollection,
} from "./config/db.js";

import { ObjectId } from "mongodb";

const port = process.env.PORT || 5000;

connectDB();

// create room

app.post("/rooms", async (req, res) => {
  try {
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide valid data",
      });
    }

    const newRoom = {
      ...body,
      bookingCount: 0,
      createdAt: new Date(),
    };

    const result = await roomsCollection().insertOne(newRoom);

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// get all rooms

app.get("/rooms", async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const amenities = req.query.amenities?.trim();

    const minRate = req.query.min?.trim();

    const maxRate = req.query.max?.trim();

    let queryRoom = {};

    // search

    if (search) {
      queryRoom.roomName = {
        $regex: search,
        $options: "i",
      };
    }

    // amenities filter

    if (amenities) {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());

      queryRoom.amenities = {
        $in: amenitiesArray,
      };
    }

    // min max filter

    if (minRate || maxRate) {
      queryRoom.hourlyRate = {};

      if (minRate) {
        queryRoom.hourlyRate.$gte = Number(minRate);
      }

      if (maxRate) {
        queryRoom.hourlyRate.$lte = Number(maxRate);
      }
    }

    const result = await roomsCollection().find(queryRoom).toArray();

    return res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// featured rooms

app.get("/featured-rooms", async (req, res) => {
  try {
    const result = await roomsCollection()
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Featured rooms fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// single room

app.get("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await roomsCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// update room

app.patch("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const body = req.body;

    const room = await roomsCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const result = await roomsCollection().updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: body,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// delete room

app.delete("/rooms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const room = await roomsCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await bookingCollection().deleteMany({
      roomId: id,
    });

    const result = await roomsCollection().deleteOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// create booking

app.post("/book-room", async (req, res) => {
  try {
    const body = req.body;

    const start = Number(body.start);

    const end = Number(body.end);

    // date validation

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(body.date);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Select valid date",
      });
    }

    // time validation

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking time",
      });
    }

    // conflict check

    const conflictQuery = {
      roomId: body.roomId,
      date: body.date,
      status: "confirmed",

      $or: [
        {
          start: { $lt: end },
          end: { $gt: start },
        },
      ],
    };

    const existingBooking = await bookingCollection()
      .find(conflictQuery)
      .toArray();

    if (existingBooking.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This slot already booked",
      });
    }

    const newBooking = {
      ...body,
      start,
      end,
      status: "confirmed",
      createdAt: new Date(),
    };

    const result = await bookingCollection().insertOne(newBooking);

    // push booking id

    await userCollection().updateOne(
      {
        _id: new ObjectId(body.bookedBy),
      },
      {
        $push: {
          bookings: result.insertedId,
        },
      },
    );

    // increase booking count

    await roomsCollection().updateOne(
      {
        _id: new ObjectId(body.roomId),
      },
      {
        $inc: {
          bookingCount: 1,
        },
      },
    );

    return res.status(201).json({
      success: true,
      message: "Room booked successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// my bookings

app.get("/my-bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingCollection()
      .find({
        bookedBy: id,
      })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// cancel booking

app.patch("/book-room/:id/cancel", async (req, res) => {
  try {
    const id = req.params.id;

    const body = req.body;

    const booking = await bookingCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const result = await bookingCollection().updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "cancelled",
        },
      },
    );

    // remove booking id

    await userCollection().updateOne(
      {
        _id: new ObjectId(body.bookedBy),
      },
      {
        $pull: {
          bookings: new ObjectId(id),
        },
      },
    );

    // decrease booking count

    await roomsCollection().updateOne(
      {
        _id: new ObjectId(body.roomId),
      },
      {
        $inc: {
          bookingCount: -1,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result,
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
