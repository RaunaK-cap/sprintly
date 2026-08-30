"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleDot,
  Plus,
  Trash2,
  Users,
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

export function App() {
  const params = useParams();
  const router = useRouter();
  const bdsid = (params?.bdsid as string) || "1";

  // State & Refs
  const [issues, setIssues] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);

  // Controlled Input States
  const [todoInput, setTodoInput] = useState("");
  const [inProgressInput, setInProgressInput] = useState("");
  const [doneInput, setDoneInput] = useState("");

  // Fetch all user organizations to populate the dropdown switcher
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }
        const res = await fetch("http://localhost:4000/api/v1/org/getorg", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrgs(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load org switcher:", err);
      }
    };
    fetchOrgs();
  }, [router]);

  // Handle WebSocket Connection & Room Join
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    // Connect with token query parameter for backend auth
    const socket = new WebSocket(`ws://localhost:8080?token=${token}`);
    setWs(socket);

    socket.onopen = () => {
      console.log(`Connected to WebSocket, joining board ID: ${bdsid}`);
      socket.send(
        JSON.stringify({
          type: "join",
          boardID: bdsid,
        })
      );
    };

    socket.onmessage = (ev) => {
      const parsedData = JSON.parse(ev.data);
      console.log("WebSocket event received:", parsedData);

      if (parsedData.type === "initial_state") {
        setIssues(parsedData.all_issues || []);
      }

      if (parsedData.type === "issue_added") {
        setIssues((prev) => {
          // Prevent duplicates
          if (prev.some((x) => x.id === parsedData.issue.id)) return prev;
          return [...prev, parsedData.issue];
        });
      }

      if (parsedData.type === "issue_moved") {
        setIssues((prev) =>
          prev.map((x) =>
            x.id === parsedData.issueId ? { ...x, status: parsedData.newStatus } : x
          )
        );
      }

      if (parsedData.type === "delete_issue") {
        setIssues((prev) => prev.filter((x) => x.id !== parsedData.issueId));
      }

      if (parsedData.type === "init_room") {
        setActiveUsers(parsedData.users.map((u: any) => u.id));
      }

      if (parsedData.type === "join") {
        setActiveUsers((prev) => {
          if (prev.includes(parsedData.userID)) return prev;
          return [...prev, parsedData.userID];
        });
      }

      if (parsedData.type === "leave") {
        setActiveUsers((prev) => prev.filter((id) => id !== parsedData.userID));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [bdsid, router]);

  // Actions
  const addIssue = (title: string, status: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (ws && title.trim()) {
      ws.send(
        JSON.stringify({
          type: "issue_added",
          title: title,
          status: status,
          boardID: bdsid,
        })
      );
    }
  };

  const moveIssue = (issueId: number, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "issue_moved",
          issueId: issueId,
          newStatus: newStatus,
          boardID: bdsid,
        })
      );
    }
  };

  const deleteIssue = (issueId: number) => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "delete_issue",
          issueId: issueId,
          boardID: bdsid,
        })
      );
    }
  };

  const activeOrgName = orgs.find((o) => String(o.id) === String(bdsid))?.name || `Board #${bdsid}`;

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-200 font-sans p-6 md:p-8 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-5 mb-8 border-b border-zinc-800/60 sticky top-0 bg-[#090d16]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Org & Board switcher dropdown */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <div className="relative flex items-center">
              <select
                value={bdsid}
                onChange={(e) =>
                  (window.location.href = `/checkingboard/${e.target.value}`)
                }
                className="appearance-none bg-zinc-900/90 border border-zinc-800 text-zinc-200 text-xs font-semibold pl-3 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
              >
                {orgs.length === 0 ? (
                  <option value={bdsid}>{activeOrgName}</option>
                ) : (
                  orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} Workspace
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active room members info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">
              Active Members: {activeUsers.length + 1}
            </span>
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
                addIssue(todoInput, "TODO");
                setTodoInput("");
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter((i) => i.status === "TODO" || i.status === "todo")
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex flex-col gap-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {issue.title}
                    </span>
                    <button
                      onClick={() => deleteIssue(issue.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[10px] text-zinc-500">
                    <span>Card ID: {issue.id}</span>
                    <button
                      onClick={() => moveIssue(issue.id, "IN_PROGRESS")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
                addIssue(inProgressInput, "IN_PROGRESS");
                setInProgressInput("");
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter((i) => i.status === "IN_PROGRESS" || i.status === "in_progress" || i.status === "inprogreess")
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex flex-col gap-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {issue.title}
                    </span>
                    <button
                      onClick={() => deleteIssue(issue.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[10px] text-zinc-500">
                    <button
                      onClick={() => moveIssue(issue.id, "TODO")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={() => moveIssue(issue.id, "DONE")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <span>Complete</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
                addIssue(doneInput, "DONE");
                setDoneInput("");
              }}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {issues
              .filter((i) => i.status === "DONE" || i.status === "done")
              .map((issue) => (
                <div
                  key={issue.id}
                  className="group bg-zinc-950/90 border border-zinc-800/80 p-3.5 rounded-lg flex flex-col gap-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {issue.title}
                    </span>
                    <button
                      onClick={() => deleteIssue(issue.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[10px] text-zinc-500">
                    <button
                      onClick={() => moveIssue(issue.id, "IN_PROGRESS")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Restart</span>
                    </button>
                    <span>Card ID: {issue.id}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;