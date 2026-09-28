"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  ArrowRight,
  Edit3,
  ExternalLink,
  LogOut,
  Building,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthToken, clearAuthToken } from "@/lib/auth";

// -----------------------------------------------------------------------------
// 📦 TypeScript Interfaces
// -----------------------------------------------------------------------------
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

interface BoardInfo {
  id: number;
  title: string;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : "?";

export default function CheckingBoardPage() {
  const params = useParams();
  const router = useRouter();
  const bdsid = (params?.bdsid as string) || "1";
  const { theme, setTheme } = useTheme();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ---------------------------------------------------------------------------
  // ⚡ State Declarations
  // ---------------------------------------------------------------------------
  const [issues, setIssues] = useState<Issue[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [orgBoards, setOrgBoards] = useState<BoardInfo[]>([]);
  const [orgs, setOrgs] = useState<OrgType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Rename Board Dialog
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [renaming, setRenaming] = useState(false);

  // New Board Dialog
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);

  // Controlled Inputs for column card creation
  const [inputs, setInputs] = useState({
    TODO: "",
    IN_PROGRESS: "",
    DONE: "",
  });
  
  // Trello-style inline Add Card input trigger per column
  const [showInputFor, setShowInputFor] = useState<"TODO" | "IN_PROGRESS" | "DONE" | null>(null);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");

  // ---------------------------------------------------------------------------
  // 🔄 REST API Calls: Connects to Backend Endpoints
  // ---------------------------------------------------------------------------

  // 1. Fetch Current Board Info (`GET /api/v1/boards/:id`)
  const fetchBoardDetails = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/v1/boards/${bdsid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBoardInfo(res.data.data);
        setRenameTitle(res.data.data.title);

        // Fetch sibling boards belonging to this same organization
        if (res.data.data.organizationId) {
          const siblingRes = await axios.get(
            `${API_URL}/api/v1/boards?orgId=${res.data.data.organizationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (siblingRes.data.success) {
            setOrgBoards(siblingRes.data.data || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load board info:", err);
    }
  }, [API_URL, bdsid]);

  // 2. Fetch User Profile (`GET /api/v1/users/me`)
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, [API_URL]);

  // 3. Fetch Organizations List (`GET /api/v1/org/getorg`)
  const fetchOrgs = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/v1/org/getorg`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrgs(res.data.data || []);
      }
    } catch (err: unknown) {
      console.error("Failed to load org switcher:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBoardDetails();
    fetchUserProfile();
    fetchOrgs();
  }, [fetchBoardDetails, fetchUserProfile, fetchOrgs]);

  // ---------------------------------------------------------------------------
  // 🔌 Real-Time WebSocket Connection (`ws://localhost:8080`)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let socket: WebSocket;
    
    const connectWs = () => {
      socket = new WebSocket(`ws://localhost:8080?token=${token}`);
      setWs(socket);

      socket.onopen = () => {
        setIsOffline(false);
        // Join this specific board room
        socket.send(
          JSON.stringify({
            type: "join",
            boardID: bdsid,
          })
        );
      };

      socket.onmessage = (ev) => {
        const parsedData = JSON.parse(ev.data);

        // Initial board issues state received on join
        if (parsedData.type === "initial_state") {
          setIssues(parsedData.all_issues || []);
        }
        // A card was created (either by you or someone else)
        if (parsedData.type === "issue_added") {
          setIssues((prev) => {
            if (prev.some((x) => x.id === parsedData.issue.id)) return prev;
            return [...prev, parsedData.issue];
          });
        }
        // A card was moved (TODO <-> IN_PROGRESS <-> DONE)
        if (parsedData.type === "issue_moved") {
          setIssues((prev) =>
            prev.map((x) =>
              x.id === parsedData.issueId ? { ...x, status: parsedData.newStatus } : x
            )
          );
        }
        // A card was deleted
        if (parsedData.type === "delete_issue") {
          setIssues((prev) => prev.filter((x) => x.id !== parsedData.issueId));
        }
        // Online presence
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

  // ---------------------------------------------------------------------------
  // 🎯 Action Handlers: Card operations & Board management
  // ---------------------------------------------------------------------------

  // Add Card in column (Sends WebSocket `issue_added`)
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

  // Delete Card (Sends WebSocket `delete_issue`)
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

  // Move Card across columns (Sends WebSocket `issue_moved`)
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

  // Rename Board (`PUT /api/v1/boards/:id`)
  const handleRenameBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;

    setRenaming(true);
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/api/v1/boards/${bdsid}`,
        { title: renameTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardInfo((prev) => (prev ? { ...prev, title: renameTitle.trim() } : null));
      setIsRenameOpen(false);
      fetchBoardDetails();
    } catch (err) {
      console.error("Failed to rename board:", err);
    } finally {
      setRenaming(false);
    }
  };

  // Create New Board (`POST /api/v1/boards`)
  const handleCreateNewBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !boardInfo?.organizationId) return;

    setCreatingBoard(true);
    try {
      const token = getAuthToken();
      const res = await axios.post(
        `${API_URL}/api/v1/boards`,
        { title: newBoardTitle.trim(), organizationId: boardInfo.organizationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success && res.data.data?.id) {
        setIsNewBoardOpen(false);
        setNewBoardTitle("");
        router.push(`/checkingboard/${res.data.data.id}`);
      }
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleSignOut = () => {
    clearAuthToken();
    router.push("/login");
  };

  const displayBoardTitle = boardInfo?.title || `Board #${bdsid}`;
  const displayOrgName = boardInfo?.organization?.name || "Workspace";

  // ---------------------------------------------------------------------------
  // 📋 Render Kanban Column
  // ---------------------------------------------------------------------------
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

        {/* Issue Cards List */}
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
                onClick={() => router.push(`/checkingboard/${bdsid}/issues/${issue.id}`)}
                className="group relative flex flex-col gap-2 p-3 bg-background border border-border shadow-sm rounded-md cursor-pointer hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[14px] text-foreground leading-snug line-clamp-3">
                    {issue.title}
                  </span>
                  
                  {/* Delete Card Button */}
                  <button
                    onClick={(e) => handleDeleteIssue(e, issue.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 -m-1 text-muted-foreground hover:text-red-500 transition-all shrink-0 bg-background rounded-sm"
                    title="Delete card"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Arrow Buttons for Movement (`TODO` <-> `IN_PROGRESS` <-> `DONE`) */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                  <div className="flex gap-1.5">
                    {status !== "TODO" && (
                      <button
                        onClick={(e) => handleMoveIssue(e, issue.id, status === "DONE" ? "IN_PROGRESS" : "TODO")}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-sm hover:bg-muted"
                        title="Move backwards"
                      >
                        <ArrowLeft className="size-3" />
                        Back
                      </button>
                    )}
                    {status !== "DONE" && (
                      <button
                        onClick={(e) => handleMoveIssue(e, issue.id, status === "TODO" ? "IN_PROGRESS" : "DONE")}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-sm hover:bg-muted"
                        title="Move to next stage"
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

        {/* Inline Add Card Button (Trello Style) */}
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

  // ---------------------------------------------------------------------------
  // 🎨 Main Page Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/20 selection:text-foreground">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        
        {/* Left: Navigation, Board Switcher, and Org Hub link */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Back button to parent Organization Hub */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (boardInfo?.organizationId) {
                router.push(`/org/${boardInfo.organizationId}`);
              } else {
                router.push("/org/create");
              }
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0"
            title="Back to Workspace"
          >
            <ArrowLeft className="size-4" />
          </Button>
          
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Board & Workspace Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-foreground transition-colors outline-none cursor-pointer">
                  <LayoutGrid className="size-4 text-primary shrink-0" />
                  <div className="flex items-center gap-1.5 text-[14px] font-medium">
                    <span className="text-muted-foreground hidden md:inline">
                      {displayOrgName} /
                    </span>
                    <span className="font-semibold truncate max-w-[140px] sm:max-w-[180px]">
                      {displayBoardTitle}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-[260px] bg-popover border-border rounded-sm p-1 shadow-lg">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Current Board
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setIsRenameOpen(true)}
                  className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CircleDot className="size-3.5 text-primary shrink-0" />
                    <span className="font-semibold truncate">{displayBoardTitle}</span>
                  </div>
                  <Edit3 className="size-3 text-muted-foreground ml-2" />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              {/* Sibling Boards in this Org */}
              {orgBoards.length > 1 && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Switch Board
                    </DropdownMenuLabel>
                    {orgBoards
                      .filter((b) => String(b.id) !== String(bdsid))
                      .map((b) => (
                        <DropdownMenuItem 
                          key={b.id} 
                          onClick={() => router.push(`/checkingboard/${b.id}`)}
                          className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                        >
                          <CircleDot className="size-3.5 mr-2 text-muted-foreground" />
                          <span className="truncate">{b.title}</span>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </>
              )}
              
              <DropdownMenuSeparator className="bg-border my-1" />
              <DropdownMenuGroup>
                {/* "+ New Board" option */}
                <DropdownMenuItem
                  onClick={() => setIsNewBoardOpen(true)}
                  className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                >
                  <Plus className="size-3.5 mr-2" />
                  New Board in Workspace
                </DropdownMenuItem>
                
                {/* Link to Workspace Hub & Members */}
                {boardInfo?.organizationId && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/org/${boardInfo.organizationId}`)}
                    className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                  >
                    <Building className="size-3.5 mr-2" />
                    Workspace Hub & Members
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Offline / Reconnecting Badge */}
          {isOffline && (
            <div className="ml-2 px-2 py-0.5 rounded-sm bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 font-medium">
              Reconnecting...
            </div>
          )}
        </div>

        {/* Right: Presence, Theme Toggle, and User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0"
            title="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Active WebSocket Users Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <button className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-sm hover:bg-foreground/5 transition-colors outline-none cursor-pointer" />
              }
            >
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
            <PopoverContent align="end" className="w-[200px] bg-popover border-border rounded-sm p-1 shadow-md">
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                Live on this board
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {getInitials(currentUser?.firstname)}
                  </div>
                  <span>You ({currentUser?.firstname || "User"})</span>
                </div>
                {activeUsers.map((id) => (
                  <div key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground">
                    <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      U
                    </div>
                    <span>User #{id}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Current User Profile Avatar Menu (`GET /api/v1/users/me`) */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="size-8 rounded-sm bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[12px] font-bold cursor-pointer hover:bg-primary/20 transition-colors">
                    {getInitials(currentUser.firstname)}
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-[200px] bg-popover border-border rounded-sm p-1 shadow-md">
                <div className="px-2 py-1.5 border-b border-border">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    {currentUser.firstname} {currentUser.lastname}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                    {currentUser.email}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-[13px] text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer rounded-sm px-2 py-1.5 mt-1"
                >
                  <LogOut className="size-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Mobile Tab Selector */}
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

      {/* Kanban Board Canvas */}
      <main className="flex-1 overflow-hidden flex justify-center">
        <div className="h-full w-full max-w-7xl flex flex-col sm:flex-row gap-4 p-4 overflow-x-auto items-start">
          
          {/* TO-DO Column */}
          <div className={`${activeTab === "TODO" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("TODO", "To-Do", "bg-blue-400")}
          </div>
          
          {/* IN-PROGRESS Column */}
          <div className={`${activeTab === "IN_PROGRESS" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("IN_PROGRESS", "In-Progress", "bg-amber-400")}
          </div>
          
          {/* DONE Column */}
          <div className={`${activeTab === "DONE" ? "flex" : "hidden"} sm:flex flex-col w-full sm:min-w-[320px] sm:max-w-[360px]`}>
            {renderColumn("DONE", "Done", "bg-emerald-400")}
          </div>

        </div>
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG: RENAME BOARD (`PUT /api/v1/boards/:id`)                       */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border rounded-sm p-6 shadow-none">
          <form onSubmit={handleRenameBoard}>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">
                Rename board
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <Input
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="h-10 rounded-sm border-border"
                autoFocus
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRenameOpen(false)}
                className="h-9 rounded-sm text-foreground hover:bg-muted/50 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={renaming || !renameTitle.trim()}
                className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-4 text-[13px]"
              >
                {renaming ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG: CREATE NEW BOARD (`POST /api/v1/boards`)                      */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isNewBoardOpen} onOpenChange={setIsNewBoardOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border rounded-sm p-6 shadow-none">
          <form onSubmit={handleCreateNewBoard}>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">
                Create new board
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Adds a new Kanban board to {displayOrgName}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                placeholder="e.g. Sprint 2, Backend Tasks"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="h-10 rounded-sm border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                autoFocus
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsNewBoardOpen(false)}
                className="h-9 rounded-sm text-foreground hover:bg-muted/50 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingBoard || !newBoardTitle.trim()}
                className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-4 text-[13px]"
              >
                {creatingBoard ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}