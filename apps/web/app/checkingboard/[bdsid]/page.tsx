"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  Plus,
  Trash2,
  LayoutGrid,
  ArrowLeft,
  User,
  CircleDot,
  Moon,
  Sun,
  X,
  ArrowRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Issue {
  id: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "todo" | "in_progress" | "done" | string;
}

interface OrgType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

export default function CheckingBoardPage() {
  const params = useParams();
  const router = useRouter();
  const bdsid = (params?.bdsid as string) || "1";
  const { theme, setTheme } = useTheme();

  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [orgs, setOrgs] = useState<OrgType[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Controlled Inputs for the three columns
  const [inputs, setInputs] = useState({
    TODO: "",
    IN_PROGRESS: "",
    DONE: ""
  });
  
  // Trello-style Add Card state (which column is currently showing the input)
  const [showInputFor, setShowInputFor] = useState<"TODO" | "IN_PROGRESS" | "DONE" | null>(null);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");

  // Fetch Orgs
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = localStorage.getItem("sprintly_token");
        if (!token) {
          return;
        }
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/org/getorg`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setOrgs(res.data.data || []);
        }
      } catch (err: unknown) {
        console.error("Failed to load org switcher:", err);
      }
    };
    fetchOrgs();
  }, [router]);

  // WebSocket Connection
  useEffect(() => {
    const token = localStorage.getItem("sprintly_token");
    if (!token) {
      // router.push("/login");
      return;
    }

    let socket: WebSocket;
    
    const connectWs = () => {
      socket = new WebSocket(`ws://localhost:8080?token=${token}`);
      setWs(socket);

      socket.onopen = () => {
        setIsOffline(false);
        socket.send(
          JSON.stringify({
            type: "join",
            boardID: bdsid,
          })
        );
      };

      socket.onmessage = (ev) => {
        const parsedData = JSON.parse(ev.data);

        if (parsedData.type === "initial_state") {
          setIssues(parsedData.all_issues || []);
        }
        if (parsedData.type === "issue_added") {
          setIssues((prev) => {
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
          setActiveUsers(parsedData.users.map((u: { id: number }) => u.id));
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
        setIsOffline(true);
      };
    };

    connectWs();

    return () => {
      if (socket) socket.close();
    };
  }, [bdsid, router]);

  // Actions
  const handleAddIssue = (status: "TODO" | "IN_PROGRESS" | "DONE") => {
    const title = inputs[status];
    if (ws && title.trim() && !isOffline) {
      ws.send(
        JSON.stringify({
          type: "issue_added",
          title: title.trim(),
          status: status,
          boardID: bdsid,
        })
      );
      setInputs((prev) => ({ ...prev, [status]: "" }));
      setShowInputFor(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, status: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIssue(status);
    } else if (e.key === "Escape") {
      setShowInputFor(null);
      setInputs((prev) => ({ ...prev, [status]: "" }));
    }
  };

  const handleDeleteIssue = (e: React.MouseEvent, issueId: number) => {
    e.stopPropagation();
    if (ws && !isOffline) {
      ws.send(
        JSON.stringify({
          type: "delete_issue",
          issueId,
          boardID: bdsid,
        })
      );
    }
  };

  const handleMoveIssue = (e: React.MouseEvent, issueId: number, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    e.stopPropagation();
    if (ws && !isOffline) {
      ws.send(
        JSON.stringify({
          type: "issue_moved",
          issueId,
          newStatus,
          boardID: bdsid,
        })
      );
    }
  };

  const activeOrgName = orgs.find((o) => String(o.id) === String(bdsid))?.name || `Board #${bdsid}`;

  const renderColumn = (status: "TODO" | "IN_PROGRESS" | "DONE", label: string, colorClass: string) => {
    const columnIssues = issues.filter(
      (i) => i.status.toUpperCase() === status
    );

    return (
      <div className="flex flex-col min-w-full sm:min-w-0 flex-1 bg-secondary/40 rounded-md border border-border h-[calc(100vh-140px)]">
        {/* Column Header */}
        <div className="flex items-center gap-2 p-3 border-b border-border/50">
          <span className={`size-2 rounded-full ${colorClass}`} />
          <h2 className="text-[12px] font-semibold text-muted-foreground tracking-wide uppercase">
            {label}
          </h2>
          <span className="text-[12px] text-muted-foreground/80 ml-auto font-mono">
            {columnIssues.length}
          </span>
        </div>

        {/* Issue List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar">
          <AnimatePresence initial={false}>
            {columnIssues.map((issue) => (
              <motion.div
                layout
                layoutId={String(issue.id)}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                key={issue.id}
                onClick={() => router.push(`/org/${bdsid}/board/${bdsid}/issues/${issue.id}`)}
                className="group relative flex flex-col gap-2 p-3 bg-background border border-border shadow-sm rounded-md cursor-pointer hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] text-foreground leading-snug line-clamp-3">
                    {issue.title}
                  </span>
                  
                  {/* Delete Button (visible on hover) */}
                  <button
                    onClick={(e) => handleDeleteIssue(e, issue.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 -m-1 text-muted-foreground hover:text-red-500 transition-all shrink-0 bg-background rounded-sm"
                    title="Delete issue"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                  <div className="flex gap-1.5">
                    {status !== "TODO" && (
                      <button
                        onClick={(e) => handleMoveIssue(e, issue.id, status === "DONE" ? "IN_PROGRESS" : "TODO")}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-sm hover:bg-muted"
                      >
                        <ArrowLeft className="size-3" />
                        Back
                      </button>
                    )}
                    {status !== "DONE" && (
                      <button
                        onClick={(e) => handleMoveIssue(e, issue.id, status === "TODO" ? "IN_PROGRESS" : "DONE")}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-sm hover:bg-muted"
                      >
                        {status === "TODO" ? "Start" : "Complete"}
                        <ArrowRight className="size-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60">
                    #{issue.id}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Issue Button at the bottom (Trello Style) */}
        <div className="p-3 pt-0 mt-2">
          {showInputFor === status ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={inputs[status]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [status]: e.target.value }))}
                onKeyDown={(e) => handleKeyDown(e, status)}
                placeholder="Enter a title for this card..."
                className="w-full bg-background text-[13px] text-foreground p-3 rounded-md border border-foreground/20 focus:outline-none focus:border-primary shadow-sm resize-none min-h-[72px]"
                autoFocus
                disabled={isOffline}
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleAddIssue(status)}
                  disabled={!inputs[status].trim() || isOffline}
                  className="h-8 px-3 text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add card
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowInputFor(null);
                    setInputs((prev) => ({ ...prev, [status]: "" }));
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowInputFor(status)} 
              className="w-full flex items-center gap-2 p-2 rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground text-[13px] font-medium transition-colors"
            >
              <Plus className="size-4" />
              Add a card
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/20 selection:text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        
        {/* Left Zone: Nav & Switcher */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push("/org/create")}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0 hidden sm:flex"
          >
            <LayoutGrid className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-foreground transition-colors outline-none" />}>
              <span className="text-[14px] font-medium truncate max-w-[150px] sm:max-w-[200px]">
                {activeOrgName}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px] bg-popover border-border text-popover-foreground rounded-sm p-1">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Current Organization
                </DropdownMenuLabel>
                <DropdownMenuItem className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5">
                  <CircleDot className="size-3.5 mr-2" />
                  Board #{bdsid}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              {orgs.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Other Organizations
                    </DropdownMenuLabel>
                    {orgs.map((org) => (
                      <DropdownMenuItem 
                        key={org.id} 
                        onClick={() => router.push(`/checkingboard/${org.id}`)}
                        className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                      >
                        <div className="flex items-center justify-center size-5 rounded-sm bg-foreground/10 text-[10px] font-medium mr-2">
                          {getInitials(org.name)}
                        </div>
                        <span className="truncate">{org.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
              
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/org/create")} className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5">
                  <Plus className="size-3.5 mr-2" />
                  New organization
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOffline && (
            <div className="ml-2 px-2 py-1 rounded-sm bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-medium">
              Reconnecting...
            </div>
          )}
        </div>

        {/* Right Zone: Presence & Profile */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Popover>
            <PopoverTrigger render={<button className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-sm hover:bg-foreground/5 transition-colors outline-none" />}>
              <div className="flex -space-x-1.5">
                {[...Array(Math.min(3, activeUsers.length + 1))].map((_, i) => (
                  <div key={i} className="size-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[9px] text-foreground font-medium z-10">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-muted-foreground font-medium ml-1">
                {activeUsers.length + 1}
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[200px] bg-popover border-border rounded-sm p-1">
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                Active Now
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground">
                  <div className="size-6 rounded-full bg-background border border-border flex items-center justify-center">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                  <span>You</span>
                </div>
                {activeUsers.map(id => (
                  <div key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground">
                    <div className="size-6 rounded-full bg-background border border-border flex items-center justify-center">
                      <User className="size-3 text-muted-foreground" />
                    </div>
                    <span>User #{id}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="size-7 rounded-sm bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[12px] font-medium cursor-pointer hover:bg-primary/30 transition-colors">
            ME
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="sm:hidden flex items-center gap-2 p-4 pb-0 overflow-x-auto no-scrollbar border-b border-border">
        <button
          onClick={() => setActiveTab("TODO")}
          className={`px-3 py-1.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "TODO" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          TO-DO
        </button>
        <button
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`px-3 py-1.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "IN_PROGRESS" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          IN-PROGRESS
        </button>
        <button
          onClick={() => setActiveTab("DONE")}
          className={`px-3 py-1.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === "DONE" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          DONE
        </button>
      </div>

      {/* Board Columns */}
      <main className="flex-1 overflow-hidden flex justify-center">
        <div className="h-full w-full max-w-7xl flex flex-col sm:flex-row gap-4 p-4 overflow-x-auto items-start">
          
          {/* Desktop/Tablet Columns (Always render on sm+, conditionally render on mobile) */}
          <div className={`${activeTab === "TODO" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("TODO", "To-Do", "bg-blue-400")}
          </div>
          
          <div className={`${activeTab === "IN_PROGRESS" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("IN_PROGRESS", "In-Progress", "bg-amber-400")}
          </div>
          
          <div className={`${activeTab === "DONE" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("DONE", "Done", "bg-emerald-400")}
          </div>

        </div>
      </main>
    </div>
  );
}