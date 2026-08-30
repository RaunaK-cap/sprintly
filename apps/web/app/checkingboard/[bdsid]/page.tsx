"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  CircleDot,
  Plus,
  Trash2,
  Users,
  LayoutGrid,
} from "lucide-react";

export function App() {
  const params = useParams();
  const bdsid = (params?.bdsid as string) || "1";

  // State & Refs
  const [issues, setIssues] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Controlled Input States
  const [todoInput, setTodoInput] = useState("");
  const [inProgressInput, setInProgressInput] = useState("");
  const [doneInput, setDoneInput] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    socket.onmessage = (ev) => {
      const data = ev.data;
      const parsedData = JSON.parse(data);

      if (parsedData.type === "initial_state") {
        setIssues(parsedData.all_issues || parsedData.issues || []);
      }

      if (parsedData.type === "issue_added") {
        setIssues((prev) => [...prev, parsedData.issue]);
      }

      if (parsedData.type === "delete_issue") {
        setIssues((prev) => prev.filter((x) => x.id !== parsedData.issueId));
      }
    };

    return () => {
      socket.close();
    };
  }, [bdsid]);

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-200 font-sans p-6 md:p-8 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-5 mb-8 border-b border-zinc-800/60 sticky top-0 bg-[#090d16]/90 backdrop-blur-md z-10">
        {/* All boards dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <span>Boards</span>
            <span className="text-zinc-600 font-mono">/</span>
            <div className="relative flex items-center">
              <select
                value={bdsid}
                onChange={(e) =>
                  (window.location.href = `/checkingboard/${e.target.value}`)
                }
                className="appearance-none bg-zinc-900/90 border border-zinc-800 text-zinc-200 text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
              >
                <option value="1">Board #1</option>
                <option value="2">Board #2</option>
                <option value="3">Board #3</option>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active profiles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">Active</span>
            <div className="flex items-center -space-x-1.5 ml-1">
              <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[9px] font-bold text-zinc-100">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 max-w-7xl w-full mx-auto">
        {/* TO-DO COLUMN */}
        <div className="flex flex-col bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                to-do
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              placeholder="Add issue title..."
              className="flex-1 bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 px-3 py-2 rounded-lg placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              onClick={() => {
                if (ws && todoInput.trim()) {
                  ws.send(
                    JSON.stringify({
                      type: "issue_added",
                      title: todoInput,
                      section: "todo",
                      status: "todo",
                      boardID: bdsid,
                    })
                  );
                  setTodoInput("");
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter(
                (i) =>
                  i.section === "todo" ||
                  i.status === "todo" ||
                  i.status === "TODO"
              )
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-zinc-200 leading-relaxed">
                    {issue.title}
                  </span>
                  <button
                    onClick={() => {
                      if (ws) {
                        ws.send(
                          JSON.stringify({
                            type: "delete_issue",
                            issueId: issue.id,
                            boardID: bdsid,
                          })
                        );
                      }
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* IN-PROGRESS COLUMN */}
        <div className="flex flex-col bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                in-progress
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={inProgressInput}
              onChange={(e) => setInProgressInput(e.target.value)}
              placeholder="Add issue title..."
              className="flex-1 bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 px-3 py-2 rounded-lg placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              onClick={() => {
                if (ws && inProgressInput.trim()) {
                  ws.send(
                    JSON.stringify({
                      type: "issue_added",
                      title: inProgressInput,
                      section: "in_progress",
                      status: "in_progress",
                      boardID: bdsid,
                    })
                  );
                  setInProgressInput("");
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter(
                (i) =>
                  i.section === "in_progress" ||
                  i.status === "in_progress" ||
                  i.status === "inprogreess" ||
                  i.status === "IN_PROGRESS"
              )
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-zinc-200 leading-relaxed">
                    {issue.title}
                  </span>
                  <button
                    onClick={() => {
                      if (ws) {
                        ws.send(
                          JSON.stringify({
                            type: "delete_issue",
                            issueId: issue.id,
                            boardID: bdsid,
                          })
                        );
                      }
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* DONE COLUMN */}
        <div className="flex flex-col bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                done
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={doneInput}
              onChange={(e) => setDoneInput(e.target.value)}
              placeholder="Add issue title..."
              className="flex-1 bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 px-3 py-2 rounded-lg placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              onClick={() => {
                if (ws && doneInput.trim()) {
                  ws.send(
                    JSON.stringify({
                      type: "issue_added",
                      title: doneInput,
                      section: "done",
                      status: "done",
                      boardID: bdsid,
                    })
                  );
                  setDoneInput("");
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter(
                (i) =>
                  i.section === "done" ||
                  i.status === "done" ||
                  i.status === "DONE"
              )
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-zinc-200 leading-relaxed">
                    {issue.title}
                  </span>
                  <button
                    onClick={() => {
                      if (ws) {
                        ws.send(
                          JSON.stringify({
                            type: "delete_issue",
                            issueId: issue.id,
                            boardID: bdsid,
                          })
                        );
                      }
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;