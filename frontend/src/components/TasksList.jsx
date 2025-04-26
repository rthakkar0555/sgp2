// src/components/TasksList.jsx
import React from "react";

const TasksList = ({ groups, tasks, onCompleteTask, onDeleteTask }) => {
  return (
    <div className="tasks-list-container">
      <h1>All Tasks</h1>
      {groups.length === 0 ? (
        <p>No groups available. Create a group to add tasks!</p>
      ) : (
        groups.map((group) => {
          const groupTasks = tasks.filter((task) => task.groupId === group.id);
          return (
            <div key={group.id} className="group-tasks-section">
              <h2>{group.name}</h2>
              {groupTasks.length === 0 ? (
                <p>No tasks for this group.</p>
              ) : (
                <ul className="group-tasks-list">
                  {groupTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`task-item ${task.completed ? "completed" : ""}`}
                    >
                      <span>{task.text}</span>
                      <div className="task-actions">
                        {!task.completed && (
                          <button
                            className="complete-task-btn"
                            onClick={() => onCompleteTask(task.id)}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="delete-task-btn"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TasksList;