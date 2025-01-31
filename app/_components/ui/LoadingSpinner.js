"use client";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-bg-main flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-blue"></div>
    </div>
  );
};

export default LoadingSpinner; 