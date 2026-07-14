const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const tenantProfileRoutes = require("./routes/tenantProfileRoutes");
const listingRoutes = require("./routes/listingRoutes");
const compatibilityRoutes = require("./routes/compatibilityRoutes");
const interestRoutes = require("./routes/interestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supportRoutes = require("./routes/supportRoutes");

const app = express();

// Security middleware
app.use(helmet());

// CORS config
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tenant-profile", tenantProfileRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RentMate API is running"
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;