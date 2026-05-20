# 📚 StudyNook - Backend API

A robust Express.js backend API for StudyNook, a library study room booking platform where users can list, browse, and book study rooms with advanced conflict detection and secure JWT authentication.

## 👨‍💻 Developer Information

**Name:** Abdur Rahman Adil  
**GitHub:** [@SyntaxAdil](https://github.com/SyntaxAdil)  
**Batch:** Programming Hero - Batch 13  
**Assignment:** Assignment 09

---

## 🚀 Features

- **Secure Authentication:** JWT-based authentication with HTTP-only cookies using better-auth integration
- **Room Management:** Full CRUD operations for study room listings
- **Smart Booking System:** Advanced conflict detection to prevent double bookings
- **Owner Authorization:** Role-based access control for room updates and deletions
- **Advanced Search & Filter:** Search by name, filter by amenities, and price range
- **Real-time Booking Count:** Dynamic tracking of room bookings
- **User Dashboard:** Personalized bookings and listings management

---

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with native driver
- **Authentication:** JOSE (JWT verification), better-auth integration
- **Security:** HTTP-only cookies, CORS protection
- **Environment:** dotenv for configuration

---

## 📋 API Endpoints

### 🔓 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | Get all rooms with search & filters |
| GET | `/featured-rooms` | Get latest 6 rooms |
| GET | `/rooms/:id` | Get single room details |

### 🔒 Protected Routes (Authentication Required)

#### Room Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rooms` | Create a new room (owner only) |
| PATCH | `/rooms/:id` | Update room (owner only) |
| DELETE | `/rooms/:id` | Delete room (owner only) |
| GET | `/my-listing` | Get user's listed rooms |

#### Booking Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/book-room` | Create a new booking |
| GET | `/my-bookings` | Get user's bookings |
| PATCH | `/book-room/:id/cancel` | Cancel a booking |

---

## 🔍 Query Parameters

### Search & Filter (GET /rooms)

```
GET /rooms?search=quiet&amenities=Wi-Fi,Projector&min=5&max=20
```

- `search` - Search by room name (case-insensitive)
- `amenities` - Filter by amenities (comma-separated)
- `min` - Minimum hourly rate
- `max` - Maximum hourly rate

---

## 🔐 Authentication Flow

1. User logs in via frontend (Next.js with better-auth)
2. Better-auth generates JWT and stores in HTTP-only cookie
3. Frontend sends requests with `credentials: 'include'`
4. Backend verifies JWT using JWKS from `/api/auth/jwks`
5. Protected routes accessible after successful verification

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (must match frontend)
BETTER_AUTH_SECRET=your_secret_key_here
```

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/SyntaxAdil/studynook-backend.git
cd studynook-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

---

## 📚 Key Features Implementation

### 🔒 JWT Authentication with HTTP-only Cookies
```javascript
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.["better-auth.session_token"];
  const { payload } = await jwtVerify(token, JWKS);
  req.user = { id: payload.sub, email: payload.email };
  next();
};
```

### 🚫 Booking Conflict Detection
```javascript
const conflictQuery = {
  roomId: body.roomId,
  date: body.date,
  status: "confirmed",
  $or: [{ start: { $lt: end }, end: { $gt: start } }]
};
```

### 🔍 Advanced Search with MongoDB
```javascript
// Regex search + Amenities filter + Price range
queryRoom.roomName = { $regex: search, $options: "i" };
queryRoom.amenities = { $in: amenitiesArray };
queryRoom.hourlyRate = { $gte: minRate, $lte: maxRate };
```

### 📊 Array Operations ($push & $pull)
```javascript
// Add booking to user's bookings array
await userCollection().updateOne(
  { _id: new ObjectId(userId) },
  { $push: { bookings: bookingId } }
);

// Remove booking on cancellation
await userCollection().updateOne(
  { _id: new ObjectId(userId) },
  { $pull: { bookings: new ObjectId(bookingId) } }
);
```

---

## 🗂️ Database Collections

### `rooms`
```javascript
{
  _id: ObjectId,
  roomName: String,
  description: String,
  image: String,
  floor: String,
  capacity: Number,
  hourlyRate: Number,
  amenities: Array,
  userId: String,
  bookingCount: Number,
  createdAt: Date
}
```

### `bookings`
```javascript
{
  _id: ObjectId,
  roomId: String,
  userId: String,
  bookedBy: String,
  date: String,
  start: Number,
  end: Number,
  totalCost: Number,
  status: String, // "confirmed" | "cancelled"
  specialNote: String,
  createdAt: Date
}
```

### `users` (managed by better-auth)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  image: String,
  bookings: Array<ObjectId>
}
```

---

## 🔒 Security Features

- ✅ HTTP-only cookies prevent XSS attacks
- ✅ CORS configuration with credentials
- ✅ JWT verification using JWKS
- ✅ Owner-based authorization checks
- ✅ Input validation on all routes
- ✅ MongoDB injection prevention with ObjectId validation

---

## 🚦 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (booking collision)
- `500` - Internal Server Error

---

## 🧪 Testing the API

### Using cURL
```bash
# Get all rooms
curl http://localhost:5000/rooms

# Get featured rooms
curl http://localhost:5000/featured-rooms

# Search rooms
curl "http://localhost:5000/rooms?search=study&min=5&max=15"
```

### Using Postman/Thunder Client
1. Import the provided collection (if available)
2. Set environment variable `BASE_URL=http://localhost:5000`
3. For protected routes, ensure cookies are enabled

---

## 📝 Assignment Requirements Met

✅ Minimum 8 notable GitHub commits  
✅ JWT with HTTP-only cookies  
✅ CRUD operations for rooms  
✅ Booking system with conflict detection  
✅ Search & filter functionality  
✅ $push and $pull operators for bookings array  
✅ Owner-based authorization  
✅ Booking count tracking  
✅ Environment variables secured in .env  

---

## 🤝 Contributing

This is an assignment project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is created for educational purposes as part of Programming Hero's Web Development Course.

---

## 📞 Contact

**Abdur Rahman Adil**  
- GitHub: [@SyntaxAdil](https://github.com/SyntaxAdil)
- Assignment: Programming Hero Batch 13 - Assignment 09

---

##  Acknowledgments

- Programming Hero for the comprehensive web development course
- better-auth team for the excellent authentication library
- MongoDB team for the powerful database solution

---

<div align="center">

**Made with ❤️ by Abdur Rahman Adil**

⭐ Star this repo if you find it helpful!

</div>