"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/firebase/authContext";

const countries = [
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  // Add more countries as needed
];

const CreateOrganisation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    city: "",
    country: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idToken = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(
        `${backendUrl}/customer_app_api/create_organisation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.registration_message === "success") {
        console.log("success registration")
        router.push("/workspace/organisation/success");
      } else {
        setError(data.message || "Failed to create organization");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="create-org">
      <h1>Create New Organization</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
            required
          />
        </div>

        <div className="form-group">
          <label>Address Line 1</label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => setFormData(prev => ({...prev, addressLine1: e.target.value}))}
            required
          />
        </div>

        <div className="form-group">
          <label>Address Line 2</label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => setFormData(prev => ({...prev, addressLine2: e.target.value}))}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Postcode</label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => setFormData(prev => ({...prev, postcode: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
            required
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit">Create Organization</button>
      </form>
    </div>
  );
};

export default CreateOrganisation; 