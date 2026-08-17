import { useEffect, useState } from "react";

const API_URL = "https://taskflow-backend-wq7l.onrender.com";

function TaskForm({
  onTaskAdded,
  onTaskUpdated,
  onClose,
  editTask,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    dueDate: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit mode में पुरानी Task की details form में भरना
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        description: editTask.description || "",
        category: editTask.category || "General",
        dueDate: editTask.dueDate
          ? new Date(editTask.dueDate).toISOString().split("T")[0]
          : "",
        status: editTask.status || "Pending",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "General",
        dueDate: "",
        status: "Pending",
      });
    }

    setError("");
  }, [editTask]);

  // Form input handle करना
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create और Update API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const isEdit = Boolean(editTask);

      const url = isEdit
        ? '${API_URL}/api/tasks/${editTask._id}'
        : '${API_URL}/api/tasks;'

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Read response safely because some servers may return an empty response
const text = await response.text();

let data = {};

if (text) {
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server returned an invalid response");
  }
}

if (!response.ok) {
  throw new Error(
    data.message || "Something went wrong"
  );
}

      if (isEdit) {
        onTaskUpdated(data.data);
      } else {
        onTaskAdded(data.data);
      }

      onClose();
    } catch (error) {
      console.error("Task error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">

      {/* Form Header */}
      <div className="form-header">
        <h2>
          {editTask ? "Edit Task" : "Add New Task"}
        </h2>

        <button
          type="button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <label>Title</label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
        />

        <label>Description</label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
        />

        <label>Category</label>

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Example: Work"
        />

        <label>Due Date</label>

        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />

        <label>Status</label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <div className="form-buttons">

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? editTask
                ? "Updating..."
                : "Adding..."
              : editTask
              ? "Update Task"
              : "Add Task"}
          </button>

        </div>
      </form>
    </div>
  );
}

export default TaskForm;