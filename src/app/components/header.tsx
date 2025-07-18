"use client"
import { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { orbitron } from "@/lib/fonts";

export default function Header() {
    const [active, setActive] = useState<string | null>(null);
    const models = [
        "Linear Regression",
        "Polynomial Regression",
        "Decision Tree Regression",
        "Random Forest Regression",
        "Support Vector Regression (SVR)",
        "Ridge Regression",
        "Lasso Regression",
        "K-Nearest Neighbors (KNN) Regression",
        "Gradient Boosting Regression (GBR)",
        "XGBoost Regression"
      ];
    const model = [
        "Logistic Regression",
        "Decision Tree Classifier",
        "Random Forest Classifier",
        "Support Vector Machine (SVM)",
        "K-Nearest Neighbors (KNN) Classifier",
        "Naive Bayes",
        "Gradient Boosting Classifier (GBC)",
        "XGBoost Classifier",
        "Ridge Classifier"
    ]
    
    return (
        <div className="flex w-full text-white items-center fixed top-0 left-0 right-0 z-50 bg-black">
            <div className={` pl-50 pr-30 text-3xl font-bold ${orbitron.className}`}>NOCODE</div>
            <div className="flex">
                <Menu setActive={setActive}>
                <HoveredLink href="/">Home</HoveredLink>
                <HoveredLink href="/about">Upload</HoveredLink>
                <MenuItem setActive={setActive} active={active} item="Regression">
                    <div className="flex flex-col space-y-4 text-sm z-100">
                    {models.map((model) => (
                        <HoveredLink 
                            key={model} 
                            href={`/regression?model=${encodeURIComponent(model)}`}
                        >
                            {model}
                        </HoveredLink>
                    ))}
                    </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Classification">
                    <div className="flex flex-col space-y-4 text-sm z-100">
                    {model.map((model) => (
                        <HoveredLink 
                            key={model} 
                            href={`/classification?model=${encodeURIComponent(model)}`}
                        >
                            {model}
                        </HoveredLink>
                    ))}
                    </div>
                </MenuItem>
                
                </Menu>
            </div>
        </div>

    )
}