"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BackendLoading from "./components/BackendLoading";
import Header from "./components/header";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";
import { Upload, Cpu, BarChart3 } from "lucide-react";
import { FlipWords } from "./components/ui/flip-words";

export default function Home() {
    const words = ["Intelligence", "Insights", "Predictions", "Decisions"];
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [backendAlive, setBackendAlive] = useState<boolean | null>(null);

    useEffect(() => {
        const checkBackend = async () => {
            try {
                const res = await fetch(`${baseURL}`, { cache: "no-store" });
                if (res.ok) {
                    setBackendAlive(true);
                } else {
                    setBackendAlive(false);
                }
            } catch {
                setBackendAlive(false);
            }
        };

        checkBackend();
        const interval = setInterval(() => {
            if (!backendAlive) checkBackend();
        }, 3000);

        return () => clearInterval(interval);
    }, [backendAlive, baseURL]);

    if (backendAlive === false || backendAlive === null) {
        return <BackendLoading />;
    }


    return (
        <div className="flex flex-col bg-gradient-to-r from-black to-gray-800 min-h-screen">
            <Header />
            <div className="flex  flex-col sm:flex-row items-center justify-between pt-18">
                <div className="w-full  sm:w-[40%] text-center sm:text-left">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white break-words text-balance sm:pl-[35%] mt-10">
                        Transform Data into
                    </h2>
                    <h2 className="text-3xl sm:text-5xl font-bold text-white break-words text-balance sm:pl-[33%]">
                        <span className="inline-block max-w-[90%]  lg:mx-0">
                            <FlipWords words={words} />
                        </span>
                    </h2>
                    <div className="mt-6 sm:pl-[35%]">
                        <Link href="/about">
                            <button className=" bg-gradient-to-r from-purple-600 to-purple-900 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer mb-5 md:mb-0">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="w-full sm:w-[60%] flex items-center justify-center sm:h-full overflow-x-hidden">
                    <div className="relative w-full h-screen z-10">
                        <BackgroundGradientAnimation />
                        
                        <div className="absolute inset-0 flex items-center  justify-center p-8md:justify-end md:pr-45 md:pl-40">
                            <p className="text-white font-bold text-3xl sm:text-5xl bg-clip-text text-transparent drop-shadow-2xl text-center md:text-right">
                                Upload dataset, select model, let AI do the work.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="text-center px-6 py-20">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">Why use NOCODE?</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <Upload size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Easy Data Upload</h3>
                        <p className="text-gray-400 mt-2">
                            Simply drag and drop your CSV files to start training your models.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <Cpu size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Automated ML</h3>
                        <p className="text-gray-400 mt-2">
                            Our system automatically handles model training and optimization.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <BarChart3 size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Visual Insights</h3>
                        <p className="text-gray-400 mt-2">
                            Get clear visual reports and performance metrics for your models.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-neutral-400 text-base leading-relaxed px-6 lg:px-32 pb-20 text-center">
                <p className="mt-4">
                    Whether you&apos;re a student, researcher, or business, we make machine
                    learning accessible, fast, and intuitive.
                </p>
            </div>
        </div>
    );
}
