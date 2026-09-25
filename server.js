const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// =========================
// MongoDB Connection
// =========================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// =========================
// Product Schema
// =========================
const productSchema = new mongoose.Schema(
  {
    pid: {
      type: String,
      required: true,
      unique: true,
    },
    pname: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const Product = mongoose.model("Product", productSchema);

// =========================
// Test API
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Product API is running",
  });
});

// =========================
// Health Check API
// =========================
app.get("/health", async (req, res) => {
  try {
    // Kiểm tra kết nối MongoDB
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

// =========================
// GET ALL PRODUCTS
// =========================
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error getting products",
      error: error.message,
    });
  }
});

// =========================
// GET PRODUCT BY PID
// =========================
app.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findOne({
      pid: req.params.pid,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error getting product",
      error: error.message,
    });
  }
});

// =========================
// CREATE PRODUCT
// =========================
app.post("/products", async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;

    const product = new Product({
      pid,
      pname,
      price,
      quantity,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// =========================
// UPDATE PRODUCT
// =========================
app.put("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { pid: req.params.pid },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});

// =========================
// DELETE PRODUCT
// =========================
app.delete("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      pid: req.params.pid,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(`Product API is running on port ${PORT}`);
});