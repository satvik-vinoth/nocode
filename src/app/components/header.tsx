"use client";
import { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { orbitron } from "@/lib/fonts";
import { Menu as MenuIcon, X } from "lucide-react";

export default function Header() {
  const [active, setActive] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
  ];

  return (
    <div className="flex w-full items-center fixed top-0 left-0 right-0 z-50 bg-black text-white">

      <div className={`pl-7 md:pl-45 pr-4 text-3xl font-bold ${orbitron.className}`}>NOCODE</div>

      <div className="hidden md:flex md:pl-34">
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

      <div className="ml-auto pr-4 md:hidden">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

        {isMobileOpen && (
        <div className="absolute top-full left-0 w-full bg-black md:hidden z-40 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-4 p-4">
            <HoveredLink href="/" onClick={() => setIsMobileOpen(false)}>Home</HoveredLink>
            <HoveredLink href="/about" onClick={() => setIsMobileOpen(false)}>Upload</HoveredLink>

            <div className="text-white font-semibold">Regression</div>
            <div className="flex flex-col space-y-2 text-sm">
                {models.map((m) => (
                <HoveredLink
                    key={m}
                    href={`/regression?model=${encodeURIComponent(m)}`}
                    onClick={() => setIsMobileOpen(false)}
                >
                    {m}
                </HoveredLink>
                ))}
            </div>

            <div className="text-white font-semibold mt-4">Classification</div>
            <div className="flex flex-col space-y-2 text-sm">
                {model.map((m) => (
                <HoveredLink
                    key={m}
                    href={`/classification?model=${encodeURIComponent(m)}`}
                    onClick={() => setIsMobileOpen(false)}
                >
                    {m}
                </HoveredLink>
                ))}
            </div>
            </div>
        </div>
        )}

    </div>
  );
}
