import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please add MONGO_URI in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export const connectDB = async () => {
  try {
    if (db) return db;

    await client.connect();

    db = client.db("study-nook");

    // await db.command({ ping: 1 });

    console.log(" Connected to MongoDB");

    return db;
  } catch (error) {
    console.log(" MongoDB Connection Error:", error);
  }
};

export const roomsCollection = () => {
  if (!db) {
    throw new Error("Database not connected");
  }

  return db.collection("rooms");
};

export const bookingCollection = () => {
  if (!db) {
    throw new Error("Database not connected");
  }

  return db.collection("booking");
};

export const userCollection = () => {
  if (!db) {
    throw new Error("Database not connected");
  }

  return db.collection("user");
};

