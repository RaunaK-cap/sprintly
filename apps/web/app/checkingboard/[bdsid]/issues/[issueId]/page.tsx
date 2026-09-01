"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Send,
  MoreHorizontal,
  Clock,
  UserCheck,
  Tag,
  MessageSquare,
  FileText,
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
import { Textarea } from "@/components/ui/textarea";
import { getAuthToken } from "@/lib/auth";

interface CommentType {
  id: number;
  content: string;
  issueId: number;
  userId: number;
  createdAt: string;
  isSystem?: boolean;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface IssueDetail {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "todo" | "in_progress" | "done" | string;
  boardId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  board?: {
    id: number;
    title: string;
    organizationId: number;
    organization?: {
      id: number;
      name: string;
    };
  };
  comments?: CommentType[];
}

interface OrgType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const first = parts[0].charAt(0);
    const second = parts[1].charAt(0);
    return (first + second).toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
};

const formatTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

const statusConfig: Record<string, { label: string; dotColor: string }> = {
  TODO: { label: "To-Do", dotColor: "bg-blue-400" },
  todo: { label: "To-Do", dotColor: "bg-blue-400" },
  IN_PROGRESS: { label: "In-Progress", dotColor: "bg-amber-400" },
  in_progress: { label: "In-Progress", dotColor: "bg-amber-400" },
  DONE: { label: "Done", dotColor: "bg-emerald-400" },
  done: { label: "Done", dotColor: "bg-emerald-400" },
};

export default function CheckingboardIssuePage() {
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const bdsid = (params?.bdsid as string) || "1";
  const issueId = (params?.issueId as string) || "1";

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // State
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [orgs, setOrgs] = useState<OrgType[]>([]);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Editable fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState("");

  // Chat composer
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile segmented tab
  const [mobileTab, setMobileTab] = useState<"details" | "discussion">("details");

  // Scroll anchor
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Fetch initial issue data
  const fetchIssue = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/issues/getissue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.data) {
        const issueData = res.data.data;
        setIssue(issueData);
        setTitleInput(issueData.title || "");
        setDescInput(issueData.description || "");
        setComments(issueData.comments || []);
      }
    } catch (err) {
      console.error("Failed to load issue:", err);
    }
  }, [issueId, NEXT_PUBLIC_API_URL]);

  // Fetch orgs list for topbar dropdown
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/org/getorg`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrgs(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load orgs:", err);
      }
    };
    fetchOrgs();
    fetchIssue();
  }, [fetchIssue, NEXT_PUBLIC_API_URL]);

  // WebSocket Connection
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
        socket.send(
          JSON.stringify({
            type: "join",
            boardID: bdsid,
          })
        );
      };

      socket.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);

          if (parsed.type === "init_room") {
            setActiveUsers(parsed.users.map((u: { id: number }) => u.id));
          }
          if (parsed.type === "join") {
            setActiveUsers((prev) => (prev.includes(parsed.userID) ? prev : [...prev, parsed.userID]));
          }
          if (parsed.type === "leave") {
            setActiveUsers((prev) => prev.filter((id) => id !== parsed.userID));
          }

          // Realtime Comments
          if (parsed.type === "comment_added" && Number(parsed.issueId) === Number(issueId)) {
            setComments((prev) => {
              if (prev.some((c) => c.id === parsed.comment.id)) return prev;
              return [...prev, parsed.comment];
            });
          }

          // Realtime Issue updates (Status, Title, Description)
          if (parsed.type === "issue_moved" && Number(parsed.issueId) === Number(issueId)) {
            setIssue((prev) => (prev ? { ...prev, status: parsed.newStatus } : prev));
            // Add a slim system message
            setComments((prev) => [
              ...prev,
              {
                id: Date.now(),
                content: `Status updated to ${statusConfig[parsed.newStatus]?.label || parsed.newStatus}`,
                issueId: Number(issueId),
                userId: 0,
                createdAt: new Date().toISOString(),
                isSystem: true,
              },
            ]);
          }

          if (parsed.type === "issue_updated" && Number(parsed.issueId) === Number(issueId)) {
            setIssue((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                ...(parsed.title !== undefined ? { title: parsed.title } : {}),
                ...(parsed.description !== undefined ? { description: parsed.description } : {}),
                ...(parsed.status !== undefined ? { status: parsed.status } : {}),
              };
            });
            if (parsed.title !== undefined) setTitleInput(parsed.title);
            if (parsed.description !== undefined) setDescInput(parsed.description);
          }

          // Realtime Typing Indicator
          if (parsed.type === "user_typing" && Number(parsed.issueId) === Number(issueId)) {
            const name = parsed.userName || `User #${parsed.userID}`;
            setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUsers([]);
            }, 2500);
          }

          // Issue Deleted
          if (parsed.type === "delete_issue" && Number(parsed.issueId) === Number(issueId)) {
            router.push(`/checkingboard/${bdsid}`);
          }
        } catch (err) {
          console.error("WS message parse error:", err);
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
  }, [bdsid, issueId, router]);

  // Auto-scroll chat
  useEffect(() => {
    if (shouldAutoScroll && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, shouldAutoScroll]);

  const handleChatScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(isNearBottom);
  };

  // Actions
  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (!titleInput.trim() || titleInput === issue?.title) return;

    try {
      const token = getAuthToken();
      await axios.put(
        `${NEXT_PUBLIC_API_URL}/api/v1/issues/updateissue/${issueId}`,
        { title: titleInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIssue((prev) => (prev ? { ...prev, title: titleInput.trim() } : prev));

      if (ws && !isOffline) {
        ws.send(
          JSON.stringify({
            type: "issue_updated",
            issueId,
            title: titleInput.trim(),
            boardID: bdsid,
          })
        );
      }
    } catch (err) {
      console.error("Failed to update title:", err);
    }
  };

  const handleSaveDesc = async () => {
    setIsEditingDesc(false);
    if (descInput === issue?.description) return;

    try {
      const token = getAuthToken();
      await axios.put(
        `${NEXT_PUBLIC_API_URL}/api/v1/issues/updateissue/${issueId}`,
        { description: descInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIssue((prev) => (prev ? { ...prev, description: descInput.trim() } : prev));

      if (ws && !isOffline) {
        ws.send(
          JSON.stringify({
            type: "issue_updated",
            issueId,
            description: descInput.trim(),
            boardID: bdsid,
          })
        );
      }
    } catch (err) {
      console.error("Failed to update description:", err);
    }
  };

  const handleStatusChange = async (newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (newStatus === issue?.status) return;

    try {
      const token = getAuthToken();
      await axios.put(
        `${NEXT_PUBLIC_API_URL}/api/v1/issues/moveissue/${issueId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIssue((prev) => (prev ? { ...prev, status: newStatus } : prev));

      // Local system message
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: `You changed status to ${statusConfig[newStatus]?.label || newStatus}`,
          issueId: Number(issueId),
          userId: 0,
          createdAt: new Date().toISOString(),
          isSystem: true,
        },
      ]);

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
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${NEXT_PUBLIC_API_URL}/api/v1/issues/deleteissue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (ws && !isOffline) {
        ws.send(
          JSON.stringify({
            type: "delete_issue",
            issueId,
            boardID: bdsid,
          })
        );
      }

      router.push(`/checkingboard/${bdsid}`);
    } catch (err) {
      console.error("Failed to delete issue:", err);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = messageInput.trim();
    if (!content || isOffline) return;

    // Optimistic Message
    const tempComment: CommentType = {
      id: Date.now(),
      content,
      issueId: Number(issueId),
      userId: 999999,
      createdAt: new Date().toISOString(),
      user: {
        id: 999999,
        firstname: "You",
        lastname: "",
        email: "",
      },
    };

    setComments((prev) => [...prev, tempComment]);
    setMessageInput("");
    setShouldAutoScroll(true);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "comment_added",
          issueId,
          content,
          boardID: bdsid,
        })
      );
    }
  };

  const handleComposerTyping = (val: string) => {
    setMessageInput(val);
    if (ws && ws.readyState === WebSocket.OPEN && !isOffline) {
      ws.send(
        JSON.stringify({
          type: "typing",
          issueId,
          boardID: bdsid,
        })
      );
    }
  };

  const activeOrgName =
    orgs.find((o) => String(o.id) === String(bdsid))?.name ||
    issue?.board?.organization?.name ||
    `Board #${bdsid}`;

  const currentStatusObj: { label: string; dotColor: string } =
    issue?.status && statusConfig[issue.status]
      ? statusConfig[issue.status]!
      : { label: "To-Do", dotColor: "bg-blue-400" };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/20 selection:text-foreground">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        {/* Left Zone: Nav & Switcher */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/checkingboard/${bdsid}`)}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/checkingboard/${bdsid}`)}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm shrink-0 hidden sm:flex"
          >
            <LayoutGrid className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-foreground transition-colors outline-none" />
              }
            >
              <span className="text-[14px] font-medium truncate max-w-[150px] sm:max-w-[200px]">
                {activeOrgName}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px] bg-popover border-border text-popover-foreground rounded-sm p-1">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Current Board
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/checkingboard/${bdsid}`)}
                  className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                >
                  <CircleDot className="size-3.5 mr-2 text-primary" />
                  {issue?.board?.title || `Board #${bdsid}`}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {orgs.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      Your Organizations
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
                <DropdownMenuItem
                  onClick={() => router.push("/org/create")}
                  className="text-[13px] rounded-sm focus:bg-foreground/5 focus:text-foreground cursor-pointer px-2 py-1.5"
                >
                  <Plus className="size-3.5 mr-2" />
                  All Organizations
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

        {/* Right Zone: Presence & Theme */}
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
            <PopoverTrigger
              render={
                <button className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-sm hover:bg-foreground/5 transition-colors outline-none" />
              }
            >
              <div className="flex -space-x-1.5">
                {[...Array(Math.min(3, activeUsers.length + 1))].map((_, i) => (
                  <div
                    key={i}
                    className="size-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[9px] text-foreground font-medium z-10"
                  >
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
                Active on Board
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground">
                  <div className="size-6 rounded-full bg-background border border-border flex items-center justify-center">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                  <span>You</span>
                </div>
                {activeUsers.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-foreground/5 text-[13px] text-foreground"
                  >
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

      {/* Breadcrumb Row */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-2.5 border-b border-border/70 bg-background/50 text-[12px] font-mono text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={() => router.push(`/checkingboard/${bdsid}`)}
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span className="truncate">{issue?.board?.title || `Board #${bdsid}`}</span>
          </button>
          <span>/</span>
          <span className="text-foreground/80 font-medium">{currentStatusObj.label}</span>
          <span>/</span>
          <span className="text-foreground">Issue #{issueId}</span>
        </div>

        {/* Overflow Menu (⋯) with Delete Action */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-sm"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] bg-popover border-border rounded-sm p-1">
            <DropdownMenuItem
              onClick={handleDeleteIssue}
              className="text-[13px] text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-sm px-2 py-1.5"
            >
              <Trash2 className="size-3.5 mr-2" />
              Delete issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Tab Switcher (Details vs Discussion) */}
      <div className="lg:hidden flex border-b border-border bg-background">
        <button
          onClick={() => setMobileTab("details")}
          className={`flex-1 py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            mobileTab === "details"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <FileText className="size-3.5" />
          Details
        </button>
        <button
          onClick={() => setMobileTab("discussion")}
          className={`flex-1 py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            mobileTab === "discussion"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <MessageSquare className="size-3.5" />
          Discussion
          {comments.length > 0 && (
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded-full text-foreground">
              {comments.length}
            </span>
          )}
        </button>
      </div>

      {/* Main 2-Column Working Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* LEFT COLUMN: Issue Detail (~62% width) */}
        <div
          className={`${
            mobileTab === "details" ? "flex" : "hidden"
          } lg:flex flex-col flex-1 lg:w-[62%] border-b lg:border-b-0 lg:border-r border-border overflow-y-auto p-6 sm:p-10`}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl w-full flex flex-col gap-6"
          >
            {/* Status Dropdown */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-secondary/60 hover:bg-secondary border border-border text-[12px] font-medium transition-colors outline-none" />
                  }
                >
                  <span className={`size-2 rounded-full ${currentStatusObj.dotColor}`} />
                  <span className="text-foreground">{currentStatusObj.label}</span>
                  <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[160px] bg-popover border-border rounded-sm p-1">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("TODO")}
                    className="text-[12px] px-2 py-1.5 rounded-sm cursor-pointer flex items-center gap-2"
                  >
                    <span className="size-2 rounded-full bg-blue-400" />
                    To-Do
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                    className="text-[12px] px-2 py-1.5 rounded-sm cursor-pointer flex items-center gap-2"
                  >
                    <span className="size-2 rounded-full bg-amber-400" />
                    In-Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("DONE")}
                    className="text-[12px] px-2 py-1.5 rounded-sm cursor-pointer flex items-center gap-2"
                  >
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-[12px] font-mono text-muted-foreground/60">
                Created by {issue?.user?.firstname || `User #${issue?.userId || "?"}`}
              </span>
            </div>

            {/* Title (Inline Editable) */}
            <div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="w-full text-[24px] sm:text-[28px] font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none tracking-tight leading-tight"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-[24px] sm:text-[28px] font-semibold text-foreground tracking-tight leading-tight cursor-text hover:bg-foreground/5 rounded-sm p-1 -ml-1 transition-colors"
                  title="Click to edit title"
                >
                  {issue?.title || "Loading issue..."}
                </h1>
              )}
            </div>

            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 border-y border-border/60 text-[12px]">
              {/* Assignee */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <UserCheck className="size-3" /> Assignee
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center text-[9px] font-medium font-mono">
                    {getInitials(issue?.user?.firstname || "You")}
                  </div>
                  <span className="text-foreground font-medium truncate">
                    {issue?.user?.firstname ? `${issue.user.firstname} ${issue.user.lastname || ""}` : "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> Created
                </span>
                <span className="text-foreground font-mono mt-0.5">
                  {issue?.createdAt ? `${formatDate(issue.createdAt)} · ${formatTime(issue.createdAt)}` : "—"}
                </span>
              </div>

              {/* Board / Project */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Tag className="size-3" /> Board
                </span>
                <span className="text-foreground font-medium truncate mt-0.5">
                  {issue?.board?.title || `Board #${bdsid}`}
                </span>
              </div>
            </div>

            {/* Description (Inline Editable) */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </span>

              {isEditingDesc ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Add a detailed description..."
                    rows={6}
                    autoFocus
                    className="w-full text-[14px] leading-relaxed bg-background text-foreground border-border rounded-sm focus-visible:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSaveDesc} className="h-8 text-[12px] rounded-sm px-4">
                      Save description
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDesc(false)}
                      className="h-8 text-[12px] rounded-sm text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="min-h-[100px] p-3 rounded-sm border border-transparent hover:border-border/60 hover:bg-foreground/5 cursor-text transition-colors"
                  title="Click to edit description"
                >
                  {issue?.description ? (
                    <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  ) : (
                    <p className="text-[14px] text-muted-foreground italic">
                      Add a description...
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Live Discussion Panel (~38% width) */}
        <div
          className={`${
            mobileTab === "discussion" ? "flex" : "hidden"
          } lg:flex flex-col flex-1 lg:w-[38%] bg-secondary/20 h-full overflow-hidden`}
        >
          {/* Discussion Header */}
          <div className="flex items-center justify-between h-12 px-4 border-b border-border bg-background/80 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="text-[13px] font-semibold text-foreground tracking-tight">Discussion</span>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {comments.filter((c) => !c.isSystem).length}
              </span>
            </div>

            {/* Per-Issue Presence ("3 here now") */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[...Array(Math.min(3, activeUsers.length + 1))].map((_, i) => (
                  <div
                    key={i}
                    className="size-5 rounded-full bg-primary/20 text-primary border border-background flex items-center justify-center text-[8px] font-mono font-bold"
                  >
                    {i === 0 ? "YOU" : `U${i}`}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {activeUsers.length + 1} here now
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[300px]"
          >
            <AnimatePresence initial={false}>
              {comments.map((comment, index) => {
                // System message check
                if (comment.isSystem) {
                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center my-1"
                    >
                      <span className="text-[11px] font-mono text-muted-foreground/70 bg-background/60 border border-border/50 px-2.5 py-0.5 rounded-full">
                        {comment.content} · {formatTime(comment.createdAt)}
                      </span>
                    </motion.div>
                  );
                }

                // Check consecutive grouping
                const prevComment = comments[index - 1];
                const isConsecutive =
                  prevComment &&
                  !prevComment.isSystem &&
                  prevComment.userId === comment.userId &&
                  Math.abs(new Date(comment.createdAt).getTime() - new Date(prevComment.createdAt).getTime()) <
                    120000; // 2 minutes

                const senderName = comment.user?.firstname
                  ? `${comment.user.firstname} ${comment.user.lastname || ""}`
                  : `User #${comment.userId}`;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className={`flex gap-2.5 ${isConsecutive ? "mt-0.5" : "mt-2"}`}
                  >
                    {/* Avatar (omit if consecutive from same sender) */}
                    <div className="w-6 shrink-0">
                      {!isConsecutive ? (
                        <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-medium font-mono">
                          {getInitials(senderName)}
                        </div>
                      ) : (
                        <div className="size-6" />
                      )}
                    </div>

                    {/* Message Bubble & Meta */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {!isConsecutive && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-foreground truncate">
                            {senderName}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className="bg-background border border-border/70 rounded-md p-2.5 text-[13px] text-foreground leading-relaxed shadow-sm break-words">
                        {comment.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div ref={messageEndRef} />
          </div>

          {/* Typing Indicator */}
          <div className="h-5 px-4 flex items-center">
            {typingUsers.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] italic font-mono text-muted-foreground"
              >
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </motion.span>
            )}
          </div>

          {/* Message Composer */}
          <div className="p-3 border-t border-border bg-background shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => handleComposerTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isOffline}
                placeholder={isOffline ? "Reconnecting to discussion..." : "Write a comment... (Enter to send)"}
                rows={2}
                className="min-h-[44px] max-h-28 text-[13px] resize-none bg-secondary/30 border-border rounded-sm focus-visible:ring-primary"
              />
              <Button
                type="submit"
                disabled={!messageInput.trim() || isOffline}
                className="h-[44px] px-3 bg-foreground text-background hover:bg-foreground/90 rounded-sm shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

