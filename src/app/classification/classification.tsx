"use client";

import { useState,useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModelTrainer from "../components/ModelTrainer";
import {
  Sliders,
  TreeDeciduous,
  Trees,
  BrainCircuit,
  Users,
  FunctionSquare,
  TrendingUp,
  Rocket,
  MoveDiagonal
} from "lucide-react";

type ClassificationTrainingResult = {
  message: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
  };
  model_info: {
    feature_importances?: number[];
  };
};

export default function ClassificationPage() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const params = useSearchParams();

  const [datasetId,setDatasetId] = useState<string | null>(params.get("dataset")); 
  
  const [results, setResults] = useState<Record<string, ClassificationTrainingResult>>({});
  const [selectedModel, setSelectedModel] = useState<string>("Logistic Regression");
  const current = results[selectedModel];

  


  const classificationModels = [
        { 
            name: "Logistic Regression", 
            description: "A linear model used for binary and multi-class classification.", 
            icon: <Sliders size={20} className="text-blue-500" /> 
        },
        { 
            name: "Decision Tree Classifier", 
            description: "Uses a tree-like model to make decisions and classify data.", 
            icon: <TreeDeciduous size={20} className="text-orange-500" /> 
        },
        { 
            name: "Random Forest Classifier", 
            description: "An ensemble of decision trees to improve classification accuracy.", 
            icon: <Trees size={20} className="text-green-500" /> 
        },
        { 
            name: "Support Vector Machine (SVM)", 
            description: "Maximizes the margin between classes using hyperplanes.", 
            icon: <BrainCircuit size={20} className="text-purple-500" /> 
        },
        { 
            name: "K-Nearest Neighbors (KNN) Classifier", 
            description: "Classifies based on the majority class among k-nearest neighbors.", 
            icon: <Users size={20} className="text-pink-500" /> 
        },
        { 
            name: "Naive Bayes", 
            description: "A probabilistic classifier based on Bayes' theorem.", 
            icon: <FunctionSquare size={20} className="text-yellow-500" /> 
        },
        { 
            name: "Gradient Boosting Classifier (GBC)", 
            description: "An ensemble method that builds classifiers sequentially to improve accuracy.", 
            icon: <TrendingUp size={20} className="text-cyan-500" /> 
        },
        { 
            name: "XGBoost Classifier", 
            description: "An optimized and regularized gradient boosting classifier.", 
            icon: <Rocket size={20} className="text-blue-500" /> 
        },
        { 
            name: "Ridge Classifier", 
            description: "A linear classifier using L2 regularization to prevent overfitting.", 
            icon: <MoveDiagonal size={20} className="text-red-500" /> 
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
      const res = await fetch(`${baseURL}/train/train-classifier`, {
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
    router.push(`/preprocessing?dataset=${datasetId}&type=classification`);
  };
  

  return (
    <div>
      <ModelTrainer
        type="classification"
        models={classificationModels}
        datasetId={datasetId}
        onTrain={handleTrain}
        onPreprocess={handlePreprocess}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        setDatasetId={setDatasetId}
      />

      {current && (
        <div className="mt-50 md:mt-35  p-6 px-30 rounded-2xl text-gray-300 shadow-xl ring-1 ring-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Model Evaluation Results</h2>

          <p className="mb-2 text-lg text-indigo-300">{current.message}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm md:text-base">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold"> Accuracy</h3>
              <p>{current.metrics.accuracy}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold">Precision</h3>
              <p>{current.metrics.precision}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold">F1 Score</h3>
              <p>{current.metrics.f1_score}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold"> Recall</h3>
              <p>{current.metrics.recall}</p>
            </div>
          </div>

          {current.metrics.confusion_matrix && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-indigo-300 mb-3"> Confusion Matrix</h3>
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-600 w-full">
                  <tbody>
                    {current.metrics.confusion_matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="border border-gray-200 px-4 py-2 text-center text-white"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
