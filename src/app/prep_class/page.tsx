"use client"
import { useState, useEffect } from "react";
import { useDataset } from "../context/DatasetContext";
import axios from "axios";
import Header from "../components/header";
import ShowDataset from "../components/ShowDataset";
import { useRouter } from "next/navigation";

export default function Prep_class() {
    type ColumnStats = {
        [statName: string]: number | string; 
      };
      
    type DatasetStatistics = {
        [columnName: string]: ColumnStats;
    };

    type MissingValues = {
        [column: string]: number;
    };
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const { dataset, setDataset, datasetFile , setDatasetFile} = useDataset();
    const [columns, setColumns] = useState<string[]>([]);
    const [allColumns,setAllColumns] = useState<string[]>([]);
    const [statistics, setStatistics] = useState<DatasetStatistics | null>(null);
    const [targetVariable, setTargetVariable] = useState<string>("");
    const [missingValues, setMissingValues] = useState<MissingValues | null>(null);
    const [processing, setProcessing] = useState(false);
    const [processedDataset, setProcessedDataset] = useState<boolean>(false);
    const [processedDataset2, setProcessedDataset2] = useState<boolean>(false);
    const [showChanges, setShowChanges] = useState(false);
    const [changeLogs, setChangeLogs] = useState<string[]>([]);
    const [datasetMissingHandled, setDatasetMissingHandled] = useState<string[][] | null>(null);
    const [datasetEncoded, setDatasetEncoded] = useState<string[][] | null>(null);
    const [scalingMethod, setScalingMethod] = useState<"standard" | "minmax">("standard");
    const [scaledDataset, setScaledDataset] = useState<string[][] | null>(null);
    const [scalingApplied, setScalingApplied] = useState(false);
    const {setTrainTestSplit,X_train} = useDataset();
    const [testPercentage, setTestPercentage] = useState(20);
    const [splitDone, setSplitDone] = useState(false);

    useEffect(() => {
        if (!dataset) {
          router.push('/about');
        }
      }, [dataset,router]);


    const processDataset = async () => {
        if (!datasetFile) {
            console.error("No dataset file found!");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", datasetFile);

            const response = await axios.post(`${baseURL}/api/dataset/process-dataset`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            //console.log("📌 Backend Full Response:", response.data);
            //console.log("📌 Statistics:", response.data.statistics);

            setColumns(response.data.columns || []);
            setStatistics(response.data.statistics || {});
            setAllColumns(response.data.all_columns || []); 
        } catch  {
            console.error("Error processing dataset:");
        } finally{
            setLoading(false);
        }
    };

    const fetchMissingValueStats = async () => {
        if (!datasetFile) {
            console.error("No dataset file found!");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", datasetFile);
    
            const response = await axios.post(`${baseURL}/api/missing-values/check`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            //console.log("📌 API Response:", response.data); 
    
            if (!response.data || !response.data.missing_values) {
                console.error("❌ Missing values data is undefined.");
                setMissingValues({});
                return;
            }
    
            setMissingValues(response.data.missing_values || {});

    
        } catch (error) {
            console.error("❌ Error fetching missing value stats:", error);
            setMissingValues({});
        }
    };

    const handleMissingValues = async () => {
        if (!targetVariable) {
            alert("Please select a target variable!");
            return;
        }
        if (!datasetFile) {
            console.error("No dataset file found!");
            return;
        }

        setProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", datasetFile);
            formData.append("targetVariable", targetVariable);

            const response = await axios.post(`${baseURL}/api/missing-values/handle`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            //console.log("📌 Processed Dataset Response:", response.data);

            
            const raw: Record<string, string | number>[] = response.data.processed_dataset;

            if (raw && raw.length > 0) {
                const headers = Object.keys(raw[0]); 
                const rows = raw.map((row) => headers.map((col) => String(row[col])));
                setDataset([headers, ...rows]); 
                setDatasetMissingHandled([headers, ...rows]); 
                const csvString = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                const blob = new Blob([csvString], { type: "text/csv" });
                const updatedFile = new File([blob], "processed_dataset.csv", { type: "text/csv" });
                setDatasetFile(updatedFile);
            }
            setProcessedDataset(true);
            setChangeLogs(response.data.changes);
            setShowChanges(true);

        } catch (error) {
            console.error("❌ Error handling missing values:", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleEncoding = async () => {
        if (!datasetFile) {
            console.error("No dataset file found!");
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("file", datasetFile);
            formData.append("targetVariable", targetVariable);
            const response = await axios.post(`${baseURL}/api/encoding/one-hot`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            //console("📌 One-Hot Encoded Dataset:", response.data);
            const raw: Record<string, string | number>[] = response.data.processed_dataset;
            if (raw && raw.length > 0) {
                const headers = Object.keys(raw[0]);
                const rows = raw.map((row) => headers.map((col) => String(row[col])));
                setDataset([headers, ...rows]);
                setDatasetEncoded([headers, ...rows]);
                const csvString = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                const blob = new Blob([csvString], { type: "text/csv" });
                const updatedFile = new File([blob], "processed_dataset.csv", { type: "text/csv" });
                setDatasetFile(updatedFile);  
            }
            setProcessedDataset2(true);
        } catch (error) {
            console.error("❌ Error during encoding:", error);
        }
    };

    const handleScaling = async () => {
        if (!datasetFile) {
            console.error("No dataset file found!");
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("file", datasetFile);
            formData.append("method", scalingMethod); // "standard" or "minmax"
            formData.append("targetVariable", targetVariable);
    
            const response = await axios.post(`${baseURL}/api/scaling`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            //console("📌 Scaled Dataset Response:", response.data);
    
            const raw: Record<string, string | number>[] = response.data.data;
            if (raw && raw.length > 0) {
                const headers = Object.keys(raw[0]);
                const rows = raw.map((row) => headers.map((col) => String(row[col])));
                setDataset([headers, ...rows]);
                setScaledDataset([headers, ...rows]);
                setScalingApplied(true);
                const csvString = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                const blob = new Blob([csvString], { type: "text/csv" });
                const updatedFile = new File([blob], "processed_dataset.csv", { type: "text/csv" });
                setDatasetFile(updatedFile);
            }
    
        } catch (error) {
            console.error("❌ Error during feature scaling:", error);
        }
    };

    const handleSplitDataset = async () => {
        if (!datasetFile || !targetVariable) {
          alert("Please upload a dataset and enter target variable.");
          return;
        }
      
        const formData = new FormData();
        formData.append("file", datasetFile);
        formData.append("targetVariable", targetVariable);
        formData.append("testPercentage", testPercentage.toString());
        formData.append("classification", "true");
      
        try {
          const response = await fetch(`${baseURL}/api/split-dataset`, {
            method: "POST",
            body: formData,
          });
      
          const data = await response.json();
      
          if (data.error) {
            alert(data.error);
            return;
          }
          //console("X_train:",data)
          const headers = Object.keys(data.X_train[0]);

        const X_train: string[][] = [
        headers,
        ...data.X_train.map((row: Record<string, string | number>) =>
            headers.map((key) => String(row[key]))
        ),
        ];


        const X_test: string[][] = [
        headers,
        ...data.X_test.map((row: Record<string, string | number>) =>
            headers.map((key) => String(row[key]))
        ),
        ];

      
          const y_train = data.y_train.map((v: string | number) => Number(v));
          const y_test = data.y_test.map((v: string | number) => Number(v));

          setTrainTestSplit(
            X_train,
            X_test,
            y_train,
            y_test,
          );
      
          setSplitDone(true);
        } catch (error) {
          console.error("Error during splitting:", error);
        }
      };
      
    const handleProceedToTraining = () => {
        if (!datasetFile) {
            alert("Please upload a dataset first!");
            return;
        }
        router.push("/classification"); 
    };




    return (
        <div className="h-screen bg-gradient-to-r from-black to-gray-1000 text-white">
            <Header></Header>
            <div className="flex border-t border-t-gray-600 border-t-3 mt-18">
                <div className="hidden md:block">
                <aside className="w-72 min-w-72 p-6 flex-shrink-0 h-screen overflow-y-auto border-r border-r-gray-600 border-r-3">
                    <h2 className="text-xl font-bold text-white">Preprocessing Steps</h2>
                    <ul className="mt-4 space-y-4 text-gray-300">
                        <li className="border border-gray-700 p-3 rounded-lg"><a  href="#DatasetStatistics">Dataset Statistics</a></li>
                        <li className="border border-gray-700 p-3 rounded-lg"><a  href="#Handle missing values">Handle missing values</a></li>
                        <li className="border border-gray-700 p-3 rounded-lg"><a  href="#Categorical Encoding">Categorical Encoding</a></li>
                        <li className="border border-gray-700 p-3 rounded-lg"><a  href="#Feature Scaling">Feature Scaling</a></li>
                        <li className="border border-gray-700 p-3 rounded-lg"><a  href="#Data Splitting">Data Splitting</a></li>
                    </ul>
                </aside>
                </div>
                <main className="flex-1 p-8 overflow-auto h-screen">
                    <h1 className="text-3xl font-bold">Data Preprocessing</h1>

                    <div className="mt-6  p-6 rounded-lg bg-gray-800 ">
                            <h2 className="text-xl font-bold">Dataset Preview</h2>
                            {dataset && <ShowDataset dataset={dataset}  />}
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
                        {loading && (
                            <div className="mt-3 text-yellow-400 text-sm">
                                Waking up backend, please wait...
                            </div>
                        )}
                        {columns.length>1 && (
                        <div className="mt-4 max-h-80 overflow-auto border border-gray-600 rounded-md p-2">                        
                        <table className="w-full border-collapse text-sm text-white">
                            <thead>
                                <tr className="bg-gray-700">
                                    { columns.length > 1 && columns.map((col, idx) => (
                                        <th key={idx} className="p-2 border">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                { columns.length > 1 && statistics?.[columns[0]] && Object.keys(statistics[columns[0]] || {}).map((stat, idx) => (
                                    <tr key={idx} className="border-t border-gray-600">
                                        <td className="p-2 border">{stat}</td>
                                        {columns.slice(1).map((col, i) => (
                                            <td key={i} className="p-2 border">
                                                {typeof statistics[col][stat] === 'number'
                                                    ? statistics[col][stat]?.toFixed(2)
                                                    : statistics[col][stat]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        
                        )}
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
                            {allColumns.map((col, idx) => (
                                <option key={idx} value={col}>
                                    {col}
                                </option>
                            ))}
                        </select>
                    </div>

                <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Handle missing values">
                    <h2 className="text-xl font-bold">Handle missing values</h2>
                    <p className="mt-4 text-sm text-gray-300">
                        This section checks for missing values in your dataset and displays the affected columns along with their counts. Identifying and handling these gaps is crucial for building reliable models, as missing data can skew results or cause errors. Click “Handle Missing Values” to automatically address them using predefined strategies.
                    </p>

                    <button
                    className="mt-4 bg-gradient-to-r from-black to-gray-800  border border-white text-white px-4 py-2 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => {
                        fetchMissingValueStats();
                    }}
                    >
                    Check for missing values
                    </button>
                    
                    
                    {missingValues && Object.values(missingValues).every(count => count === 0) ? (
                        <p className="mt-6 text-green-400 text-lg font-semibold">
                            No missing values detected in the dataset.
                        </p>
                    ) : (
                        missingValues && Object.keys(missingValues).length > 0 && (
                            <>
                            <div className="mt-6 bg-gray-800 rounded-lg">
                                <h3 className="font-bold">Missing Value Statistics</h3>
                                <div className="w-half mt-4 max-h-80 overflow-auto border border-gray-600 rounded-md p-2">
                                    <table className="w-full border-collapse text-sm text-white">
                                        <thead>
                                            <tr className="bg-gray-700">
                                                <th className="p-2 border">Column</th>
                                                <th className="p-2 border">Missing Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {Object.entries(missingValues as Record<string, number>).map(([col, count], idx: number) => (
                                            <tr key={idx} className="border-t border-gray-600">
                                                <td className="p-2 border">{col}</td>
                                                <td className="p-2 border">{count}</td>
                                            </tr>
                                        ))}

                                        </tbody>
                                    </table>
                                </div>
                            </div>           
                            <div className="mt-4 flex space-x-4">
                                
                            <button
                                className={`mt-4 bg-gradient-to-r from-black to-gray-800  border border-white text-white px-4 py-2 rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer`}
                                onClick={() => {
                                    handleMissingValues();
                                }}
                                disabled={processing}
                            >
                                Handle Missing Values
                            </button>
                            </div>
                            </>
                    ))}

                    {processedDataset && datasetMissingHandled && <ShowDataset dataset={datasetMissingHandled}  />}

                </div>
                {showChanges && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-50">
                        <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-white mb-4">Changes Made</h2>
                            <ul className="list-disc pl-6 text-gray-300">
                                {changeLogs.map((log, idx) => (
                                    <li key={idx}>{log}</li>
                                ))}
                            </ul>
                            <button
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                                onClick={() => setShowChanges(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
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
                    {processedDataset2 && datasetEncoded && <ShowDataset dataset={datasetEncoded}  />}
                
                </div>
                <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Feature Scaling">
                    <h2 className="text-xl font-bold mb-2">Feature Scaling</h2>
                    <p className="mt-4 text-sm text-gray-300">
                        Feature scaling standardizes the range of numeric features, which helps models converge faster and improves accuracy, especially for algorithms sensitive to magnitude. Apply scaling here to ensure uniform feature contribution.
                    </p>


                    <div className="flex flex-col">
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

                    {scalingApplied && scaledDataset && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold mb-2">Scaled Dataset Preview</h3>
                            <ShowDataset dataset={scaledDataset} />
                        </div>
                    )}
                </div>
                <div className="mt-6 p-6 bg-gray-800 rounded-lg" id="Data Splitting">
                    <h2 className="text-xl font-bold mb-2">Data Splitting</h2>
                    <p className="mt-4 text-sm text-gray-300">
                        Data splitting divides your dataset into training and testing subsets, allowing you to evaluate your model’s performance on unseen data. This step is essential for preventing overfitting and ensuring generalization. Customize your split ratio to balance learning and validation effectively.
                    </p>

                    <div className="flex flex-col space-y-2">
                        <div>
                        <label className="text-white pr-2 pt-2">Target Variable:</label>
                        <input
                            type="text"
                            className="p-1 rounded-lg bg-gray-700 text-white"
                            value={targetVariable}
                            onChange={(e) => setTargetVariable(e.target.value)}
                        />
                        </div>

                        <div>
                        <label className="text-white pr-2">Test Set Percentage:</label>
                        <input
                            type="number"
                            min="1"
                            max="99"
                            className="p-1 rounded-lg bg-gray-700 text-white"
                            value={testPercentage}
                            onChange={(e) => setTestPercentage(Number(e.target.value))}
                        />
                        </div>

                        <button
                        className="w-fit mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={handleSplitDataset}
                        >
                        Apply Split
                        </button>
                    </div>

                    {splitDone && X_train && (
                        <div className="mt-6">
                        <h3 className="text-lg font-bold mb-2">Training Data Preview</h3>
                        <ShowDataset dataset={X_train} />
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