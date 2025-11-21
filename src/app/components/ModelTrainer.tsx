"use client";

import { useState, useEffect } from "react";
import Header from "./header";
import { Upload } from "lucide-react";
import ShowDataset from "./ShowDataset";

interface ModelDefinition {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ModelTrainerProps {
  type: "regression" | "classification";
  models: ModelDefinition[];
  datasetId: string | null;
  onTrain: (modelName: string,testPercentage : number) => void;
  onPreprocess: () => void;
  selectedModel: string;
  setSelectedModel: (name: string) => void;
  setDatasetId: (id: string | null) => void;
}

export default function ModelTrainer({
  type,
  models,
  datasetId,
  onTrain,
  onPreprocess,
  selectedModel,
  setSelectedModel,
  setDatasetId
}: ModelTrainerProps) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [datasetPreview, setDatasetPreview] = useState<string[][] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [testPercentage, setTestPercentage] = useState(20);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${baseURL}/auth/status`, {
          credentials: "include", 
        });
  
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!datasetId) return;

    console.log("BASEURL = ", baseURL);
    console.log("DATASETID = ", datasetId);


    const fetchDataset = async () => {
      try {
        const res = await fetch(`${baseURL}/dataset/get/${datasetId}`);
        const data = await res.json();
        setDatasetPreview(data.preview);
      } catch (err) {
        console.error("Dataset fetch error:", err);
      }
    };

    fetchDataset();
  }, [datasetId, baseURL]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
  
    try {
      const response = await fetch(`${baseURL}/dataset/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
  
      const data = await response.json();
  
      setDatasetId(data.dataset_id);
      setDatasetPreview(data.preview);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleClearDataset = () => {
    setDatasetPreview(null);
    window.location.href = "/about";
  };

  return (
    <div className="h-screen bg-gradient-to-r from-black to-gray-1000 flex flex-col">
      <Header />
      {isLoggedIn === false ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-4xl font-bold mb-4">Please Log In</h1>
        <p className="text-lg">You must be logged in to upload datasets and use the application.</p>
        </div>) : (
        <>
          <div className="md:hidden px-4 py-20">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white text-black px-4 py-2 rounded-lg font-bold"
            >
              {isSidebarOpen ? "Close Menu" : "Open Menu"}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="md:hidden fixed top-17 left-0 right-0 bottom-0 bg-black z-50 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Classification Models</h2>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white text-2xl focus:outline-none"
                    aria-label="Close Sidebar"
                >
                    &times;
                </button>
                </div>

                <div className="mt-4 space-y-4">
                {models.map((model) => (
                    <button
                    key={model.name}
                    className={`block w-full p-3 text-left rounded-lg border transition-all duration-300 hover:scale-105 ${
                        selectedModel === model.name
                        ? "border-white bg-gradient-to-r from-black to-gray-800 text-white"
                        : "hover:border-gray-600 hover:bg-gradient-to-r from-black to-gray-800"
                    }`}
                    onClick={() => {
                        setSelectedModel(model.name);
                        setIsSidebarOpen(false);
                    }}
                    >
                    <div className="flex items-center gap-3">
                        {model.icon}
                        <span className="font-semibold">{model.name}</span>
                    </div>
                    <p className="text-white text-sm mt-1">{model.description}</p>
                    </button>
                ))}
                </div>
            </div>
          )}

          <div className="flex border-t border-t-gray-600 md:mt-18 ">
            <aside className="hidden md:block w-72 min-w-72 p-6 h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-white-500">
                {type === "regression" ? "Regression Models" : "Classification Models"}
              </h2>

              <div className="mt-4 space-y-4">
                {models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedModel(m.name)}
                    className={`w-full p-3 text-left rounded-lg border transition-all hover:scale-105 ${
                      selectedModel === m.name
                        ? "border-white bg-gradient-to-r from-black to-gray-800 text-white"
                        : "hover:border-gray-600 hover:bg-gradient-to-r from-black to-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {m.icon}
                      <span className="font-semibold">{m.name}</span>
                    </div>
                    <p className="text-white-400 text-sm mt-1">{m.description}</p>
                  </button>
                ))}
              </div>
            </aside>
            <main className="flex-1 p-8 overflow-auto h-screen">
              <h1 className="text-3xl font-bold">{selectedModel}</h1>
              {!datasetPreview ? (
                <div className="mt-6 p-6 rounded-lg text-center hover:scale-105">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload size={40} className="text-white-500" />
                    <span className="mt-2 text-white">Click to upload dataset</span>
                    <input type="file" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              ) : (
                <div className="mt-6 p-6 rounded-lg bg-gray-800 text-gray-300"> 
                    <ShowDataset dataset={datasetPreview} onDelete={handleClearDataset} />
                </div>
              )}
              <div className="mt-6 p-6 rounded-lg bg-gray-800 text-gray-300">
                <h2 className="text-xl font-bold text-white">Data Preprocessing</h2>
                <p className="mt-2 text-sm leading-relaxed">
                    Before training a machine learning model, raw data needs to be cleaned and transformed 
                    into a suitable format. Data preprocessing ensures that your dataset is structured, 
                    free of inconsistencies, and ready for analysis.
                </p>     

                <p className="mt-4 text-sm">
                    Skipping data preprocessing can lead to inaccurate predictions, biased models, and poor performance. 
                    It&apos;s an essential step to ensure high-quality results from machine learning models.
                </p>

                <button
                  onClick={onPreprocess}
                  className="mt-4 bg-gradient-to-r from-black to-gray-800 text-white border px-4 py-2 rounded-lg hover:scale-105"
                >
                  Proceed to Data Preprocessing
                </button>
              </div>
              <div className="mt-6 p-6 rounded-lg bg-gray-800 text-gray-300">
                <h2 className="text-xl font-bold text-white">Training</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                Training data is the foundation of any machine learning model. It consists of input examples — typically rows of structured data — 
                along with their corresponding labels or target values (in supervised learning). This data is used by the model to learn patterns, 
                relationships, and behaviors that can later be applied to unseen data.
                </p>     

                <p className="mt-4 text-sm text-gray-300">
                The accuracy and effectiveness of any machine learning model depend heavily on the quality and quantity of the training data. 
                Inadequate or biased training data can lead to unreliable predictions and poor generalization to new inputs.
                </p>

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
                  onClick={() => onTrain(selectedModel, testPercentage)}
                  className="mt-4 bg-gradient-to-r from-black to-gray-800 text-white border px-4 py-2 rounded-lg hover:scale-105"
                >
                  Start Training
                </button>
              </div>
            </main>
          </div>
        </>
        )}
    </div>
  );
}
