import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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
    folder: "movie-platform",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Start server only after database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  watchlist: [{ type: String }], // Movie IDs
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, default: "" },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isApproved: { type: Boolean, default: true }, // Auto-approve blogs on creation
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model("Blog", blogSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

// Create admin user if it doesn't exist
// Admin user protection is handled in the admin toggle endpoint

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

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
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
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Movie Routes
app.get("/api/movies", async (req, res) => {
  try {
    const response = await axios.get(process.env.MOVIE_API_URL);
    // Handle different response structures
    const movies = response.data.movies || response.data || [];
    res.json({ movies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res
      .status(500)
      .json({ message: "Error fetching movies", error: error.message });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(process.env.MOVIE_API_URL);
    const movies = response.data.movies || response.data || [];
    const movie = movies.find((m) => m._id === id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res
      .status(500)
      .json({ message: "Error fetching movie", error: error.message });
  }
});

// Blog Routes
app.get("/api/blogs", async (req, res) => {
  try {
    const { approved } = req.query;
    // Show all blogs by default since they're auto-approved
    // Only filter by approval status if explicitly requested (for admin purposes)
    const filter =
      approved === "false" ? { isApproved: false } : { isApproved: true };

    const blogs = await Blog.find(filter)
      .populate("author", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific blog by ID
app.get("/api/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate("author", "username avatar")
      .populate("comments.user", "username avatar");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Only return approved blogs for regular users (since blogs are auto-approved)
    if (!blog.isApproved) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/api/blogs",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, tags, imageUrl } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }

      // Determine image source - either uploaded file or provided URL
      let finalImageUrl = "";
      if (req.file) {
        // If file was uploaded, use Cloudinary URL
        finalImageUrl = req.file.path;
      } else if (imageUrl && imageUrl.trim()) {
        // If image URL was provided, use it
        finalImageUrl = imageUrl.trim();
      }

      const blog = new Blog({
        title: title.trim(),
        content: content.trim(),
        author: req.user.userId,
        image: finalImageUrl,
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      });

      await blog.save();
      await blog.populate("author", "username avatar");

      res.status(201).json({
        message: "Blog created successfully",
        blog,
      });
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put("/api/blogs/:id/like", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const likeIndex = blog.likes.indexOf(userId);
    if (likeIndex > -1) {
      blog.likes.splice(likeIndex, 1);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();
    res.json({ message: "Blog like updated", likes: blog.likes.length });
  } catch (error) {
    console.error("Error updating blog like:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/blogs/:id/comments", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push({
      user: userId,
      text,
    });

    await blog.save();
    await blog.populate("comments.user", "username avatar");

    res.status(201).json({
      message: "Comment added successfully",
      comment: blog.comments[blog.comments.length - 1],
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's blogs
app.get("/api/blogs/user", verifyToken, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Review Routes
app.get("/api/reviews", async (req, res) => {
  try {
    const { movieId, approved } = req.query;
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (approved !== "false") filter.isApproved = true;

    const reviews = await Review.find(filter)
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/reviews", verifyToken, async (req, res) => {
  try {
    const { movieId, movieTitle, rating, content } = req.body;

    if (!movieId || !movieTitle || !rating || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      movieId,
      user: req.user.userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this movie" });
    }

    const review = new Review({
      movieId,
      movieTitle,
      user: req.user.userId,
      rating,
      content,
    });

    await review.save();
    await review.populate("user", "username avatar");

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/reviews/:id/like", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const likeIndex = review.likes.indexOf(userId);
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(userId);
    }

    await review.save();
    res.json({ message: "Review like updated", likes: review.likes.length });
  } catch (error) {
    console.error("Error updating review like:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's reviews
app.get("/api/reviews/user", verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.userId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Profile Routes
app.get("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get comprehensive user profile data
app.get("/api/users/profile/complete", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's blogs
    const userBlogs = await Blog.find({ author: req.user.userId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    // Get user's reviews
    const userReviews = await Review.find({ user: req.user.userId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    // Get watchlist movies details from external API
    let watchlistMovies = [];
    if (user.watchlist && user.watchlist.length > 0) {
      try {
        const moviesResponse = await axios.get(process.env.MOVIE_API_URL);
        const allMovies = moviesResponse.data.movies || moviesResponse.data;

        // Filter movies that are in user's watchlist
        watchlistMovies = allMovies.filter((movie) =>
          user.watchlist.includes(movie._id)
        );
      } catch (error) {
        console.error("Error fetching watchlist movies:", error);
      }
    }

    res.json({
      user,
      blogs: userBlogs,
      reviews: userReviews,
      watchlistMovies,
    });
  } catch (error) {
    console.error("Error fetching complete profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/users/profile",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { username, bio } = req.body;
      const updateData = {};

      if (username) updateData.username = username;
      if (bio) updateData.bio = bio;
      if (req.file) updateData.avatar = req.file.path;

      const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
        new: true,
      }).select("-password");

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put("/api/users/watchlist/:movieId", verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const movieIndex = user.watchlist.indexOf(movieId);
    if (movieIndex > -1) {
      user.watchlist.splice(movieIndex, 1);
    } else {
      user.watchlist.push(movieId);
    }

    await user.save();
    res.json({
      message: "Watchlist updated",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Routes
app.get("/api/admin/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalBlogs = await Blog.countDocuments();
    const totalReviews = await Review.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ isApproved: false });

    res.json({
      totalUsers,
      totalBlogs,
      totalReviews,
      pendingBlogs,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/admin/users/:id/admin",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      // Prevent removing admin rights from ayush.bhrg@gmail.com
      const user = await User.findById(id);
      if (user.email === "ayush.bhrg@gmail.com" && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Cannot remove admin rights from this user" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isAdmin },
        { new: true }
      ).select("-password");

      res.json({
        message: "User admin status updated",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put(
  "/api/admin/blogs/:id/approve",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const blog = await Blog.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
      ).populate("author", "username avatar");

      res.json({
        message: "Blog approval status updated",
        blog,
      });
    } catch (error) {
      console.error("Error updating blog approval:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put(
  "/api/admin/reviews/:id/approve",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const review = await Review.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
      ).populate("user", "username avatar");

      res.json({
        message: "Review approval status updated",
        review,
      });
    } catch (error) {
      console.error("Error updating review approval:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Analytics endpoint
app.get("/api/admin/analytics", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { timeRange } = req.query;

    // Calculate date range
    let dateFilter = {};
    if (timeRange && timeRange !== "all") {
      const now = new Date();
      const days =
        timeRange === "7d"
          ? 7
          : timeRange === "30d"
          ? 30
          : timeRange === "90d"
          ? 90
          : 365;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get basic counts
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalBlogs = await Blog.countDocuments();
    const totalReviews = await Review.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ isApproved: false });

    // Get new users in time range
    const newUsersThisMonth = await User.countDocuments({
      ...dateFilter,
      isAdmin: false,
    });

    // Calculate total likes and views
    const blogsWithLikes = await Blog.aggregate([
      { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } },
    ]);

    const reviewsWithLikes = await Review.aggregate([
      { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } },
    ]);

    const totalLikes =
      (blogsWithLikes[0]?.totalLikes || 0) +
      (reviewsWithLikes[0]?.totalLikes || 0);

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating = avgRatingResult[0]?.averageRating || 0;

    // For demo purposes, setting totalViews (you would track this separately in a real app)
    const totalViews = Math.floor(totalLikes * 2.5); // Estimated views based on likes

    res.json({
      totalUsers,
      totalBlogs,
      totalReviews,
      pendingBlogs,
      totalLikes,
      totalViews,
      newUsersThisMonth,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create admin user
app.post(
  "/api/admin/create-admin",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User with this email or username already exists",
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);

      // Create admin user
      const newAdmin = new User({
        username,
        email,
        password: hashedPassword,
        isAdmin: true,
      });

      await newAdmin.save();

      res.status(201).json({
        message: "Admin user created successfully",
        user: {
          _id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          isAdmin: newAdmin.isAdmin,
        },
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all comments for admin moderation
app.get("/api/admin/comments", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const blogComments = await Blog.aggregate([
      { $unwind: "$comments" },
      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "comments.user",
        },
      },
      { $unwind: "$comments.user" },
      {
        $project: {
          _id: "$comments._id",
          content: "$comments.text",
          createdAt: "$comments.createdAt",
          user: {
            _id: "$comments.user._id",
            username: "$comments.user.username",
            avatar: "$comments.user.avatar",
          },
          type: { $literal: "blog" },
          parentId: "$_id",
          parentTitle: "$title",
        },
      },
    ]);

    const reviewComments = await Review.aggregate([
      { $match: { comments: { $exists: true, $ne: [] } } },
      { $unwind: "$comments" },
      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "comments.user",
        },
      },
      { $unwind: "$comments.user" },
      {
        $project: {
          _id: "$comments._id",
          content: "$comments.text",
          createdAt: "$comments.createdAt",
          user: {
            _id: "$comments.user._id",
            username: "$comments.user.username",
            avatar: "$comments.user.avatar",
          },
          type: { $literal: "review" },
          parentId: "$_id",
          parentTitle: { $concat: ["Review for ", "$movieTitle"] },
        },
      },
    ]);

    const allComments = [...blogComments, ...reviewComments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete comment
app.delete(
  "/api/admin/comments/:commentId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { commentId } = req.params;
      const { type, parentId } = req.body;

      if (type === "blog") {
        await Blog.findByIdAndUpdate(parentId, {
          $pull: { comments: { _id: commentId } },
        });
      } else if (type === "review") {
        await Review.findByIdAndUpdate(parentId, {
          $pull: { comments: { _id: commentId } },
        });
      } else {
        return res.status(400).json({ message: "Invalid comment type" });
      }

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Search Routes
app.get("/api/search", async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query required" });
    }

    const searchQuery = q.trim();
    const results = {};

    // Search movies
    if (!type || type === "movies") {
      try {
        const response = await axios.get(process.env.MOVIE_API_URL);
        const allMovies = response.data.movies || response.data || [];
        const movies = allMovies.filter(
          (movie) =>
            movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genre?.some((g) =>
              g.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            movie.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.cast?.some((c) =>
              c.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        results.movies = movies;
      } catch (movieError) {
        console.error("Error searching movies:", movieError);
        results.movies = [];
      }
    }

    // Search blogs
    if (!type || type === "blogs") {
      try {
        const blogs = await Blog.find({
          isApproved: true,
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { content: { $regex: searchQuery, $options: "i" } },
            { tags: { $in: [new RegExp(searchQuery, "i")] } },
          ],
        }).populate("author", "username avatar");
        results.blogs = blogs;
      } catch (blogError) {
        console.error("Error searching blogs:", blogError);
        results.blogs = [];
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Routes
// Get all blogs for admin (with approval status filter)
app.get("/api/admin/blogs", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { approved } = req.query;
    let filter = {};

    if (approved !== undefined && approved !== null && approved !== "null") {
      filter.isApproved = approved === "true";
    }

    const blogs = await Blog.find(filter)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve blog
app.put("/api/admin/blogs/:id/approve", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog approved successfully", blog });
  } catch (error) {
    console.error("Error approving blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete blog (admin)
app.delete("/api/admin/blogs/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all reviews for admin (with approval status filter)
app.get("/api/admin/reviews", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const reviews = await Review.find({})
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete review (admin)
app.delete("/api/admin/reviews/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create admin user
app.post("/api/admin/create-admin", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create new admin user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Movie Platform API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Public endpoint to get user count for homepage stats
app.get("/api/users/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments({ isAdmin: false });
    res.json({ userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Server error", userCount: 0 });
  }
});
