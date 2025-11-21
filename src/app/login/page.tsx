"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [message, setMessage] = useState("");

   const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setMessage("Server error. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Login
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleLogin}>

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

          <button
            type="submit"
            className="w-full bg-purple-700 cursor-pointer hover:bg-purple-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Login
          </button>
          <p className="text-red-400 text-[13px]">{message}</p>
        </form>

        <div className="text-center text-gray-500 text-sm mt-4">OR</div>

        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Not registered?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
