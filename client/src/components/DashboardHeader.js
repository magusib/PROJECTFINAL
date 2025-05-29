import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import "../styles/DashboardHeader.css";
import axios from "axios";

const DashboardHeader = () => {
  const [openMessageNotif, setOpenMessageNotif] = useState(false);
  const [messageNotifs, setMessageNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // Get user data from session storage
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const { name, role, profilePic } = user;

  const homePath = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/student";

  // Notifications Logic
  const getNotifications = () => {
    return JSON.parse(sessionStorage.getItem("notifications")) || [];
  };

  const markAllAsRead = async () => {
    const readNotifs = notifications.map((n) => ({ ...n, read: true }));
    sessionStorage.setItem("notifications", JSON.stringify(readNotifs));
    setNotifications(readNotifs);
    setUnreadCount(0);
    await axios.put(`http://localhost:5000/api/notifications/mark-all-read`, {
      studentId: user.id,
    });
  };

  const toggleNotifDropdown = () => {
    setOpenNotif(!openNotif);
    if (!openNotif) {
      markAllAsRead();
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          params: user.role !== "admin" ? { student_id: user.id } : {},
        });
        const data = await res.data;
        setNotifications(data);
        const unreadNotifications = data.filter((n) => !n.read_status);
        setUnreadCount(unreadNotifications.length);
        sessionStorage.setItem("unreadCount", unreadNotifications.length);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
    return () => clearInterval(interval);
  }, []);

  // Message notification
  const toggleMessageNotifDropdown = () => {
    const newState = !openMessageNotif;
    setOpenMessageNotif(newState);
    if (!openMessageNotif) {
      markAllMessagesAsRead(); // mark as read when opening
    }
  };

  useEffect(() => {
    const fetchMessageNotifs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messagenotif?userId=${user.id}`);
        const data = await res.data;
        setMessageNotifs(data);
        const unreadMessages = data.filter((msg) => !msg.read_status);
        const newUnreadCount = unreadMessages.length;

        if (newUnreadCount !== unreadMsgCount) {
          setUnreadMsgCount(newUnreadCount);
        }
      } catch (err) {
        console.error("Failed to load message notifications", err);
      }
    };

    fetchMessageNotifs();

    const interval = setInterval(fetchMessageNotifs, 1000);
    return () => clearInterval(interval);
  }, [user.id]);

  const markAllMessagesAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/messagenotif/mark-all-read`, {
        userId: user.id,
      });

      const updatedMessages = messageNotifs.map((msg) => ({
        ...msg,
        read_status: true,
      }));

      setMessageNotifs(updatedMessages);
      setUnreadMsgCount(0);
      sessionStorage.setItem("unreadMsgCount", 0);
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  };

  // Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="dashboard-header">
      <div className="school-container">
        <span className="school-name">Pateros Technological College</span>
        
      </div>

      {/* Notifications & Profile */}
      <div className="header-right">
        {/* Message Notification */}
        <div
          className="message-notif-section"
          onClick={toggleMessageNotifDropdown}
          style={{ position: "relative" }}
        >
          <button className="messageNotif-btn">
            <ChatBubbleOutlineOutlinedIcon />
          </button>
          {unreadMsgCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "22px",
                right: "20px",
                backgroundColor: "red",
                borderRadius: "50%",
                width: "7px",
                height: "7px",
              }}
            />
          )}
          {/* Message Notification Dropdown */}
          <div className={`messagenotif-dropdown ${openMessageNotif ? "open" : ""}`}>
            <ul>
              {messageNotifs.length === 0 ? (
                <li>No new messages</li>
              ) : (
                messageNotifs
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((msg, index) => (
                    <li key={index} style={{ padding: "5px 10px", borderBottom: "1px solid #eee" }}>
                      {msg.message}
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>

        {/* Notification Button */}
        <div className="notif-section" onClick={toggleNotifDropdown} style={{ position: "relative" }}>
          <button className="notification-btn">
            <NotificationsNoneIcon />
          </button>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "29px",
                right: "38px",
                backgroundColor: "red",
                borderRadius: "50%",
                width: "7px",
                height: "7px",
              }}
            />
          )}
          {/* Notification Dropdown */}
          <div className={`notif-dropdown ${openNotif ? "open" : ""}`}>
            <ul>
              {notifications.length === 0 ? (
                <li>No notifications yet</li>
              ) : (
                notifications
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((notif, index) => (
                    <li key={index} style={{ padding: "5px 10px", borderBottom: "1px solid #eee" }}>
                      {notif.message}
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section" onClick={() => setOpen(!open)} style={{ position: "relative" }}>
          <img src={profilePic || "/default-profile.png"} alt="Profile" className="profile-pic" />
          <div className="user-info">
            <span className="user-name">{name || "User"}</span>
            <small className="user-role">
              {role === "admin" ? "Admin" : role === "parent" ? "Student" : "Unknown Role"}
            </small>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className={`dropdown ${open ? "open" : ""}`}>
          <ul>
            <li className="pfp" onClick={() => navigate("/profile")}>
              <AccountCircleIcon style={{ fontSize: "20px" }} className="headerIcon" /> Profile
            </li>
            <li className="logoutBtn" onClick={handleLogout}>
              <LogoutIcon style={{ fontSize: "20px" }} className="headerIcon" /> Logout
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
