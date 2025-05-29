import React, { useEffect }  from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ParentDashboard from "./components/ParentDashboard";
import Profile from "./pages/Profile"; 
import Schedule from "./pages/Schedule"; 
import Grades from "./pages/Grades"; 
import Attendance from "./pages/Attendance"; 
import Announcements from "./pages/Announcements"; 
import Events from "./pages/Events"; 
import StudentList from "./pages/StudentList"


import Messages from './pages/Messages';



// ✅ Protected Route Component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  
  useEffect(() => {
    const handleStorageChange = (event) => {
      // If the logged-out user or session expired, navigate to the login page
      if (event.key === "user" && event.newValue === null) {
        window.location.href = "/"; // Redirect to login
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  if (!user) {
    return <Navigate to="/" />; // Redirect to login if not logged in
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if role is not allowed
  }

  return element;
};

function App() {
  return (
    
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin", "parent"]} />}>
          <Route path="admin" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
          <Route path="parent" element={<ProtectedRoute element={<ParentDashboard />} allowedRoles={["parent"]} />} />
         
          <Route path="students" element={<ProtectedRoute element={<StudentList />} allowedRoles={["admin", "parent"]} />} />

          <Route path="schedule" element={<ProtectedRoute element={<Schedule />} allowedRoles={["admin", "parent"]} />} />
          <Route path="grades" element={<ProtectedRoute element={<Grades />} allowedRoles={["admin", "parent"]} />} />

          <Route path="attendance" element={<ProtectedRoute element={<Attendance />} allowedRoles={["admin", "parent"]} />} />
          <Route path="announcements" element={<ProtectedRoute element={<Announcements />} allowedRoles={["admin", "parent"]} />} />
          <Route path="events" element={<ProtectedRoute element={<Events />} allowedRoles={["admin", "parent"]} />} />
           <Route path="messages" element={<ProtectedRoute element={<Messages />} allowedRoles={["admin", "parent"]} />} />
        
          

          </Route>
        
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} allowedRoles={["admin", "parent"]} />} />
       
       
      </Routes>
    </Router>
  );
}

export default App;

