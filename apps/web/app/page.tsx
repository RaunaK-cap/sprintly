import Link from "next/link";
import { Kanban, Zap, Shield, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-gray-100">
      {/* Navigation Bar */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Kanban className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-400 bg-clip-text text-transparent">
              Sprintly
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>Real-time WebSocket Collaboration</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Manage projects with speed, clarity, and real-time precision.
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl leading-relaxed">
          Sprintly brings your team together on intuitive Kanban boards. Organize tasks into TODO, In Progress, and Done, with instantaneous updates.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-xl shadow-indigo-600/25"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/board/demo-board"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/80 text-gray-200 font-medium rounded-xl transition-all"
          >
            <span>View Demo Board</span>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Live WebSocket Sync</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Drag cards between columns and see instantly synced changes across every team member's screen.
            </p>
          </div>

          <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Organization & Teams</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Organize multiple projects into dedicated Workspaces with granular Admin and Member roles.
            </p>
          </div>

          <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl backdrop-blur-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Focused Workflows</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Clear TODO, IN_PROGRESS, and DONE column states keep your team focused on delivering high quality work.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Sprintly. Built for high performance teams.</p>
      </footer>
    </div>
  );
}
