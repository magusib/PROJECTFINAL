import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileUpload from "./ProfileUpload";
import "../styles/Profile.css";
import ClearIcon from '@mui/icons-material/Clear';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  //  Load user from sessionStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({ name: "Unknown", role: "Unknown", email:"N/A", contactNumber:"N/A", profilePic: "/default-profile.png" });
    }
  }, []);

  // Profile Upload Handler
  const handleUploadSuccess = async (newProfilePic) => {
    if (!user) return;

    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", newProfilePic);

      const response = await axios.post(
        "http://localhost:5000/upload-profile-pic",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.profilePic) {
        const updatedUser = { ...user, profilePic: response.data.profilePic };
        
        // Update sessionStorage
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        //  Force re-render to display new profile picture
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Profile picture upload failed", error);
    }
  };

  const goBackToDashboard = () => {
    if (user?.role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/parent");
    }
  };

  return (
    <div className="profile-page">
    <div className="profile-header">

      <button onClick={goBackToDashboard} className="back-btn"><ClearIcon className="clearIcon"/></button>
        <p style={{ fontSize:"23px", color: "rgb(49, 49, 49)", margin:"5px 0 10px 0", padding:"0 0 0 10px", display:"flex"}}> My Profile</p>
      </div>
      <br></br>
      <img
        key={user?.profilePic} // Force re-render when profilePic changes
        src={user?.profilePic || "/default-profile.png"}
        alt="Profile"
        className="profile-pic-large"
      />
      <h3>{user?.name || "Unknown"}</h3>
      <div className="info" style={{textAlign:"left"}}>
        <br></br>
        
        <p style={{fontSize: "16px" }}>Account information </p>
        <br></br>
      <PersonOutlineOutlinedIcon style={{fontSize:"15px", color:"rgb(128, 128, 128)"}}/>
        <p style={{ paddingBottom:"5px",fontFamily: "Arial", fontSize: "14px", borderBottom:"1px solid rgb(208, 208, 208)" }}>Role: <span style={{ opacity:"80%", fontWeight: 'normal' }}>{user?.role || "Unknown Role"}</span></p>
        <br></br>
        < EmailOutlinedIcon style={{fontSize:"15px", color:"rgb(128, 128, 128)"}}/>
        <p style={{ paddingBottom:"5px", fontFamily: "Arial", fontSize: "14px",borderBottom:"1px solid rgb(208, 208, 208)" }} >Email address: <span style={{ opacity:"80%", fontWeight: 'normal' }}>{user?.email || "N/A"}</span></p>
        <br></br>
       <CallEndRoundedIcon  style={{fontSize:"15px", color:"rgb(128, 128, 128)"}}/>
        <p style={{ paddingBottom:"5px", fontFamily:"Arial",fontSize:"14px",borderBottom:"1px solid rgb(208, 208, 208)" }} >Contact number: <span style={{opacity:"80%", fontWeight:'normal'}}>{user?.contactNumber || "N/A"}</span></p>
          </div>
      <ProfileUpload onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default Profile;

