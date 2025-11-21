import { Suspense } from "react";
import PreprocessingPage from "./preprocess";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full">Loading...</div>}>
      <PreprocessingPage/>
    </Suspense>
  );
}
