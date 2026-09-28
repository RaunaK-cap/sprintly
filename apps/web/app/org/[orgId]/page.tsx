"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Users,
  Settings,
  Plus,
  ArrowLeft,
  Trash2,
  Edit3,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Search,
  Loader2,
  Check,
  MoreVertical,
  CircleDot,
  Building,
  LogOut,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAuthToken, clearAuthToken } from "@/lib/auth";

// -----------------------------------------------------------------------------
// 📦 TypeScript Interfaces
// -----------------------------------------------------------------------------
interface Board {
  id: number;
  title: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    issues: number;
  };
}

interface Member {
  id: number;
  userId: number;
  organizationId: number;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: string;
  };
}

interface Organization {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  board?: Board[];
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export default function OrgHubPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = Number(params?.orgId);
  const { theme, setTheme } = useTheme();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ---------------------------------------------------------------------------
  // ⚡ Component State
  // ---------------------------------------------------------------------------
  const [org, setOrg] = useState<Organization | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("boards");

  // Create Board Dialog State
  const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);

  // Rename Board Dialog State
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [updatingBoard, setUpdatingBoard] = useState(false);

  // Invite / Add Member Dialog State
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  // Org Settings State
  const [editOrgName, setEditOrgName] = useState("");
  const [editOrgDesc, setEditOrgDesc] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaveSuccess, setOrgSaveSuccess] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // ---------------------------------------------------------------------------
  // 🔄 Data Fetching: Connects to Backend Endpoints
  // ---------------------------------------------------------------------------

  // 1. Fetch Current Logged-in User Profile (`GET /api/v1/users/me`)
  const fetchCurrentUser = useCallback(async () => {
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
      console.error("Error fetching current user:", err);
    }
  }, [API_URL]);

  // 2. Fetch Organization Details (`GET /api/v1/org/getorg?orgId=X`)
  const fetchOrgDetails = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await axios.get(`${API_URL}/api/v1/org/getorg?orgId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrg(res.data.data);
        setEditOrgName(res.data.data.name || "");
        setEditOrgDesc(res.data.data.description || "");
      }
    } catch (err) {
      console.error("Error fetching org:", err);
    }
  }, [API_URL, orgId, router]);

  // 3. Fetch Boards for this Organization (`GET /api/v1/boards?orgId=X`)
  const fetchBoards = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/v1/boards?orgId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBoards(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  }, [API_URL, orgId]);

  // 4. Fetch Members for this Organization (`GET /api/v1/org/members?orgId=X`)
  const fetchMembers = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/v1/org/members?orgId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMembers(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  }, [API_URL, orgId]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchCurrentUser(),
        fetchOrgDetails(),
        fetchBoards(),
        fetchMembers(),
      ]);
      setLoading(false);
    };
    if (orgId) {
      loadAll();
    }
  }, [orgId, fetchCurrentUser, fetchOrgDetails, fetchBoards, fetchMembers]);

  // User search for autocomplete (`GET /api/v1/users/search?q=...`)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const token = getAuthToken();
        const res = await axios.get(
          `${API_URL}/api/v1/users/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, API_URL]);

  // ---------------------------------------------------------------------------
  // 🎯 Action Handlers: Connects to Backend Mutations
  // ---------------------------------------------------------------------------

  // Create Board (`POST /api/v1/boards`)
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) {
      setBoardError("Board title is required");
      return;
    }

    setCreatingBoard(true);
    setBoardError(null);
    try {
      const token = getAuthToken();
      const res = await axios.post(
        `${API_URL}/api/v1/boards`,
        { title: newBoardTitle.trim(), organizationId: orgId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNewBoardTitle("");
        setIsBoardDialogOpen(false);
        fetchBoards(); // Refresh boards list
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setBoardError(err.response?.data?.message || "Failed to create board");
      }
    } finally {
      setCreatingBoard(false);
    }
  };

  // Update / Rename Board (`PUT /api/v1/boards/:id`)
  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editBoardTitle.trim()) return;

    setUpdatingBoard(true);
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/api/v1/boards/${editingBoard.id}`,
        { title: editBoardTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBoard(null);
      fetchBoards(); // Refresh boards list
    } catch (err: unknown) {
      console.error("Failed to update board:", err);
    } finally {
      setUpdatingBoard(false);
    }
  };

  // Delete Board (`DELETE /api/v1/boards/:id`)
  const handleDeleteBoard = async (e: React.MouseEvent, boardId: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this board? All cards will be deleted.")) {
      return;
    }
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/api/v1/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBoards(); // Refresh boards list
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete board");
      }
    }
  };

  // Invite / Add Member by Email (`POST /api/v1/org/addmember`)
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      setMemberError("Email is required");
      return;
    }

    setAddingMember(true);
    setMemberError(null);
    try {
      const token = getAuthToken();
      const res = await axios.post(
        `${API_URL}/api/v1/org/addmember`,
        { orgId, email: memberEmail.trim(), role: memberRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMemberEmail("");
        setSearchQuery("");
        setIsMemberDialogOpen(false);
        fetchMembers(); // Refresh members list
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMemberError(err.response?.data?.message || "Failed to add member");
      }
    } finally {
      setAddingMember(false);
    }
  };

  // Remove Member (`DELETE /api/v1/org/removemember`)
  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const token = getAuthToken();
      await axios.delete(
        `${API_URL}/api/v1/org/removemember?orgId=${orgId}&userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMembers(); // Refresh members list
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to remove member");
      }
    }
  };

  // Update Org Details (`PUT /api/v1/org/updateorg`)
  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrgName.trim()) return;

    setSavingOrg(true);
    setOrgSaveSuccess(false);
    try {
      const token = getAuthToken();
      const res = await axios.put(
        `${API_URL}/api/v1/org/updateorg`,
        { orgId, name: editOrgName.trim(), description: editOrgDesc.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setOrg((prev) => (prev ? { ...prev, name: editOrgName, description: editOrgDesc } : null));
        setOrgSaveSuccess(true);
        setTimeout(() => setOrgSaveSuccess(false), 3000);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to update organization");
      }
    } finally {
      setSavingOrg(false);
    }
  };

  // Delete Org (`DELETE /api/v1/org/deleteorg`)
  const handleDeleteOrg = async () => {
    if (!window.confirm("WARNING: This will permanently delete this organization and ALL its boards and cards. Continue?")) {
      return;
    }
    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/api/v1/org/deleteorg?orgId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/org/create");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete organization");
      }
    }
  };

  const handleSignOut = () => {
    clearAuthToken();
    router.push("/login");
  };

  const isUserAdmin = members.some((m) => m.userId === currentUser?.id && m.role === "ADMIN");

  // ---------------------------------------------------------------------------
  // 🎨 Render UI
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/org/create")}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm"
              title="Back to Organizations"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Building className="size-4 text-primary" />
              <span className="text-[14px] font-semibold text-foreground tracking-tight">
                {org?.name || `Organization #${orgId}`}
              </span>
            </div>
          </div>

          {/* Right Action Icons: Theme Toggle & User Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 size-8 rounded-sm"
              title="Toggle Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Current User Profile Menu (`GET /api/v1/users/me`) */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-sm hover:bg-foreground/5 text-foreground transition-colors outline-none cursor-pointer">
                      <div className="size-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[12px] font-bold">
                        {getInitials(currentUser.firstname)}
                      </div>
                      <span className="text-[13px] font-medium hidden sm:inline">
                        {currentUser.firstname}
                      </span>
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
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* Workspace Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[20px] font-bold">
                {getInitials(org?.name)}
              </div>
              <div>
                <h1 className="text-[22px] md:text-[26px] font-semibold text-foreground tracking-tight leading-tight">
                  {org?.name}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  {org?.description || "Workspace workspace for boards and team collaboration."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action: "+ New Board" button */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsBoardDialogOpen(true)}
              className="h-9 px-4 text-[13px] bg-foreground text-background hover:bg-foreground/90 rounded-sm font-medium"
            >
              <Plus className="size-4 mr-1.5" />
              New Board
            </Button>
          </div>
        </div>

        {/* Tab Navigation: Boards, Members, Settings */}
        <Tabs defaultValue="boards" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto gap-6">
            <TabsTrigger
              value="boards"
              className="text-[14px] pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground font-medium px-1 cursor-pointer"
            >
              <LayoutGrid className="size-4 mr-2" />
              Boards ({boards.length})
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="text-[14px] pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground font-medium px-1 cursor-pointer"
            >
              <Users className="size-4 mr-2" />
              Members ({members.length})
            </TabsTrigger>
            {isUserAdmin && (
              <TabsTrigger
                value="settings"
                className="text-[14px] pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground font-medium px-1 cursor-pointer"
              >
                <Settings className="size-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: BOARDS LIST (`GET /api/v1/boards?orgId=X`)                 */}
          {/* ----------------------------------------------------------------- */}
          <TabsContent value="boards" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* "+ Create New Board" Card */}
              <div
                onClick={() => setIsBoardDialogOpen(true)}
                className="group border border-dashed border-border hover:border-foreground/40 rounded-md p-6 flex flex-col items-center justify-center min-h-[140px] cursor-pointer transition-all bg-secondary/20 hover:bg-secondary/40 text-center"
              >
                <div className="size-8 rounded-sm bg-foreground/5 group-hover:bg-foreground/10 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors mb-2">
                  <Plus className="size-4" />
                </div>
                <span className="text-[14px] font-medium text-foreground">
                  Create new board
                </span>
                <span className="text-[12px] text-muted-foreground mt-0.5">
                  Organize tasks in columns
                </span>
              </div>

              {/* Existing Boards Cards */}
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => router.push(`/checkingboard/${board.id}`)}
                  className="group relative flex flex-col justify-between p-5 bg-background border border-border rounded-md cursor-pointer hover:border-foreground/30 hover:shadow-sm transition-all min-h-[140px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CircleDot className="size-3.5 text-primary shrink-0" />
                        <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                          {board.title}
                        </h3>
                      </div>

                      {/* Board Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded-sm transition-opacity"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-[140px] bg-popover border-border rounded-sm p-1">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBoard(board);
                              setEditBoardTitle(board.title);
                            }}
                            className="text-[12px] cursor-pointer rounded-sm"
                          >
                            <Edit3 className="size-3 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          {isUserAdmin && (
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteBoard(e, board.id)}
                              className="text-[12px] text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer rounded-sm"
                            >
                              <Trash2 className="size-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2">
                      Board #{board.id} in {org?.name}
                    </p>
                  </div>

                  {/* Card bottom metadata: count of issues */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="font-mono">
                      {board._count?.issues ?? 0} {board._count?.issues === 1 ? "card" : "cards"}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-foreground font-medium">
                      Open Board <ExternalLink className="size-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: MEMBERS DIRECTORY (`GET /api/v1/org/members?orgId=X`)      */}
          {/* ----------------------------------------------------------------- */}
          <TabsContent value="members" className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-foreground">
                    Team Members
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    People with access to all boards in this workspace.
                  </p>
                </div>

                {/* "+ Invite Member" Button */}
                {isUserAdmin && (
                  <Button
                    onClick={() => setIsMemberDialogOpen(true)}
                    className="h-9 px-3.5 text-[12px] bg-foreground text-background hover:bg-foreground/90 rounded-sm font-medium"
                  >
                    <UserPlus className="size-3.5 mr-1.5" />
                    Add Member
                  </Button>
                )}
              </div>

              {/* Members Table / List */}
              <div className="border border-border rounded-md divide-y divide-border overflow-hidden bg-background">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[13px] font-bold">
                        {getInitials(member.user.firstname)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-foreground">
                            {member.user.firstname} {member.user.lastname}
                          </span>
                          {member.userId === currentUser?.id && (
                            <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-sm font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-muted-foreground font-mono">
                          {member.user.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Role Badge */}
                      <Badge
                        variant={member.role === "ADMIN" ? "default" : "secondary"}
                        className={`text-[11px] font-medium uppercase tracking-wider rounded-sm ${
                          member.role === "ADMIN"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {member.role === "ADMIN" ? (
                          <ShieldCheck className="size-3 mr-1 inline" />
                        ) : null}
                        {member.role}
                      </Badge>

                      {/* Remove Member button (ADMIN only) */}
                      {isUserAdmin && member.userId !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="size-8 text-muted-foreground hover:text-red-500 rounded-sm"
                          title="Remove from organization"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: SETTINGS (`PUT /api/v1/org/updateorg` & `DELETE`)          */}
          {/* ----------------------------------------------------------------- */}
          {isUserAdmin && (
            <TabsContent value="settings" className="pt-6">
              <div className="max-w-xl flex flex-col gap-8">
                {/* General Information Form */}
                <form onSubmit={handleSaveOrg} className="flex flex-col gap-4">
                  <h3 className="text-[16px] font-semibold text-foreground">
                    Workspace Information
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground">
                      Organization Name
                    </label>
                    <Input
                      value={editOrgName}
                      onChange={(e) => setEditOrgName(e.target.value)}
                      className="h-10 rounded-sm border-border"
                      placeholder="e.g. Zepto Studio"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground">
                      Description
                    </label>
                    <Textarea
                      value={editOrgDesc}
                      onChange={(e) => setEditOrgDesc(e.target.value)}
                      className="rounded-sm border-border min-h-[80px]"
                      placeholder="What is this workspace used for?"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      type="submit"
                      disabled={savingOrg || !editOrgName.trim()}
                      className="h-9 px-4 text-[13px] bg-foreground text-background hover:bg-foreground/90 rounded-sm"
                    >
                      {savingOrg ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                      Save Changes
                    </Button>
                    {orgSaveSuccess && (
                      <span className="text-[12px] text-emerald-500 flex items-center gap-1">
                        <Check className="size-3.5" /> Saved successfully!
                      </span>
                    )}
                  </div>
                </form>

                {/* Danger Zone: Delete Org */}
                <div className="border border-red-500/20 bg-red-500/5 rounded-md p-5 flex flex-col gap-3">
                  <h4 className="text-[14px] font-semibold text-red-500">
                    Danger Zone
                  </h4>
                  <p className="text-[12px] text-muted-foreground">
                    Deleting this organization will delete all its boards, cards, and member records. This action cannot be undone.
                  </p>
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteOrg}
                      className="h-8 text-[12px] rounded-sm bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="size-3.5 mr-1.5" />
                      Delete Organization
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 1: CREATE NEW BOARD (`POST /api/v1/boards`)                    */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isBoardDialogOpen} onOpenChange={setIsBoardDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-background border-border rounded-sm p-6 shadow-none">
          <form onSubmit={handleCreateBoard}>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">
                Create new board
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Boards contain lists of cards (To Do, In Progress, Done) for tracking progress.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                placeholder="e.g. Sprint 1, Mobile App, Bug Tracker"
                value={newBoardTitle}
                onChange={(e) => {
                  setNewBoardTitle(e.target.value);
                  if (boardError) setBoardError(null);
                }}
                className="h-10 rounded-sm border-border placeholder:text-muted-foreground focus-visible:ring-primary"
                autoFocus
              />
              {boardError && (
                <p className="text-red-500 text-[12px] mt-2">{boardError}</p>
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsBoardDialogOpen(false)}
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
                Create Board
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 2: RENAME BOARD (`PUT /api/v1/boards/:id`)                     */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border rounded-sm p-6 shadow-none">
          <form onSubmit={handleUpdateBoard}>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">
                Rename board
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <Input
                value={editBoardTitle}
                onChange={(e) => setEditBoardTitle(e.target.value)}
                className="h-10 rounded-sm border-border"
                autoFocus
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingBoard(null)}
                className="h-9 rounded-sm text-foreground hover:bg-muted/50 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingBoard || !editBoardTitle.trim()}
                className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-4 text-[13px]"
              >
                {updatingBoard ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* DIALOG 3: ADD / INVITE MEMBER (`POST /api/v1/org/addmember`)          */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-background border-border rounded-sm p-6 shadow-none">
          <form onSubmit={handleAddMember}>
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-foreground">
                Add member to workspace
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Search registered users by name/email or type their exact email address.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 flex flex-col gap-3">
              {/* Search / Email input */}
              <div className="relative">
                <Input
                  placeholder="Enter email or search name..."
                  value={memberEmail}
                  onChange={(e) => {
                    setMemberEmail(e.target.value);
                    setSearchQuery(e.target.value);
                    if (memberError) setMemberError(null);
                  }}
                  className="h-10 rounded-sm border-border pr-8 text-[13px]"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="size-4 animate-spin absolute right-2.5 top-3 text-muted-foreground" />
                )}
              </div>

              {/* Autocomplete dropdown suggestions */}
              {searchResults.length > 0 && (
                <div className="border border-border rounded-sm p-1 max-h-36 overflow-y-auto bg-background">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setMemberEmail(user.email);
                        setSearchResults([]);
                      }}
                      className="p-2 hover:bg-secondary rounded-sm cursor-pointer flex items-center justify-between text-[12px]"
                    >
                      <span className="font-medium text-foreground">
                        {user.firstname} {user.lastname}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {user.email}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Role Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[12px] font-medium text-muted-foreground">
                  Role Permission:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMemberRole("MEMBER")}
                    className={`px-3 py-1 rounded-sm text-[12px] font-medium transition-colors ${
                      memberRole === "MEMBER"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberRole("ADMIN")}
                    className={`px-3 py-1 rounded-sm text-[12px] font-medium transition-colors ${
                      memberRole === "ADMIN"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {memberError && (
                <p className="text-red-500 text-[12px]">{memberError}</p>
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMemberDialogOpen(false)}
                className="h-9 rounded-sm text-foreground hover:bg-muted/50 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addingMember || !memberEmail.trim()}
                className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-4 text-[13px]"
              >
                {addingMember ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
