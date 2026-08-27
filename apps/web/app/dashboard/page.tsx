"use client";

import Link from "next/link";
import {
  Kanban,
  Building2,
  Plus,
  Search,
  ChevronDown,
  User,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const dummyBoards = [
    {
      id: "board-1",
      title: "Mobile App Redesign",
      org: "Zepto",
      issuesCount: 12,
      updatedAt: "2 hours ago",
    },
    {
      id: "board-2",
      title: "Backend API Engine",
      org: "Zepto",
      issuesCount: 8,
      updatedAt: "Yesterday",
    },
    {
      id: "board-3",
      title: "Marketing Campaign Q3",
      org: "Zepto",
      issuesCount: 5,
      updatedAt: "3 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Kanban className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Sprintly</span>
            </Link>

            {/* Org Switcher Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm font-medium text-gray-200 cursor-pointer hover:border-gray-700 transition-colors">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Zepto</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/org/create"
              className="text-xs font-medium px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Org</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
              RS
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Zepto Workspace</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Select a board to manage tasks or create a new one for your team.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search boards..."
                className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/25 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyBoards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="group p-6 bg-gray-900/80 border border-gray-800 rounded-2xl hover:border-indigo-500/50 hover:bg-gray-900 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full">
                    {board.issuesCount} cards
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {board.title}
                </h3>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {board.updatedAt}
                </span>

                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold border border-gray-900">
                    R
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border border-gray-900">
                    A
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
