"use client"
import { useState } from "react";
import React from "react";

interface ShowDatasetProps {
  dataset: string[][] | null;
  title?: string;
}

const ShowDataset: React.FC<ShowDatasetProps> = ({ dataset }) => {

  const [showFullDataset, setShowFullDataset] = useState(false);

  if (!dataset || dataset.length === 0) {
    return <p>No dataset to display.</p>;
  }


  return (
    <div>
    <div className="mt-4 max-h-60 overflow-auto border border-gray-600 rounded-md p-2">
        <table className="w-full border-collapse text-sm min-w-max">
        <thead>
            {dataset && dataset.length > 0 && dataset[0] ? (
                <tr className="bg-gray-700 text-white">
                    {dataset[0].map((col: string, idx: number) => (
                        <th key={idx} className="p-2 border">{col}</th>
                    ))}
                </tr>
            ) : (
                <tr>
                    <th className="p-2 border">No data available</th>
                </tr>
            )}
        </thead>
        <tbody>
            {dataset && dataset.length > 1 ? (
                dataset.slice(1).map((row: string[], idx: number) => (
                    <tr key={idx} className="border-t border-gray-600">
                        {row.map((cell: string, i: number) => (
                            <td key={i} className="p-2 border">{cell}</td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    
                </tr>
            )}
        </tbody>

        

        </table>
    </div>
    <button
        className="mt-4 bg-gradient-to-r from-black to-gray-800 text-white border border-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 cursor-pointer"
        onClick={() => setShowFullDataset(true)}
    >
        Expand Dataset
    </button>

    {showFullDataset && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-6 z-50">
                        <h2 className="text-2xl font-bold text-white mb-4">Full Dataset</h2>
                        
                        {/* Scrollable Dataset Table */}
                        <div className="overflow-auto max-h-[80vh] w-11/12 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <table className="w-full border-collapse text-sm text-white">
                                <thead>
                                    <tr className="bg-gray-700">
                                        {dataset && dataset[0].map((col:string, idx:number) => (
                                            <th key={idx} className="p-2 border">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataset && dataset.map((row:string[], idx:number) => (
                                        <tr key={idx} className="border-t border-gray-600">
                                            {row.map((cell:string, i:number) => (
                                                <td key={i} className="p-2 border">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                            onClick={() => setShowFullDataset(false)}
                        >
                            Close
                        </button>
                    </div>
                )}

    </div>
  );
};

export default ShowDataset;
