const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Product API is running",
  });
});

// Health Check API
app.get("/health", async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;

    if (mongoState === 1) {
      return res.status(200).json({
        status: "healthy",
        database: "connected",
      });
    }

    return res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Product routes
app.use("/products", productRoutes);

module.exports = app;
