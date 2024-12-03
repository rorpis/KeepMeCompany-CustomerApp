'use client';

import { useState, useEffect } from 'react';
import { fetchExampleCalls } from '../../../../lib/firebase/queries';
import { TriageDashboard } from '../../../_components/triageDashboard';

export function DashboardTesting({ data = {}, updateData }) {
  const [exampleCalls, setExampleCalls] = useState([]);
  const [displayedCalls, setDisplayedCalls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAndProcessCalls = async () => {
      try {
        const calls = await fetchExampleCalls();

        if (calls && Array.isArray(calls)) {
          // Generate timestamps for the calls (between 8:00 AM and 9:00 AM today)
          const today = new Date();
          const startTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            8,
            0,
            0
          );
          const endTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            9,
            0,
            0
          );

          const interval =
            (endTime.getTime() - startTime.getTime()) / calls.length;

          const processedCalls = calls.map((call, index) => ({
            patientName: call.patientName,
            patientDateOfBirth: call.patientDateOfBirth,
            summaryURL: call.summaryURL,
            viewed: false,
            timestamp: new Date(startTime.getTime() + index * interval),
          }));

          // Sort calls by timestamp in ascending order (older calls first)
          const sortedCalls = processedCalls.sort((a, b) => a.timestamp - b.timestamp);

          setExampleCalls(sortedCalls);

          // Start with the first 8 oldest calls
          setDisplayedCalls(sortedCalls.slice(0, 8).sort((a, b) => b.timestamp - a.timestamp));
          setCurrentIndex(8);
        }
      } catch (error) {
        console.error('Error fetching example calls:', error);
      }
    };

    fetchAndProcessCalls();
  }, []);

  useEffect(() => {
    // Gradually add 1 newer call every 10 seconds to the top
    const interval = setInterval(() => {
      if (currentIndex < exampleCalls.length) {
        setDisplayedCalls((prev) => [
          exampleCalls[currentIndex],
          ...prev, // Add new calls to the top
        ]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        clearInterval(interval); // Stop interval when all calls are displayed
      }
    }, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [exampleCalls, currentIndex]);

  const markAsViewed = (index) => {
    setDisplayedCalls((prev) =>
      prev.map((call, idx) => (idx === index ? { ...call, viewed: true } : call))
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Dashboard Testing Interface</h2>
      <TriageDashboard calls={displayedCalls} markAsViewed={markAsViewed} />
    </div>
  );
}
