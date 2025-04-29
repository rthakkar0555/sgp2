// src/components/GroupsList.jsx
import React, { useState } from "react";
import Chat from "./Chat";
import "../App.css"; // Ensure this import is present
import '../styles/nav-buttons.css';
const GroupsList = ({
  groups,
  tasks,
  onViewTasks,
  selectedGroup,
  onBack,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState("tasks"); // "tasks" or "chat"
  const [addingTask, setAddingTask] = useState(false);

  if (selectedGroup) {
    const groupTasks = tasks.filter((task) => task.groupId === selectedGroup.id);

    return (
      <div className="group-tasks-view">
        <div className="header">
          <button className="back-btn" onClick={onBack}>
            Back
          </button>
          <h1>{selectedGroup.name}</h1>
        </div>
        <div className="view-toggle">
          <button
            onClick={() => setViewMode("tasks")}
            disabled={viewMode === "tasks"}
          >
            Tasks
          </button>
          <button
            onClick={() => setViewMode("chat")}
            disabled={viewMode === "chat"}
          >
            Chat
          </button>
        </div>
        {viewMode === "tasks" ? (
          <>
            <form
              className="add-task-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const taskName = e.target.taskName.value;
                const taskDescription = e.target.taskDescription.value;
                const dueDate = e.target.dueDate.value;
                if (taskName) {
                  setAddingTask(true);
                  await onAddTask(selectedGroup.id, taskName, taskDescription, dueDate);
                  e.target.reset();
                  setAddingTask(false);
                }
              }}
              
            >
              <div className="form-row">
                <div className="form-group task-name-group">
                  <input
                    type="text"
                    name="taskName"
                    className="task-input"
                    placeholder="Task name"
                    required
                  />
                </div>
                <div className="form-group task-desc-group">
                  <input
                    type="text"
                    name="taskDescription"
                    className="task-input"
                    placeholder="Task description"
                  />
                </div>
                <div className="form-group task-date-group">
                  <input
                    type="date"
                    name="dueDate"
                    className="task-input"
                    required
                  />
                </div>
                <button type="submit" className="add-task-btn" disabled={addingTask}>
                   {addingTask ? "Adding..." : (<><span className="btn-icon">+</span> Add Task</>)}
                </button>


              </div>
            </form>
            <ul className="group-tasks-list">
              {groupTasks.map((task) => (

                <li
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <div className="task-content">
                    <div className="task-header">
                      <h4>{task.text}</h4>
                      <span className="due-date">Due: {task.due}</span>
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    {task.completed && (
                      <div className="task-completed-by">
                        <span className="completed-icon">✓</span>
                        Completed by {task.completedBy || "You"}
                      </div>
                    )}
                  </div>
                  <div className="task-actions">
                    {!task.completed && (
                      <button
                        className="complete-task-btn"
                        onClick={() => onCompleteTask(task.id)}
                      >
                        <span className="btn-icon">✓</span> Complete
                      </button>
                    )}
                    <button
                      className="delete-task-btn"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <span className="btn-icon">×</span> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Chat groupId={selectedGroup.id} userName="Test User" />
        )}
      </div>
    );
  }

  return (
    <div className="groups-list-container">
      <h1>Groups</h1>
      {groups.length === 0 ? (
        <p>No groups available. Create a group to get started!</p>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="group-card">
            <img
              src={group.img}
              alt={group.name}
              className="group-image"
              onError={(e) => {
                e.target.src = "../assets/images/user.png";
              }}
            />
            <h3>{group.name}</h3>
            <p>{group.tasks} tasks</p>
            <button className="view-tasks-btn" onClick={() => onViewTasks(group)}>
              View Tasks
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupsList;