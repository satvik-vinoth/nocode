"use client"
import Header from "../components/header";

import { useState,useEffect } from "react";
import { FileUpload } from "../components/ui/file-upload";
import { useRouter } from "next/navigation";
import ShowDataset from "../components/ShowDataset";

export default function About() {
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetPreview, setDatasetPreview] = useState<string[][] | null>(null);
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

  const handleUpload = async (files: File[]) => {
    const file = files?.[0];
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
  

    const handleClearDataset = async () => {
        if (!datasetId) return;
        setDatasetId(null);
        setDatasetPreview(null);
      };

    
    const handleSelect = (type: "regression" | "classification") => {
        if (!datasetId) {
        return;
        }
        router.push(`/${type}?dataset=${datasetId}`);
    };

    const loadSampleDataset = async () => {
    
      const res = await fetch(
        `${baseURL}/dataset/clone/691ec87a228a2938a0e46479`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    
      const data = await res.json();
      setDatasetId(data.dataset_id);
      setDatasetPreview(data.preview);
    };
      
  return (
    <div className="bg-gradient-to-r from-black to-gray-800 min-h-screen">
      <Header />
      {isLoggedIn === false ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <h1 className="text-4xl font-bold mb-4">Please Log In</h1>
          <p className="text-lg">You must be logged in to upload datasets and use the application.</p>
        </div>) :
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-30">
        {!datasetId ? (
                      <div>
                      <div className="w-full max-w-4xl mx-auto min-h-86 border border-dashed rounded-lg">
                          <FileUpload onChange={handleUpload} />
                          
                      </div>
                      <button
                              className="mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
                              onClick={() => loadSampleDataset()}
                          >
                              Load Sample Dataset
                      </button>
                  </div>

                  ) : (
                      <ShowDataset dataset={datasetPreview!}  onDelete={handleClearDataset} />
          )}

          <div className="flex flex-col items-center justify-center min-h-screen text-white">
              <h1 className="text-4xl font-bold mb-10">Choose Your Model</h1>
              <div className="flex flex-col md:flex-row gap-6 w-full px-4 md:px-0">
                  <button
                  onClick={() => handleSelect("regression")}
                  className="bg-gray-800 hover:bg-purple-600 text-white p-6 rounded-lg w-full md:w-1/2 hover:scale-105 transition-all cursor-pointer"
                  >
                  <h2 className="text-2xl font-semibold">Regression</h2>
                  <p className="text-sm text-gray-300 mt-2">Predict numbers (e.g., price, score).</p>
                  </button>

                  <button
                  onClick={() => handleSelect("classification")}
                  className="bg-gray-800 hover:bg-pink-600 text-white p-6 rounded-lg w-full md:w-1/2 hover:scale-105 transition-all cursor-pointer"
                  >
                  <h2 className="text-2xl font-semibold">Classification</h2>
                  <p className="text-sm text-gray-300 mt-2">Predict categories (e.g., spam/ham).</p>
                  </button>
              </div>
          </div>   
        </div>
      }
    </div>
      
  );
}
