"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [message, setmessage] = useState("");

  function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setmessage("Passwords do not match");
      return;
    }

    if (!isValidEmail(email)) {
      setmessage("Please enter a valid email address.");
      return;
    }

    try{
        const response = await fetch(`${baseURL}/register`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password})
        })
        if (!response.ok){
          const errorData = await response.json();
          setmessage(errorData.detail || "Registration failed");
          return;
        }
        window.location.href = "/login";
    }catch(e){
        setmessage("An error occurred. Please try again.");
        console.error("Registration error:", e);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 cursor-pointer hover:bg-purple-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Register
          </button>
          <p className="text-red-400 text-[13px]">{message}</p>
        </form>

        <div className="text-center text-gray-500 text-sm mt-4">OR</div>

        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
