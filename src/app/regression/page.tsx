import { Suspense } from "react";
import RegressionPage from "./regression";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full">Loading...</div>}>
      <RegressionPage />
    </Suspense>
  );
}
