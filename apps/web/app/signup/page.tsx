"use client";

import Link from "next/link";
import { Kanban, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4 py-12">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <Kanban className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">Sprintly</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Create an account</h1>
          <p className="text-sm text-gray-400 mt-1">Get started with your collaborative workspace</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Raman"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Last Name</label>
              <input
                type="text"
                placeholder="Sharma"
                className="w-full px-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="raman@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-indigo-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
