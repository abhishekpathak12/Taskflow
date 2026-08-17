import { useEffect, useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";

// Live Backend API URL
const API_URL = "https://taskflow-backend-wq7l.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Search and Status Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get Tasks
  useEffect(() => {
    fetch('${API_URL}/api/tasks')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Delete Task
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch('${API_URL}/api/tasks/${id}', {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // Search + Status Filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app">
      <header className="header">
        <h1>TaskFlow</h1>
        <p>Personal Task & Notes Manager</p>
      </header>

      <main className="container">
        <div className="top-bar">
          <h2>My Tasks</h2>

          <button
            className="add-btn"
            onClick={() => {
              setEditTask(null);
              setShowForm(true);
            }}
          >
            + Add New Task
          </button>
        </div>

        {/* Search + Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="task-list">
          {loading && <p>Loading tasks...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && filteredTasks.length === 0 && (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Try another search or add a new task.</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredTasks.map((task) => (
              <div className="task-card" key={task._id}>
                <h3>{task.title}</h3>

                <p>{task.description}</p>

                <p>
                  <strong>Category:</strong> {task.category}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${task.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>
                </p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No date"}
                </p>

                <div className="task-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditTask(task);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        {showForm && (
          <TaskForm
            onTaskAdded={(newTask) => {
              setTasks((prevTasks) => [newTask, ...prevTasks]);
            }}
            onTaskUpdated={(updatedTask) => {
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task._id === updatedTask._id ? updatedTask : task
                )
              );

              setEditTask(null);
            }}
            onClose={() => {
              setShowForm(false);
              setEditTask(null);
            }}
            editTask={editTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;