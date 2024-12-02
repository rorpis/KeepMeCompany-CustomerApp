"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../lib/contexts/UserContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import Link from "next/link";

const WorkspaceDashboard = () => {
  const { userDetails, loading: userLoading } = useUser();
  const { selectedOrg, loading: orgLoading } = useOrganisation();
  const router = useRouter();

  if (userLoading || orgLoading) {
    return <div>Loading...</div>;
  }

  if (!selectedOrg) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Platform</h1>
          <p className="mb-8">Get started by creating your first organization</p>
          <button
            onClick={() => router.push("/workspace/organisation/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">
            Hi {userDetails?.name}, Welcome to {selectedOrg?.name}
          </h1>
          <p className="text-gray-600">
            {selectedOrg?.address.addressLine1} {selectedOrg?.address.addressLine2} {selectedOrg?.address.postcode} {selectedOrg?.address.city}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Patient Intake</h2>
            <p className="text-gray-600 mb-4">
              View and Manage your Inbound Calls
            </p>
            <Link 
              href="/workspace/intake" 
              className="text-blue-600 hover:text-blue-800"
            >
              Go to Patient Intake →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Patient Remote Monitoring</h2>
            <p className="text-gray-600 mb-4">
              View and Manage your Outbound Calls
            </p>
            <Link 
              href="/workspace/remote-monitoring" 
              className="text-blue-600 hover:text-blue-800"
            >
              Go to Patient Remote Monitoring →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Organisation Dashboard</h2>
            <p className="text-gray-600 mb-4">
              View analytics and manage organisation settings
            </p>
            <Link 
              href="/workspace/organisation/dashboard" 
              className="text-blue-600 hover:text-blue-800"
            >
              Go to Organisation Dashboard →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkspaceDashboard; 