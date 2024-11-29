"use client";

import { useRouter } from "next/navigation";

const IntakeMainScreen = () => {
  const router = useRouter();

  const navigationCards = [
    {
      title: "Live Dashboard",
      description: "View real-time intake data",
      path: "/workspace/intake/live-dashboard",
    },
    // More options can be added here later
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Intake - Main Screen</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationCards.map((card, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => router.push(card.path)}
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntakeMainScreen; 