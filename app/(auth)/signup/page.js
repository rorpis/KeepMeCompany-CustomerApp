"use client";

import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { auth } from "../../../lib/firebase/config";
import { useState } from 'react';
import { useRouter } from "next/navigation";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // get user id token
      const idToken = await userCredential.user.getIdToken();

      // send user info to server for database signup
      const userInfo = {
        email: email,
        name: name,
        surname: surname
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }
      
      const response = await fetch(`${backendUrl}/customer_app_api/user_signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ userInfo })
      });

      if (!response.ok) {
        // Add this to see what's going wrong
        const errorData = await response.json();
        console.error('Signup failed:', errorData);
        throw new Error(errorData.message || 'Signup failed');
      }

      const responseData = await response.json();
      
      if (responseData.registration_message === "success") {
        // Send email verification
        await sendEmailVerification(userCredential.user);
        router.push("/verify-email");
      } else {
        // delete user from firebase if signup fails
        await deleteUser(userCredential.user);
        setErrorMessage('Registration failed');
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default SignupForm;
