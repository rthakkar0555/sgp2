import React, { useState, useEffect } from "react";
import JoinModal from "./JoinModal";
import CreateGroup from "./CreateGroup";
import GroupsList from "./GroupsList";
import TasksList from "./TasksList";
import Chat from "./Chat";
import defaultGroupImg from "../assets/images/user.png";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([
    { id: 1, text: "Review chapter 7 of To Kill a Mockingbird", by: "Jane Doe", date: "Aug 25" },
    { id: 2, text: "Solve problems 1-10 in the calculus workbook", by: "John Smith", date: "Aug 26" },
    { id: 3, text: "Analyze the results of the recent experiment", by: "Sarah Johnson", date: "Aug 27" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupsList, setShowGroupsList] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("groups");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    avatar: defaultGroupImg
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    const storedId = JSON.parse(localStorage.getItem("userId"));
    setCurrentUserId(storedId);
  }, []);
  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        const currentUserId = JSON.parse(localStorage.getItem("userId"));
        if (!currentUserId) {
          console.error("User ID not found in localStorage.");
          return;
        }
    
        const response = await fetch("http://localhost:8008/api/v1/tasks/user/pending", {
          method: "GET",
          credentials: "include", // Sends cookies automatically
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        const result = await response.json();
    
        if (result.success) {
          const transformedTasks = result.data.map((task) => {
            const completedEntry = task.completedBy.find(
              (entry) => entry.user === currentUserId
            );
    
            return {
              id: task._id,
              groupId: task.group._id,
              text: task.title,
              description: task.description,
              due: task.dueDate.split("T")[0],
              completed: !!completedEntry,
              completedAt: completedEntry?.completedAt || null,
            };
          });
    
          setTasks(transformedTasks);
        } else {
          console.error("Failed to fetch tasks:", result.message);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    
  
    fetchPendingTasks();
  
    const fetchUserGroups = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setError("Authentication required. Please login.");
          //window.location.href = "/login";
          return;
        }

        const response = await fetch("http://localhost:8008/api/v1/groups/my", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          setError("Your session has expired. Please login again.");
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch groups");
        }

        const data = await response.json();

        if (data.success === undefined || data.success) {
          const transformedGroups = (data.data || data).map((group) => ({
            id: group._id,
            name: group.name,
            tasks: 0,
            img: group.groupImage || defaultGroupImg,
            description: group.description,
            admin: group.admin,
            membersCount: group.membersCount,
          }));
          setGroups(transformedGroups);
        } else {
          throw new Error(data.message || "Failed to fetch groups");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, []);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("userEmail");
    const storedUserImg = localStorage.getItem("userimg");
    if (storedUser && storedEmail) {
      setUserInfo({
        username: JSON.parse(storedUser) || "User",
        email: JSON.parse(storedEmail) || "",
        avatar: JSON.parse(storedUserImg) || defaultGroupImg
      });
    }
  }, []);

  useEffect(() => {
    if (showModal || showCreateGroupModal || showChatModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showCreateGroupModal, showChatModal]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const addGroup = (name) => {
    const newGroup = {
      id: groups.length + 1,
      name,
      tasks: 0,
      img: defaultGroupImg,
    };
    setGroups([...groups, newGroup]);
    setActivities([
      {
        id: activities.length + 1,
        text: `Created group "${name}"`,
        date: new Date().toLocaleDateString(),
      },
      ...activities,
    ]);
  };

  const addTask = async (groupId, taskName, taskDescription, dueDate) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
  
      if (!accessToken) {
        alert("Authentication required. Please login again.");
        window.location.href = "/login";
        return;
      }
  
      const formdata = new FormData();
      formdata.append("title", taskName);
      formdata.append("description", taskDescription);
      formdata.append("groupId", groupId);
      formdata.append("dueDate", dueDate);
      formdata.append("points", "10");
  
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formdata,
        redirect: "follow",
      };
  
      const response = await fetch("http://localhost:8008/api/v1/tasks/create", requestOptions);
      const result = await response.json();
  
      if (result.success) {
        const newTask = {
          id: result.data._id,
          groupId: result.data.group._id,
          text: result.data.title,
          description: result.data.description,
          due: result.data.dueDate.split("T")[0],
          completed: false,
        };
  
        setTasks((prevTasks) => [...prevTasks, newTask]);
  
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === newTask.groupId ? { ...group, tasks: group.tasks + 1 } : group
          )
        );
  
        setActivities((prevActivities) => [
          {
            id: prevActivities.length + 1,
            text: `Added task "${taskName}" to group "${groups.find((g) => g.id === groupId)?.name || "Unknown Group"}"`,
            date: new Date().toLocaleDateString(),
          },
          ...prevActivities,
        ]);
      } else {
        alert("Failed to add task: " + result.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task, check console.");
    }
  };
  
  

  const completeTask = async (taskId) => {
    const accessToken = localStorage.getItem("accessToken");
    const requestOptions = {
      method: "POST",
      headers: {
        // Include auth headers if needed
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`, // replace `yourToken` with actual token variable
      },
      redirect: "follow",
    };
  
    try {
      const response = await fetch(
        `http://localhost:8008/api/v1/tasks/complete/${taskId}`,
        requestOptions
      );
  
      const result = await response.json();
  
      if (!result.success) {
        console.error("Error completing task:", result.message);
        alert(result.message); // Show an alert or toast message to user
        return;
      }
  
      // Update local state only if API call is successful
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
  
      const task = tasks.find((t) => t.id === taskId);
      const group = groups.find((g) => g.id === task.groupId);
  
      if (task && group) {
        setActivities((prevActivities) => [
          {
            id: prevActivities.length + 1,
            text: `Completed task "${task.text}" in group "${group.name}"`,
            date: new Date().toLocaleDateString(),
          },
          ...prevActivities,
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  

  const deleteTask = async (taskId) => {
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      toast.error("Authentication required. Please login again.");
      window.location.href = "/login";
      return;
    }
  
    const task = tasks.find((t) => t.id === taskId);
  
    if (!task) {
      toast.error("Task not found in local state.");
      return;
    }
  
    try {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        redirect: "follow",
      };
  
      const response = await fetch(
        `http://localhost:8008/api/v1/tasks/${taskId}`,
        requestOptions
      );
  
      const result = await response.json();
  
      if (!result.success) {
        //toast.error(`Failed to delete task: ${result.message || "Unknown error"}`);
        console.error("Delete failed:", result);
        return;
      }
  
      // ✅ Backend confirmed deletion — update frontend state
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === task.groupId
            ? { ...group, tasks: Math.max(0, group.tasks - 1) }
            : group
        )
      );
      setActivities((prevActivities) => [
        {
          id: prevActivities.length + 1,
          text: `Deleted task "${task.text}" from group "${groups.find((g) => g.id === task.groupId)?.name || "Unknown Group"}"`,
          date: new Date().toLocaleDateString(),
        },
        ...prevActivities,
      ]);
  
      //toast.success(`Task "${task.text}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting task:", error);
      //toast.error("An unexpected error occurred while deleting the task.");
    }
  };
  

  const handleGroupCreated = (groupData) => {
    setGroups((prevGroups) => [
      ...prevGroups,
      {
        id: groupData._id || prevGroups.length + 1,
        name: groupData.name,
        tasks: 0,
        img: groupData.groupImage || defaultGroupImg,
        description: groupData.description,
        admin: groupData.admin,
        membersCount: groupData.membersCount || 0,
      },
    ]);
    setActivities((prevActivities) => [
      {
        id: prevActivities.length + 1,
        text: `Created group "${groupData.name}"`,
        date: new Date().toLocaleDateString(),
      },
      ...prevActivities,
    ]);
    setShowCreateGroupModal(false);
  };

  const handleGroupClick = (groupId) => {
    setViewMode("tasks");
    setSelectedGroupId(groupId);
  };

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchTerm)
  );
  const filteredActivities = activities.filter((activity) =>
    activity.text.toLowerCase().includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <div className="container">
      <aside
        className="sidebar"
        style={{ filter: showCreateGroupModal || showModal || showChatModal || showProfile ? "blur(5px)" : "none" }}
      >
        <nav>
          <a href="#dashboard" className="nav-item">
            Dashboard
          </a>
          <button
            className="nav-item"
            onClick={() => {
              setShowGroupsList(!showGroupsList);
              setShowTasksList(false);
              setViewMode("groups");
            }}
          >
            Groups
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setShowTasksList(!showTasksList);
              setShowGroupsList(false);
              setViewMode("groups");
            }}
          >
            Tasks
          </button>
          <button className="nav-item" onClick={() => setShowChatModal(true)}>
            Chat
          </button>
          <button
                className="join-group-btn"
                onClick={() => setShowModal(true)}
              >
                Join Group
              </button>
              
              <button
                className="new-group-btn " 
                onClick={() => setShowCreateGroupModal(true)}
              >
                New Group
              </button>
        </nav>
      </aside>

      <main
        className="content"
        style={{ filter: showCreateGroupModal || showModal || showChatModal || showProfile ? "blur(5px)" : "none" }}
      >
        <div className="header">
          <h1>My Groups</h1>
          <div className="profile-icon" onClick={() => setShowProfile(true)}>
            <img 
              src={userInfo.avatar} 
              alt="Profile" 
              className="profile-image"
            />
          </div>
        </div>

        {viewMode === "tasks" ? (
          <TasksList
            groups={groups}
            tasks={tasks}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
          />
        ) : showGroupsList ? (
          <GroupsList
            groups={groups}
            tasks={tasks}
            onViewTasks={(group) => setSelectedGroup(group)}
            selectedGroup={selectedGroup}
            onBack={() => setSelectedGroup(null)}
            onAddTask={addTask}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
          />
        ) : showTasksList ? (
          <TasksList
            groups={groups}
            tasks={tasks}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
          />
        ) : (
          <>
            {loading ? (
              <div className="loading">Loading your groups...</div>
            ) : error ? (
              <div className="error">Error: {error}</div>
            ) : groups.length === 0 ? (
              <div className="no-groups">
                <p>You don't have any groups yet. Join or create a new group to get started!</p>
              </div>
            ) : (
              <div className="groups-grid">
                {groups.map((group) => (
                  <div 
                    key={group._id} 
                    className="group-card"
                    onClick={() => handleGroupClick(group._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={group.img}
                      alt={group.name}
                      className="group-image"
                      onError={(e) => {
                        e.target.src = defaultGroupImg;
                      }}
                    />
                    <h3>{group.name}</h3>
                    <p>{group.description}</p>
                    <p>Group ID: {group._id}</p>
                    <p>Members: {group.membersCount}</p>
                    <p>{group.tasks} tasks</p>
                  </div>
                ))}
              </div>
            )}

            <h2>Upcoming Tasks</h2>
            {filteredTasks.length === 0 ? (
              <p>No tasks available. Create tasks in your groups to see them here.</p>
            ) : (
              <ul className="tasks-list">
                {filteredTasks.map((task) => (
                  <li key={task.id}>
                    {task.text} <span>{task.due}</span>
                  </li>
                ))}
              </ul>
            )}

            <h2>Recent Activity</h2>
            <ul className="activity-list">
              {filteredActivities.map((activity) => (
                <li key={activity.id}>
                  {activity.text}
                  {activity.by && <span>Completed by {activity.by}</span>}
                  <span>{activity.date}</span>
                </li>
              ))}
            </ul>

            <div className="dashboard-buttons">
            
             
            </div>
          </>
        )}
      </main>

      {showProfile && (
        <div className="modal">
          <div className="modal-content profile-modal">
            <div className="profile-header">
              <h2>Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="profile-body">
              <div className="profile-avatar">
                <img src={userInfo.avatar} alt="Profile" />
              </div>
              <div className="profile-info">
                <h3>{userInfo.username}</h3>
                <p>{userInfo.email}</p>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateGroupModal && (
        <div className="modal">
          <div className="modal-content">
            <CreateGroup
              onGroupCreated={handleGroupCreated}
              onClose={() => setShowCreateGroupModal(false)}
              defaultPhoto={defaultGroupImg}
            />
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <JoinModal
              onClose={() => setShowModal(false)}
              onAddGroup={(groupData) => {
                setGroups([...groups, groupData]);
                setActivities([
                  {
                    id: activities.length + 1,
                    text: `Joined group "${groupData.name}"`,
                    date: new Date().toLocaleDateString(),
                  },
                  ...activities,
                ]);
                setShowModal(false);
              }}
              onOpenCreateGroup={() => {
                setShowModal(false);
                setShowCreateGroupModal(true);
              }}
            />
          </div>
        </div>
      )}
      {showChatModal && (
        <div className="modal">
          <div className="modal-content chat-modal">
            <div className="header">
              <h1>Group Chats</h1>
              <button className="home-btn" onClick={() => setShowChatModal(false)}>
                Back to Home
              </button>
            </div>
            {groups.length === 0 ? (
              <p>No groups available. Create a group to start chatting!</p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="group-chat-section">
                  <div className="group-chat-header">
                    <img
                      src={group.img}
                      alt={group.name}
                      className="group-image"
                      onError={(e) => {
                        e.target.src = defaultGroupImg;
                      }}
                    />
                    <h3>{group.name}</h3>
                  </div>
                  <Chat groupId={group.id} userName="Test User" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;