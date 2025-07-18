import { Suspense } from "react";
import RegressionPage from "./RegressionPage";



export default function RegressionPageWrapper() {
    return (
        <Suspense fallback={<div className="text-white p-4">Loading classification page...</div>}>
            <RegressionPage />
        </Suspense>
    );
}

