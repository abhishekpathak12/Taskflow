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

  // Edit mode: purani task ki details form mein bharna
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

  // Form input handle karna
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create aur Update API
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

      // Correct API URL
      const url = isEdit
        ? `${API_URL}/api/tasks/${editTask._id}`
        : `${API_URL}/api/tasks`;

      console.log("Request URL:", url);
      console.log("Request Method:", isEdit ? "PUT" : "POST");
      console.log("Request Data:", formData);

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Response ko pehle text ke form mein read karna
      const text = await response.text();

      console.log("API Status:", response.status);
      console.log("API Response:", text);

      let data = {};

      // JSON response parse karna
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid server response: ${text}`);
        }
      }

      // Agar API error return kare
      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`
        );
      }

      // Create / Update ke baad parent component ko data dena
      if (isEdit) {
        onTaskUpdated(data.data);
      } else {
        onTaskAdded(data.data);
      }

      // Form close
      onClose();
    } catch (error) {
      console.error("Task error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Form Header */}
      <div className="form-header">
        <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>

        <button type="button" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <label>Title</label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
        />

        {/* Description */}
        <label>Description</label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
        />

        {/* Category */}
        <label>Category</label>

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Example: Work"
        />

        {/* Due Date */}
        <label>Due Date</label>

        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />

        {/* Status */}
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

        {/* Buttons */}
        <div className="form-buttons">
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" disabled={loading}>
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