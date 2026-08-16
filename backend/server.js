const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.send("TaskFlow API is running");
});

// Task CRUD routes
app.use("/api/tasks", taskRoutes);

// Temporary Create Test
app.get("/test-create", async (req, res) => {
  try {
    const task = await Task.create({
      title: "Learn React",
      description: "Learn React basics",
      category: "Learning",
      dueDate: "2026-08-16",
      status: "Pending"
    });

    res.json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Temporary Update Test
app.get("/test-update", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      "6a808dfaafd18ff6a3c1a4a4",
      {
        status: "Done",
        category: "Frontend"
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/test-delete", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(
      "6a8043c947efa7f4eb7ee0bb"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });