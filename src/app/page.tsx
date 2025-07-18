import Link from "next/link";
import Header from "./components/header";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";
import { Upload, Cpu, BarChart3 } from "lucide-react";
import { FlipWords } from "./components/ui/flip-words";

export default function Home() {
    const words = ["Intelligence", "Insights", "Predictions", "Decisions"];
    
    return (
        <div className="flex flex-col bg-gradient-to-r from-black to-gray-800">
            <Header></Header>
            <div className="flex pl-50">
                <div className="h-full w-[300px] flex flex-col  justify-center">
                    <h2 className="text-5xl font-bold text-white pt-60 pl-2">Transform Data into </h2>
                    <h2 className="text-5xl font-bold text-white">
                        <span className="inline-block w-[240px]">
                            <FlipWords words={words} />
                        </span>
                    </h2>

                    <div className="mt-3">
                        <Link href="/about">
                            <button className="w-40 m-2 bg-gradient-to-r from-purple-600 to-purple-900 text-white-500 px-6 py-3 rounded-lg text-lg font-bold shadow-lg hover:scale-105 cursor-pointer">
                                Get Started
                            </button>
                        </Link>                        
                    </div>
                </div>
                <div className="h-full w-188 flex items-center justify-center text-center ml-20 mr-20 mb-20 rounded-4xl z-10">
                <BackgroundGradientAnimation>
                    <div className=" flex  text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-5xl">
                        <div className="bg-clip-text text-transparent drop-shadow-2xl bg-white">
                            <p className="pr-30 pl-48 pt-62 text-right">
                            Upload dataset, select model, let AI do the work.
                            </p>
                        </div>
                    </div>
                </BackgroundGradientAnimation>                 
                </div>
            </div>
            <div className="text-center">

          

          <div className=" text-white py-20 px-6">
                <h2 className="text-center text-4xl font-bold mb-12">Why use NOCODE?</h2>
                
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-80 text-center transition-transform duration-300 hover:scale-105">
                        <Upload size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">Easy Data Upload</h3>
                        <p className="text-gray-400 mt-2">
                            Simply drag and drop your CSV files to start training your models.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-80 text-center transition-transform duration-300 hover:scale-105">
                        <Cpu size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">Automated ML</h3>
                        <p className="text-gray-400 mt-2">
                            Our system automatically handles model training and optimization.
                        </p>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-80 text-center transition-transform duration-300 hover:scale-105">
                        <BarChart3 size={40} className="text-purple-500 mx-auto" />
                        <h3 className="text-xl font-bold mt-4">Visual Insights</h3>
                        <p className="text-gray-400 mt-2">
                            Get clear visual reports and performance metrics for your models.
                        </p>
                    </div>
                </div>
            </div>

          <div className="mt-6 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed ml-20 mr-20 mb-30">
            <p>
              Our platform empowers you to upload your data, choose from
              state-of-the-art models, and let AI handle the training,
              evaluation, and deployment.
            </p>
            <p className="mt-4">
              Whether you&apos;re a student, researcher, or business, we make machine
              learning accessible, fast, and intuitive.
            </p>
          </div>
        </div>
        </div>
    );
}
