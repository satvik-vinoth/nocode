"use client";

import { useState,useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ModelTrainer from "../components/ModelTrainer";
import {
  Sliders,
  FunctionSquare,
  TreeDeciduous,
  Trees,
  BrainCircuit,
  MoveDiagonal,
  Crop,
  Users,
  TrendingUp,
  Rocket
} from "lucide-react";

type RegressionTrainingResult = {
  message: string;
  metrics: {
    mse: number;
    mae: number;
    r2_score: number;
  };
  model_info: {
    coefficients?: number[];
    intercept?: number;
  };
};

export default function RegressionPage() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const params = useSearchParams();
  const [datasetId,setDatasetId] = useState<string | null>(params.get("dataset")); 

  const [results, setResults] = useState<Record<string, RegressionTrainingResult>>({});
  const model = params.get("model");
  const [selectedModel, setSelectedModel] = useState<string>(model || "Linear Regression");
  const result = results[selectedModel];

  const regressionModels = [
    { 
        name: "Linear Regression", 
        description: "Linear Regression for multiple independent variables.", 
        icon: <Sliders size={20} className="text-blue-500" /> 
    },
    { 
        name: "Polynomial Regression", 
        description: "Fits polynomial relationships for non-linear data.", 
        icon: <FunctionSquare size={20} className="text-yellow-500" /> 
    },
    { 
        name: "Decision Tree Regression", 
        description: "Uses tree structures for prediction, handling non-linear data well.", 
        icon: <TreeDeciduous size={20} className="text-orange-500" /> 
    },
    { 
        name: "Random Forest Regression", 
        description: "An ensemble of decision trees to improve accuracy.", 
        icon: <Trees size={20} className="text-green-500" /> 
    },
    { 
        name: "Support Vector Regression (SVR)", 
        description: "Uses Support Vector Machines for regression with different kernels.", 
        icon: <BrainCircuit size={20} className="text-purple-500" /> 
    },
    { 
        name: "Ridge Regression", 
        description: "L2-regularized regression to reduce overfitting.", 
        icon: <MoveDiagonal size={20} className="text-red-500" /> 
    },
    { 
        name: "Lasso Regression", 
        description: "L1-regularized regression that can perform feature selection.", 
        icon: <Crop size={20} className="text-indigo-500" /> 
    },
    { 
        name: "K-Nearest Neighbors (KNN) Regression", 
        description: "Predicts values based on k-nearest neighbors' average.", 
        icon: <Users size={20} className="text-pink-500" /> 
    },
    { 
        name: "Gradient Boosting Regression (GBR)", 
        description: "Boosted decision trees optimized for regression tasks.", 
        icon: <TrendingUp size={20} className="text-cyan-500" /> 
    },
    { 
        name: "XGBoost Regression", 
        description: "Optimized gradient boosting with better regularization.", 
        icon: <Rocket size={20} className="text-blue-500" /> 
    },
    ];

    useEffect(() => {
        const model = params.get("model");
        if (model) {
          setSelectedModel(model);
        }
      }, [params]);

  const handleTrain = async (modelName: string, testPercentage: number) => {
    if (!datasetId) return alert("Dataset missing!");

    const target = params.get("target");
    if (!target){
      return alert("Target variable not specified! Please Pick in Preprocessing step.");
    }

    try {
      const res = await fetch(`${baseURL}/train/train-regressor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId,
          model_name: modelName,
          target_variable: target,
          test_percentage: testPercentage
        })
      });

      const data = await res.json();
      setResults(prev => ({
        ...prev,
        [modelName]: data   
      }));

    } catch (err) {
      console.error(err);
      alert("Training failed");
    }
  };

  const handlePreprocess = () => {
    if (!datasetId) {
      return alert("Dataset missing!");
    }
    router.push(`/preprocessing?dataset=${datasetId}&type=regression`);
  };
  

  return (
    <div>
      <ModelTrainer
        type="regression"
        models={regressionModels}
        datasetId={datasetId}
        onTrain={handleTrain}
        onPreprocess={handlePreprocess}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        setDatasetId={setDatasetId}
      />

      {result && (
        <div className="mt-12 w-full flex justify-center">
          <div className="w-full rounded-2xl bg-gradient-to-b from-gray-900 to-black p-8 shadow-[0_0_25px_rgba(0,0,0,0.4)] animate-[fadeIn_0.4s_ease]">
            
            <h2 className="text-3xl font-extrabold text-indigo-400 mb-6 text-center tracking-wide">
              Model Results
            </h2>
            <div className="text-center mb-8">
              <p className="text-gray-300 text-lg">
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 font-medium">R² Score</p>
                <p className="text-2xl font-bold text-indigo-300 mt-1">
                  {result.metrics.r2_score.toFixed(4)}
                </p>
              </div>

              <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 font-medium">MSE</p>
                <p className="text-2xl font-bold text-cyan-300 mt-1">
                  {result.metrics.mse.toFixed(4)}
                </p>
              </div>

              <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 font-medium">MAE</p>
                <p className="text-2xl font-bold text-pink-300 mt-1">
                  {result.metrics.mae.toFixed(4)}
                </p>
              </div>

            </div>

            {result.model_info.coefficients && result.model_info.coefficients.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-indigo-300 mb-3">Coefficients</h3>

                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <ul className="space-y-2">
                    {result.model_info.coefficients.map((coef, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between text-gray-300 text-sm bg-gray-900/50 p-3 rounded-lg"
                      >
                        <span className="text-white font-medium">Feature {idx + 1}:</span>
                        <span>{coef}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.model_info.intercept !== undefined && (
              <div className="mt-8 bg-gray-800/50 p-5 border border-gray-700 rounded-xl">
                <p className="text-lg text-gray-200">
                  <span className="font-semibold text-white">Intercept:</span>{" "}
                  {result.model_info.intercept}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

