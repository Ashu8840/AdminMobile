import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "movie-posters",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 750, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  requestDate: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Movie Schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true },
  genre: [{ type: String, required: true }],
  director: { type: String, required: true },
  cast: [{ type: String, required: true }],
  posterUrl: { type: String, required: true },
  trailerUrl: { type: String },
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Movie = mongoose.model("Movie", movieSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin required." });
  }
  next();
};

// Routes

// User registration/request
app.post("/api/auth/request", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create new user (not approved by default)
    const user = new User({
      email,
      password: hashedPassword,
      isAdmin: false,
      isApproved: false,
    });

    await user.save();

    res.status(201).json({
      message: "Request submitted successfully. Wait for admin approval.",
      user: { email: user.email, isApproved: user.isApproved },
    });
  } catch (error) {
    console.error("Request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is approved (admins are automatically approved)
    if (!user.isApproved && !user.isAdmin) {
      return res.status(403).json({
        message: "Account not approved yet. Please wait for admin approval.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all pending requests (Admin only)
app.get("/api/admin/requests", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pendingRequests = await User.find({
      isApproved: false,
      isAdmin: false,
    }).select("-password");

    res.json(pendingRequests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve user request (Admin only)
app.patch(
  "/api/admin/approve/:userId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { isApproved: true },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User approved successfully", user });
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reject user request (Admin only)
app.delete(
  "/api/admin/reject/:userId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User request rejected and removed" });
    } catch (error) {
      console.error("Reject user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all movies
app.get("/api/movies", verifyToken, async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    console.error("Get movies error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new movie (Admin only)
app.post(
  "/api/movies",
  verifyToken,
  verifyAdmin,
  upload.single("poster"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        year,
        genre,
        director,
        cast,
        trailerUrl,
        averageRating,
      } = req.body;

      if (!title || !description || !year || !director) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      let posterUrl = "";
      if (req.file) {
        posterUrl = req.file.path; // Cloudinary URL
      }

      const movie = new Movie({
        title,
        description,
        year: parseInt(year),
        genre: Array.isArray(genre)
          ? genre
          : genre.split(",").map((g) => g.trim()),
        director,
        cast: Array.isArray(cast) ? cast : cast.split(",").map((c) => c.trim()),
        posterUrl,
        trailerUrl: trailerUrl || "",
        averageRating: parseFloat(averageRating) || 0,
      });

      await movie.save();

      res.status(201).json({
        message: "Movie created successfully",
        movie,
      });
    } catch (error) {
      console.error("Create movie error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update movie (Admin only)
app.put(
  "/api/movies/:movieId",
  verifyToken,
  verifyAdmin,
  upload.single("poster"),
  async (req, res) => {
    try {
      const { movieId } = req.params;
      const {
        title,
        description,
        year,
        genre,
        director,
        cast,
        trailerUrl,
        averageRating,
      } = req.body;

      const updateData = {
        title,
        description,
        year: parseInt(year),
        genre: Array.isArray(genre)
          ? genre
          : genre.split(",").map((g) => g.trim()),
        director,
        cast: Array.isArray(cast) ? cast : cast.split(",").map((c) => c.trim()),
        trailerUrl: trailerUrl || "",
        averageRating: parseFloat(averageRating) || 0,
      };

      // If new poster is uploaded, update poster URL
      if (req.file) {
        updateData.posterUrl = req.file.path;
      }

      const movie = await Movie.findByIdAndUpdate(movieId, updateData, {
        new: true,
      });

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.json({
        message: "Movie updated successfully",
        movie,
      });
    } catch (error) {
      console.error("Update movie error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete movie (Admin only)
app.delete(
  "/api/movies/:movieId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { movieId } = req.params;

      const movie = await Movie.findByIdAndDelete(movieId);

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Delete movie error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get single movie
app.get("/api/movies/:movieId", verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    console.error("Get movie error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Free access to all movies (no authentication required)
app.get("/free", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      total: movies.length,
      movies: movies,
    });
  } catch (error) {
    console.error("Free movies access error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      movies: [],
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
