"use client";

import { useSearchParams,useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import Header from "../components/header";
import ShowDataset from "../components/ShowDataset";
import { History } from "lucide-react";

export default function PreprocessingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const datasetId = searchParams.get("dataset");
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const taskType = searchParams.get("type") || "regression";

    const [DatasetPreview,setDatasetPreview] = useState<string[][]|null>(null);
    const [DatasetStatistics,setDatasetStatistics] = useState<string[][]|null>(null);
    const [targetVariable,setTargetVariable] = useState<string>("");
    const [missingValues, setMissingValues] = useState<string[][] | null>(null);
    const [processing, setProcessing] = useState(false);
    const [processedPreview, setProcessedPreview] = useState<string[][] | null>(null);
    const [datasetEncoded, setDatasetEncoded] = useState<string[][] | null>(null);
    const [scalingMethod, setScalingMethod] = useState<"standard" | "minmax">("standard");
    const [scaledDataset, setScaledDataset] = useState<string[][] | null>(null);
    
    useEffect(() => {
        if (!datasetId) {
          window.location.href = "/about";
          return;
        }
      
        const fetchDataset = async () => {
          try {
            const response = await fetch(`${baseURL}/dataset/get/${datasetId}`);
            const data = await response.json();
            setDatasetPreview(data.preview);
          } catch (err) {
            console.error("Dataset fetch error:", err);
          }
        };
      
        fetchDataset();
      }, [datasetId,baseURL]);

    const steps = ["Dataset Statistics", "Handle missing values", "Categorical Encoding", "Feature Scaling", "Data Splitting"];

      const handlerestore = async () => {
        try{
            const response = await fetch(`${baseURL}/dataset/restore/${datasetId}`);
            const data = await response.json();
            setDatasetPreview(data.preview);    
            setDatasetStatistics(null);
            setMissingValues(null);
            setProcessedPreview(null);
            setTargetVariable("");
            setProcessing(false);
            setDatasetEncoded(null);
            setScaledDataset(null);

        }catch(err){
            console.error("Error restoring dataset:", err);
        }
      }


    const processDataset = async () => {
        if (!datasetId) {
            console.error("No datasetId found!");
            return;
        }
    
        try {
            const response = await fetch(`${baseURL}/dataset/process`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dataset_id: datasetId
                }),
            });
    
            const data = await response.json();
    
            setDatasetStatistics(data.statistics)
    
        } catch (err) {
            console.error("Error processing dataset:", err);
        }
    };

    const fetchMissingValueStats = async () => {
        if (!datasetId) return;
    
        try {
            const res = await fetch(`${baseURL}/preprocessing/missing/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataset_id: datasetId }),
            });
    
            const data = await res.json();
            setMissingValues(data.missing_values); 
        } catch (err) {
            console.error("Missing check error:", err);
        }
    };

    const handleMissingValues = async () => {
        if (!datasetId) return;
        if (!targetVariable) return alert("Select a target variable");
    
        setProcessing(true);
    
        try {
            const res = await fetch(`${baseURL}/preprocessing/missing/handle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    target_variable: targetVariable,
                    task: taskType,      
                }),
            });
    
            const data = await res.json();
    
            setProcessedPreview(data.processed_dataset); 
            setDatasetPreview(data.processed_dataset);
        } catch (err) {
            console.error("Missing handler error:", err);
        }
    
        setProcessing(false);
    };
    
    const handleEncoding = async () => {
        if (!datasetId) return;

        if (!targetVariable) return alert("Select a target variable");
    
        try {
            const res = await fetch(`${baseURL}/preprocessing/encoding`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    target_variable: targetVariable || null
                }),
            });
    
            const data = await res.json();
    
            setDatasetEncoded(data.preview);  
            setDatasetPreview(data.preview);     
        } catch (err) {
            console.error("Encoding error:", err);
        }
    };

    const handleScaling = async() => {
        if (!datasetId) return;

        if (!targetVariable) return alert("Select a target variable");

        try{
            const response = await fetch(`${baseURL}/preprocessing/scaling`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    method: scalingMethod,
                    target_variable: targetVariable 
                }),
            });
            const data = await response.json();
            setScaledDataset(data.preview);
            setDatasetPreview(data.preview);          
        }catch(err){
            console.error("Scaling error:", err);
        }
    }

    const handleProceedToTraining = () => {
        if (!datasetId) {
            alert("Dataset not found");
            return;
        }
        if (!targetVariable) {
            alert("Please select a target variable before proceeding.");
            return;
        }
    
        if (taskType === "classification") {
            router.push(`/classification?dataset=${datasetId}&target=${targetVariable}`);
        } else {
            router.push(`/regression?dataset=${datasetId}&target=${targetVariable}`);
        }
    };
    
    return (
        <div className="h-screen bg-gradient-to-r from-black to-gray-1000 text-white">
            <Header></Header>
            <div className="flex border-t border-t-gray-600 border-t-3 mt-18">
                <div className="hidden md:block">
                <aside className="w-72 min-w-72 p-6 flex-shrink-0 h-screen overflow-y-auto border-r border-r-gray-600 border-r-3">
                    <h2 className="text-xl font-bold text-white">Preprocessing Steps</h2>
                    <ul className="mt-4 space-y-4 text-gray-300">
                        {steps.map((step, index) => (
                            <li key={index} className="border border-gray-700 p-3 rounded-lg">
                                <a href={`#${step}`}>{step}</a>
                            </li>
                        ))}
                    </ul>
                </aside>
                </div>
            
                <main className="flex-1 p-8 overflow-auto h-screen">
                    <h1 className="text-3xl font-bold">Data Preprocessing</h1>
                    <div className="mt-6  p-6 rounded-lg bg-gray-800 ">
                        <div className="flex gap-2">
                            <h2 className="text-xl font-bold">Dataset Preview</h2>
                            <button className="cursor-pointer" onClick={handlerestore}><History size={20}/></button>
                        </div>
                        {DatasetPreview && <ShowDataset dataset = {DatasetPreview}/>}
                    </div>
                    <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="DatasetStatistics">
                            <h2 className="text-xl font-bold">Dataset Statistics</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-300">
                                The dataset statistics offer a quick overview of each column&apos;s distribution, helping you spot anomalies, missing values, or patterns. This summary is useful for early-stage data analysis and model preparation. Re-click “Load Dataset Statistics” if the dataset is updated or changed.
                            </p>
                            <button
                                className="mt-4 bg-gradient-to-r from-black to-gray-800  border border-white text-white px-4 py-2 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => {
                                    processDataset();
                                }}
                                >
                                Load Dataset Statistics
                            </button>
                            {DatasetStatistics && <ShowDataset dataset = {DatasetStatistics}/>}
                    </div>
                    <div className="mt-6 p-6 bg-gray-800 rounded-lg">
                        <h2 className="text-xl font-bold">Select Target Variable</h2>
                        <p className="mt-2 text-sm text-gray-300">
                                Choose the target variable that you want your model to predict. This is typically the column containing labels or outcomes in your dataset. Make sure to select the correct target before proceeding to model training or evaluation.
                        </p>
                        <select
                            className="mt-2 p-2 rounded-lg bg-gray-700 text-white"
                            value={targetVariable}
                            onChange={(e) => setTargetVariable(e.target.value)}
                        >
                            <option value="">Select Target Variable</option>
                            {DatasetPreview && DatasetPreview.length > 0 && DatasetPreview[0].map((colName, index) => (
                                <option key={index} value={colName}>{colName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Handle missing values">
                        <h2 className="text-xl font-bold">Handle missing values</h2>
                        <p className="mt-4 text-sm text-gray-300">
                            Detect and fix missing values automatically using numerical or categorical imputation.
                        </p>

                        <button
                            className="mt-4 bg-gradient-to-r from-black to-gray-800 border border-white text-white px-4 py-2 rounded-lg transition-transform duration-300 hover:scale-105"
                            onClick={fetchMissingValueStats}
                        >
                            Check for missing values
                        </button>

                        {missingValues &&
                            missingValues.length > 1 &&  
                            missingValues[1].slice(1).every((v) => Number(v) === 0) && (
                                <p className="mt-6 text-green-400 text-lg font-semibold">
                                    No missing values detected in the dataset!
                                </p>
                        )}

                        {missingValues &&
                            missingValues.length > 1 &&
                            !missingValues[1].slice(1).every((v) => Number(v) === 0) && (
                                <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                                    <h3 className="font-bold mb-3">Missing Value Table</h3>
                                    <ShowDataset dataset={missingValues} />
                                </div>
                        )}

                        {missingValues && (
                            <button
                                className="mt-4 bg-gradient-to-r from-black to-gray-800 border border-white text-white px-4 py-2 rounded-lg transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleMissingValues}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : "Handle Missing Values"}
                            </button>
                        )}

                        {processedPreview && (
                            <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                                <h3 className="font-bold mb-3">After Handling Missing Values</h3>
                                <ShowDataset dataset={processedPreview} />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Categorical Encoding">
                        <h2 className="text-xl font-bold mb-2">Categorical Encoding</h2>
                        <p className="mt-4 text-sm text-gray-300">
                            Categorical encoding transforms non-numeric columns into a numerical format suitable for machine learning algorithms. This step ensures that categorical variables are properly interpreted by models. Click “Proceed with Encoding” to apply encoding techniques automatically.
                        </p>                  
                        <button
                            className="mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
                            onClick={() => handleEncoding()}
                        >
                            Proceed with Encoding
                        </button>
                        {datasetEncoded && <ShowDataset dataset={datasetEncoded}  />}
                    
                    </div>

                    <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Feature Scaling">
                        <h2 className="text-xl font-bold mb-2">Feature Scaling</h2>
                        <p className="mt-4 text-sm text-gray-300">
                            Feature scaling standardizes the range of numeric features, which helps models converge faster and improves accuracy, especially for algorithms sensitive to magnitude. Apply scaling here to ensure uniform feature contribution.
                        </p>
                        <div className="flex flex-col mt-2">
                            <div>
                                <label className="text-white pr-2 pt-2">Select Scaling Method:</label>
                                <select
                                    className="p-1 rounded-lg bg-gray-700 text-white"
                                    value={scalingMethod}
                                    onChange={(e) => setScalingMethod(e.target.value as "standard" | "minmax")}
                                >
                                    <option value="standard">Standard Scaler</option>
                                    <option value="minmax">Min-Max Scaler</option>
                                </select>
                            </div>
                            
                            <button
                                className="w-fit mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => handleScaling()}
                            >
                                Apply Scaling
                            </button>
                        </div>
    
                        {scaledDataset && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold mb-2">Scaled Dataset Preview</h3>
                                <ShowDataset dataset={scaledDataset} />
                            </div>
                        )}
                    </div>

                    <button
                        className="w-fit mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={handleProceedToTraining}
                        >
                        Proceed to Training
                    </button>
                </main>
            </div>
        </div>
    )
}