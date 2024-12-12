"use client";

import { useRouter } from "next/navigation";

const RemoteMonitoringMainScreen = () => {
  const router = useRouter();

  const navigationCards = [
    {
      title: "Dashboard",
      description: "View past follow ups data",
      path: "/workspace/remote-monitoring/live-dashboard",
    },
    {
      title: "Create Follow Up",
      description: "Set follow up call with patient",
      path: "/workspace/remote-monitoring/create-follow-up",
    },
    {
      title: "Upcoming Follow Ups",
      description: "View and Edit scheduled follow up calls",
      path: "/workspace/remote-monitoring/upcoming-calls",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Remote Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationCards.map((card, index) => (
          <div
            key={index}
            className="block cursor-pointer"
            onClick={() => router.push(card.path)}
          >
            <div className="bg-bg-elevated p-8 rounded-lg hover:bg-bg-secondary transition-colors duration-200">
              <h2 className="text-xl font-semibold text-text-primary mb-4">{card.title}</h2>
              <p className="text-text-secondary mb-4">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoteMonitoringMainScreen; 