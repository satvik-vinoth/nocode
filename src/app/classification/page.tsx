import { Suspense } from "react";
import ClassificationPage from "./ClassificationPage";


export default function ClassificationPageWrapper() {
    return (
        <Suspense fallback={<div className="text-white p-4">Loading classification page...</div>}>
            <ClassificationPage />
        </Suspense>
    );
}


