"use client";

import Link from "next/link";
import { Building2, AlignLeft, ArrowLeft, Plus } from "lucide-react";

export default function CreateOrgPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="font-semibold text-sm text-gray-300">New Organization</span>
        </div>
      </header>

      {/* Form Card */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 pt-16 pb-12 flex flex-col items-center">
        <div className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Organization</h1>
              <p className="text-xs text-gray-400 mt-0.5">Setup a new team workspace for your boards</p>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Organization Name <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Zepto or Acme Corp"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Description (Optional)
              </label>
              <div className="relative">
                <AlignLeft className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  placeholder="What is this organization working on?"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workspace</span>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
