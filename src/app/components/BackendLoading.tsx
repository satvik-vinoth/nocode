export default function BackendLoading() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-xl font-semibold">Backend is waking up...</p>
        <p className="text-gray-400 text-sm mt-2">
          This usually takes 1–2 minutes on free hosting.
        </p>
      </div>
    );
  }
  