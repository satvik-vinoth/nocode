"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Dataset = string[][];

type FeatureMatrix = string[][];
type TargetVector = string[];

type DatasetContextType = {
  dataset: Dataset | null;
  setDataset: React.Dispatch<React.SetStateAction<Dataset | null>>;

  datasetFile: File | null;
  setDatasetFile: React.Dispatch<React.SetStateAction<File | null>>;

  X: FeatureMatrix | null;
  setX: React.Dispatch<React.SetStateAction<FeatureMatrix | null>>;

  y: TargetVector | null;
  setY: React.Dispatch<React.SetStateAction<TargetVector | null>>;

  X_scaled: FeatureMatrix | null;
  setXScaled: React.Dispatch<React.SetStateAction<FeatureMatrix | null>>;

  X_train: FeatureMatrix | null;
  X_test: FeatureMatrix | null;
  y_train: TargetVector | null;
  y_test: TargetVector | null;

  setTrainTestSplit: (
    X_train: FeatureMatrix,
    X_test: FeatureMatrix,
    y_train: TargetVector,
    y_test: TargetVector
  ) => void;
};

// Create context
const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Provider component
type Props = { children: ReactNode };

export const DatasetProvider = ({ children }: Props) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);

  const [X, setX] = useState<FeatureMatrix | null>(null);
  const [y, setY] = useState<TargetVector | null>(null);
  const [X_scaled, setXScaled] = useState<FeatureMatrix | null>(null);

  const [X_train, setXTrain] = useState<FeatureMatrix | null>(null);
  const [X_test, setXTest] = useState<FeatureMatrix | null>(null);
  const [y_train, setYTrain] = useState<TargetVector | null>(null);
  const [y_test, setYTest] = useState<TargetVector | null>(null);

  const setTrainTestSplit = (
    X_train: FeatureMatrix,
    X_test: FeatureMatrix,
    y_train: TargetVector,
    y_test: TargetVector
  ) => {
    setXTrain(X_train);
    setXTest(X_test);
    setYTrain(y_train);
    setYTest(y_test);
  };

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        setDataset,
        datasetFile,
        setDatasetFile,
        X,
        setX,
        y,
        setY,
        X_scaled,
        setXScaled,
        X_train,
        X_test,
        y_train,
        y_test,
        setTrainTestSplit,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

// Hook to consume context
export const useDataset = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return context;
};
