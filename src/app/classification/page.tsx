import { Suspense } from "react";
import ClassificationPage from "./classification";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full">Loading...</div>}>
      <ClassificationPage />
    </Suspense>
  );
}