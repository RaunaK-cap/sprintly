"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  User,
  CheckCircle2,
  Clock,
  Circle,
  X,
  Send,
  Zap,
} from "lucide-react";

interface Issue {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignees: string[];
  commentsCount: number;
}

export default function BoardPage() {
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "issue-1",
      title: "Design Splash Screen & Onboarding UI",
      description: "Create Figma mockups and export SVG assets for dark/light themes.",
      status: "TODO",
      assignees: ["Raman"],
      commentsCount: 2,
    },
    {
      id: "issue-2",
      title: "Google OAuth Integration",
      description: "Set up Passport.js or NextAuth strategy for one-click login.",
      status: "IN_PROGRESS",
      assignees: ["Alex", "Raman"],
      commentsCount: 4,
    },
    {
      id: "issue-3",
      title: "Setup Turborepo Monorepo Structure",
      description: "Configure pnpm/bun workspaces, package.json scripts, and turbo.json.",
      status: "DONE",
      assignees: ["Raman"],
      commentsCount: 1,
    },
  ]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([
    {
      id: "c1",
      author: "Alex",
      text: "I finished testing the OAuth flow on localhost:3000!",
      time: "10 mins ago",
    },
    {
      id: "c2",
      author: "Raman",
      text: "Great! Let's deploy to staging server next.",
      time: "2 mins ago",
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "Raman",
        text: newComment,
        time: "Just now",
      },
    ]);
    setNewComment("");
  };

  const columns = [
    {
      key: "TODO",
      title: "To Do",
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      icon: <Circle className="w-4 h-4 text-amber-400" />,
    },
    {
      key: "IN_PROGRESS",
      title: "In Progress",
      color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
      icon: <Clock className="w-4 h-4 text-indigo-400" />,
    },
    {
      key: "DONE",
      title: "Completed",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      {/* Board Header */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Zepto /</span>
                <h1 className="text-base font-bold text-white">Mobile App Redesign</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WS Live Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Zap className="w-3 h-3 fill-emerald-400" />
              <span>WS Connected</span>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>
      </header>

      {/* Board Columns Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const columnIssues = issues.filter((issue) => issue.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col max-h-[80vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${col.color}`}>{col.icon}</span>
                    <h2 className="font-semibold text-sm text-white">{col.title}</h2>
                    <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full font-medium">
                      {columnIssues.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Issues List */}
                <div className="space-y-3 overflow-y-auto pr-1">
                  {columnIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className="p-4 bg-gray-950/80 border border-gray-800/80 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-indigo-500/5 group"
                    >
                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{issue.commentsCount}</span>
                        </div>

                        <div className="flex items-center -space-x-1">
                          {issue.assignees.map((name, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold border border-gray-950"
                            >
                              {name[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Card Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                {selectedIssue.status}
              </span>
              <h2 className="text-xl font-bold text-white mt-2">{selectedIssue.title}</h2>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-medium text-gray-400 mb-1">Description</h4>
              <p className="text-sm text-gray-300 bg-gray-950 p-3 rounded-xl border border-gray-800 leading-relaxed">
                {selectedIssue.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Comments & Discussion</span>
              </h4>

              <div className="space-y-3 max-h-40 overflow-y-auto mb-4 pr-1">
                {commentsList.map((c) => (
                  <div key={c.id} className="bg-gray-950 p-3 rounded-xl border border-gray-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-indigo-400">{c.author}</span>
                      <span className="text-[10px] text-gray-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-gray-300">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
