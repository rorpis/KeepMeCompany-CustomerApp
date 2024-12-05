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
    registeredNumbers: [""], // Initialize with one empty number
  });
  const [error, setError] = useState("");

  const handleAddNumber = () => {
    setFormData(prev => ({
      ...prev,
      registeredNumbers: [...prev.registeredNumbers, ""]
    }));
  };

  const handleRemoveNumber = (index) => {
    setFormData(prev => ({
      ...prev,
      registeredNumbers: prev.registeredNumbers.filter((_, i) => i !== index)
    }));
  };

  const handleNumberChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      registeredNumbers: prev.registeredNumbers.map((number, i) => 
        i === index ? value : number
      )
    }));
  };

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
      if (data.registration_message === "success") {
        router.push("/workspace/organisation/success");
      } else {
        setError(data.message || "Failed to create organization");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <h1 className="text-2xl font-bold text-text-primary mb-8">
            Create New Organization
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData(prev => ({...prev, addressLine1: e.target.value}))}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData(prev => ({...prev, addressLine2: e.target.value}))}
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData(prev => ({...prev, postcode: e.target.value}))}
                  required
                  className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                  required
                  className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-text-primary">
                Registered Phone Numbers
              </label>
              
              {formData.registeredNumbers.map((number, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-grow">
                    <div className="flex">
                      <input
                        type="tel"
                        value={number}
                        onChange={(e) => handleNumberChange(index, e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 px-4 py-2 rounded-r-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      />
                    </div>
                  </div>
                  {formData.registeredNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNumber(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddNumber}
                className="mt-2 px-4 py-2 bg-bg-secondary text-text-primary border border-border-main rounded-md hover:bg-bg-secondary/80 transition-colors duration-200"
              >
                + Add Another Number
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-blue hover:bg-primary-blue/80 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Create Organization
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganisation; 