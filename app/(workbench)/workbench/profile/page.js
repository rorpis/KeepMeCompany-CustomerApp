"use client";

import { useState } from "react";
import { useAuth } from "../../../../lib/firebase/authContext";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ displayName });
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="profile">
      <h1>User Profile</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
          />
        </div>

        {message && <div className="message">{message}</div>}

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile; 