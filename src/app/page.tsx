import Link from "next/link";
import Header from "./components/header";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";
import { Upload, Cpu, BarChart3 } from "lucide-react";
import { FlipWords } from "./components/ui/flip-words";

export default function Home() {
    const words = ["Intelligence", "Insights", "Predictions", "Decisions"];

    return (
        <div className="flex flex-col bg-gradient-to-r from-black to-gray-800 min-h-screen">
            <Header />
            <div className="flex  flex-col sm:flex-row items-center justify-between pt-18">
                <div className="w-full sm:w-[40%] text-center sm:text-left mb-[3%]">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white break-words text-balance sm:pl-[35%]">
                        Transform Data into
                    </h2>
                    <h2 className="text-3xl sm:text-5xl font-bold text-white break-words text-balance sm:pl-[33%]">
                        <span className="inline-block max-w-[90%]  lg:mx-0">
                            <FlipWords words={words} />
                        </span>
                    </h2>
                    <div className="mt-6 sm:pl-[35%]">
                        <Link href="/about">
                            <button className=" bg-gradient-to-r from-purple-600 to-purple-900 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-lg hover:scale-105 transition-transform ">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Animation Section */}
                <div className="w-full sm:w-[60%] flex items-center justify-center sm:h-full">
                    <BackgroundGradientAnimation >

                        <div className="text-white font-bold px-4 text-center sm:text-right text-3xl pl-[33%] mt-[39%] mr-[20%] sm:text-5xl sm:mt-[22%] ">
                            <p className="bg-clip-text text-transparent bg-white drop-shadow-2xl ">
                                Upload dataset, select model, let AI do the work.
                            </p>
                        </div>

                    </BackgroundGradientAnimation >
                </div>
            </div>


            {/* Features Section */}
            <div className="text-center px-6 py-20">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">Why use NOCODE?</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Feature 1 */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <Upload size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Easy Data Upload</h3>
                        <p className="text-gray-400 mt-2">
                            Simply drag and drop your CSV files to start training your models.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <Cpu size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Automated ML</h3>
                        <p className="text-gray-400 mt-2">
                            Our system automatically handles model training and optimization.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-72 sm:w-80 text-center hover:scale-105 transition-transform">
                        <BarChart3 size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4 text-white">Visual Insights</h3>
                        <p className="text-gray-400 mt-2">
                            Get clear visual reports and performance metrics for your models.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final CTA Paragraph */}
            <div className="text-neutral-400 text-base leading-relaxed px-6 lg:px-32 pb-20 text-center">
                <p>
                    Our platform empowers you to upload your data, choose from state-of-the-art
                    models, and let AI handle the training, evaluation, and deployment.
                </p>
                <p className="mt-4">
                    Whether you&apos;re a student, researcher, or business, we make machine
                    learning accessible, fast, and intuitive.
                </p>
            </div>
        </div>
    );
}
