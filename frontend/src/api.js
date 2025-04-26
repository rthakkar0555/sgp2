const BASE_URL = "http://localhost:8008/api/v1";  // Change this if needed

export const registerUser = async (formData) => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const fetchGroups = async () => {
  const response = await fetch(`${BASE_URL}/groups`);
  return response.json();
};

export const createGroup = async (groupData) => {
  const response = await fetch(`${BASE_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(groupData),
  });
  return response.json();
};

export const fetchTasks = async (groupId) => {
  const response = await fetch(`${BASE_URL}/tasks?groupId=${groupId}`);
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return response.json();
};

export const completeTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
  });
  return response.json();
};
