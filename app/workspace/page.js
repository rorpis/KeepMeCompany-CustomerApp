"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../lib/contexts/UserContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import Link from "next/link";

const WorkspaceDashboard = () => {
  const { userDetails, loading: userLoading } = useUser();
  const { selectedOrg, organisationDetails, loading: orgLoading } = useOrganisation();
  const router = useRouter();

  if (userLoading || orgLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-main px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-bg-elevated rounded-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Hi {userDetails?.name}, Welcome to {organisationDetails?.name}
          </h1>
          <p className="text-text-secondary">
            {organisationDetails?.address?.addressLine1}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Intake Card */}
          <Link href="/workspace/intake" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Patient Intake
              </h2>
              <p className="text-text-secondary mb-4">
                View and Manage your Inbound Calls
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                Go to Patient Intake →
              </span>
            </div>
          </Link>

          {/* Remote Monitoring Card */}
          <Link href="/workspace/remote-monitoring" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Patient Remote Monitoring
              </h2>
              <p className="text-text-secondary mb-4">
                View and Manage your Outbound Calls
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                Go to Patient Remote Monitoring →
              </span>
            </div>
          </Link>

          {/* Scribe Card */}
          <Link href="/workspace/scribe" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                In-Consultation Scribe
              </h2>
              <p className="text-text-secondary mb-4">
                Transcribe your consultations in real-time
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                Go to In-Consultation Scribe →
              </span>
            </div>
          </Link>

          {/* Organisation Dashboard Card */}
          <Link href="/workspace/organisation/dashboard" className="block">
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Organisation Dashboard
              </h2>
              <p className="text-text-secondary mb-4">
                View analytics and manage organisation settings
              </p>
              <span className="text-primary-blue hover:text-primary-blue-hover inline-flex items-center">
                Go to Organisation Dashboard →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard; 