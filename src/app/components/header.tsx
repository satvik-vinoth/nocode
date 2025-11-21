"use client";
import { useState,useEffect,useRef } from "react";
import Link from "next/link";
import { Menu as MenuIcon, X } from "lucide-react";
import { orbitron } from "@/lib/fonts";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  

  const regressModels = [
    "Linear Regression",
    "Polynomial Regression",
    "Decision Tree Regression",
    "Random Forest Regression",
    "Support Vector Regression (SVR)",
    "Ridge Regression",
    "Lasso Regression",
    "K-Nearest Neighbors (KNN) Regression",
    "Gradient Boosting Regression (GBR)",
    "XGBoost Regression",
  ];

  const classifyModels = [
    "Logistic Regression",
    "Decision Tree Classifier",
    "Random Forest Classifier",
    "Support Vector Machine (SVM)",
    "K-Nearest Neighbors (KNN) Classifier",
    "Naive Bayes",
    "Gradient Boosting Classifier (GBC)",
    "XGBoost Classifier",
    "Ridge Classifier",
  ];

  const handleLogout = async () => {
    await fetch(`${baseURL}/logout`, {
      method: "POST",
      credentials: "include"
    });
    
    window.location.href = "/";
    
  }

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
      <div className="flex items-center justify-between px-8 md:px-45 py-4">

        <Link
          href="/"
          className={`text-3xl font-bold ${orbitron.className}`}
        >
          NOCODE
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-purple-400 transition">Home</Link>
          <Link href="/about" className="hover:text-purple-400 transition">Upload</Link>

          <div
            className="relative group"
            onMouseEnter={() => {
              if (closeTimeout.current) clearTimeout(closeTimeout.current);
              setOpenDropdown("regression");
            }}
            onMouseLeave={() => {
              closeTimeout.current = setTimeout(() => {
                setOpenDropdown(null);
              }, 200); 
            }}
          >
            <button className="hover:text-purple-400 transition">Regression</button>

            {openDropdown === "regression" && (
              <div className="absolute left-0 mt-5 w-70 bg-black shadow-lg rounded-lg p-3 max-h-80 overflow-y-auto border border-gray-700">
                {regressModels.map((m) => (
                  <Link
                    key={m}
                    href={`/regression?model=${encodeURIComponent(m)}`}
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative group"
            onMouseEnter={() => {
              if (closeTimeout.current) clearTimeout(closeTimeout.current);
              setOpenDropdown("classification");
            }}
            onMouseLeave={() => {
              closeTimeout.current = setTimeout(() => {
                setOpenDropdown(null);
              }, 200); 
            }}
          >
            <button className="hover:text-purple-400 transition">Classification</button>

            {openDropdown === "classification" && (
              <div className="absolute left-0 mt-5 w-64 bg-black shadow-lg rounded-lg p-3 max-h-80 overflow-y-auto border border-gray-700">
                {classifyModels.map((m) => (
                  <Link
                    key={m}
                    href={`/classification?model=${encodeURIComponent(m)}`}
                    className="block px-3 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {!isLoggedIn && (
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer"
          >
            Login
          </Link>
        )}

        {isLoggedIn && (
          <>

            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
        </nav>

        <button
          className="md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={26} /> : <MenuIcon size={26} />}
        </button>
      </div>

      {isMobileOpen && (
        <nav className="md:hidden bg-black border-t border-gray-800 px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

          <Link
            href="/"
            className="block hover:text-purple-400"
            onClick={() => setIsMobileOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/about"
            className="block hover:text-purple-400"
            onClick={() => setIsMobileOpen(false)}
          >
            Upload
          </Link>

          <div>
            <p className="font-semibold text-white mt-3">Regression</p>
            <div className="mt-2 space-y-2">
              {regressModels.map((m) => (
                <Link
                  key={m}
                  href={`/regression?model=${encodeURIComponent(m)}`}
                  className="block text-sm hover:text-purple-400"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {m}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-white mt-3">Classification</p>
            <div className="mt-2 space-y-2">
              {classifyModels.map((m) => (
                <Link
                  key={m}
                  href={`/classification?model=${encodeURIComponent(m)}`}
                  className="block text-sm hover:text-purple-400"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {m}
                </Link>
              ))}
            </div>
          </div>

          {!isLoggedIn && (
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer"
          >
            Login
          </Link>
        )}

        {isLoggedIn && (
          <>

            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </>
        )}

        </nav>
      )}
    </header>
  );
}
