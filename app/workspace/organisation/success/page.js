"use client";

import { useRouter } from "next/navigation";

const OrganisationSuccess = () => {
  const router = useRouter();

  return (
    <div>
      <h1>Organization Created Successfully!</h1>
      <p>Your organization has been set up and is ready to use.</p>
      
      <button onClick={() => router.push("/workspace")}>
        Return to Home
      </button>
    </div>
  );
};

export default OrganisationSuccess; 