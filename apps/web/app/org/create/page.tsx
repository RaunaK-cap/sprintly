"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Trash2,
  Plus,
  Loader2,
  LogOut,
  Building,
  ArrowRight,
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthToken, clearAuthToken } from "@/lib/auth";

interface Org {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  // Left side: orgs user created (ADMIN)
  const [createdOrgs, setCreatedOrgs] = useState<Org[]>([]);
  // Right side: all other orgs (not created by user)
  const [availableOrgs, setAvailableOrgs] = useState<Org[]>([]);
  const [joinedOrgIds, setJoinedOrgIds] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Joining state
  const [joiningId, setJoiningId] = useState<number | null>(null);
  // Deleting state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  /**
   * ---------------------------------------------------------------------------
   * 🔄 Fetch Current User Profile (`GET /api/v1/users/me`)
   * ---------------------------------------------------------------------------
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, [NEXT_PUBLIC_API_URL]);

  /**
   * ---------------------------------------------------------------------------
   * 🔄 Fetch Organizations (`GET /api/v1/org/getorg` & `GET /api/v1/org/allorgs`)
   * ---------------------------------------------------------------------------
   */
  const fetchOrgs = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Two parallel requests:
      // 1. GET /getorg -> orgs user CREATED (ADMIN) -> left side
      // 2. GET /allorgs -> all OTHER orgs -> right side
      const [createdRes, allRes] = await Promise.all([
        axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/org/getorg`, { headers }),
        axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/org/allorgs`, { headers }),
      ]);
      
      if (createdRes.data.success) {
        setCreatedOrgs(createdRes.data.data || []);
      }
      
      if (allRes.data.success) {
        const joined: Org[] = allRes.data.data.joinedOrgs || [];
        const available: Org[] = allRes.data.data.availableOrgs || [];
        
        setAvailableOrgs([...joined, ...available]);
        setJoinedOrgIds(new Set(joined.map(o => o.id)));
      }
    } catch (err: unknown) {
      console.error("Failed to fetch orgs:", err);
    } finally {
      setLoading(false);
    }
  }, [router, NEXT_PUBLIC_API_URL]);

  // Initial fetch
  useEffect(() => {
    fetchCurrentUser();
    fetchOrgs();
  }, [fetchCurrentUser, fetchOrgs]);

  /**
   * ---------------------------------------------------------------------------
   * 🚀 Create Organization (`POST /api/v1/org/createorg`)
   * ---------------------------------------------------------------------------
   */
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim().length < 2) {
      setCreateError("Organization name must be at least 2 characters.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const token = getAuthToken();
      const res = await axios.post(
        `${NEXT_PUBLIC_API_URL}/api/v1/org/createorg`,
        { name: newOrgName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewOrgName("");
      setIsDialogOpen(false);
      fetchOrgs();

      // If org created successfully, redirect to its new hub
      if (res.data.success && res.data.data?.id) {
        router.push(`/org/${res.data.data.id}`);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setCreateError(err.response?.data?.message || "Failed to create organization");
      } else if (err instanceof Error) {
        setCreateError(err.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * ---------------------------------------------------------------------------
   * 🚀 Join Organization (`POST /api/v1/org/joinorg`)
   * ---------------------------------------------------------------------------
   */
  const handleJoinOrg = async (e: React.MouseEvent, orgId: number) => {
    e.stopPropagation();
    setJoiningId(orgId);
    try {
      const token = getAuthToken();
      await axios.post(
        `${NEXT_PUBLIC_API_URL}/api/v1/org/joinorg`,
        { orgId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrgs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to join organization");
      }
    } finally {
      setJoiningId(null);
    }
  };

  /**
   * ---------------------------------------------------------------------------
   * 🚀 Delete Organization (`DELETE /api/v1/org/deleteorg?orgId=X`)
   * ---------------------------------------------------------------------------
   */
  const handleDeleteOrg = async (e: React.MouseEvent, orgId: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this organization? This cannot be undone.")) return;

    setDeletingId(orgId);
    try {
      const token = getAuthToken();
      await axios.delete(
        `${NEXT_PUBLIC_API_URL}/api/v1/org/deleteorg?orgId=${orgId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrgs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete organization.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = () => {
    clearAuthToken();
    router.push("/login");
  };

  const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : "?";

  if (loading && createdOrgs.length === 0 && availableOrgs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-12 font-sans selection:bg-primary/20 selection:text-foreground">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-semibold text-foreground tracking-tight leading-tight">
              Organizations
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Select an organization to manage its boards and team members.
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground h-11 w-11 rounded-sm shrink-0"
              title="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* User Profile Menu */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm hover:bg-foreground/5 text-foreground transition-colors outline-none cursor-pointer h-11">
                      <div className="size-6 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[12px] font-bold">
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

            {/* Create Org Dialog Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger 
                render={
                  <Button className="h-11 bg-foreground text-background hover:bg-foreground/90 rounded-sm px-6 w-full sm:w-auto font-medium">
                    <Plus className="size-4 mr-1.5" />
                    Create organization
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[420px] bg-background border-border rounded-sm p-6 shadow-none">
                <form onSubmit={handleCreateOrg}>
                  <DialogHeader>
                    <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-foreground">
                      Create organization
                    </DialogTitle>
                    <DialogDescription className="text-[14px] text-muted-foreground">
                      Give your organization a name. You can create multiple boards and invite team members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <Input 
                      placeholder="e.g. Acme Studio" 
                      value={newOrgName}
                      onChange={(e) => {
                        setNewOrgName(e.target.value);
                        if (createError) setCreateError(null);
                      }}
                      className="h-11 rounded-sm border-border placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1"
                      autoFocus
                    />
                    {createError && (
                      <p className="text-red-500 text-[12px] mt-2">{createError}</p>
                    )}
                  </div>
                  <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsDialogOpen(false)}
                      className="h-11 rounded-sm text-foreground hover:bg-muted/50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreating}
                      className="h-11 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-6 font-medium"
                    >
                      {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 mt-4">
          
          {/* LEFT: Your Created Organizations */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-foreground tracking-tight border-b border-border pb-2">
              Your Organizations
            </h2>
            
            {createdOrgs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {createdOrgs.map((org) => (
                  <div 
                    key={org.id}
                    onClick={() => router.push(`/org/${org.id}`)}
                    className="group relative flex items-center justify-between p-4 bg-background border border-border rounded-md cursor-pointer hover:border-foreground/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-10 rounded-sm bg-primary/10 text-primary font-semibold text-[16px]">
                        {getInitials(org.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                          {org.name}
                        </span>
                        <span className="text-[12px] text-muted-foreground mt-0.5">
                          View boards & members
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteOrg(e, org.id)}
                        disabled={deletingId === org.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-sm"
                        title="Delete Organization"
                      >
                        {deletingId === org.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-border border-dashed rounded-md bg-muted/20">
                <p className="text-[14px] text-muted-foreground mb-4">
                  You haven&apos;t created any organizations yet.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                  className="h-9 rounded-sm"
                >
                  <Plus className="size-4 mr-2" />
                  Create one now
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT: Available Organizations (other users created these) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-foreground tracking-tight border-b border-border pb-2">
              Available Organizations
            </h2>
            
            {availableOrgs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {availableOrgs.map((org) => {
                  const alreadyJoined = joinedOrgIds.has(org.id);
                  return (
                    <div 
                      key={org.id}
                      onClick={() => {
                        if (alreadyJoined) {
                          router.push(`/org/${org.id}`);
                        }
                      }}
                      className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-md cursor-pointer hover:border-foreground/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-10 rounded-sm bg-background border border-border text-foreground font-semibold text-[16px]">
                          {getInitials(org.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-medium text-foreground leading-tight">
                            {org.name}
                          </span>
                          <span className="text-[12px] text-muted-foreground mt-0.5">
                            {alreadyJoined ? "Joined — click to view boards" : "Click Join to participate"}
                          </span>
                        </div>
                      </div>
                      
                      {!alreadyJoined ? (
                        <Button
                          variant="outline"
                          onClick={(e) => handleJoinOrg(e, org.id)}
                          disabled={joiningId === org.id}
                          className="h-8 text-[12px] bg-background hover:bg-foreground hover:text-background rounded-sm transition-colors shrink-0"
                        >
                          {joiningId === org.id ? (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          ) : null}
                          Join
                        </Button>
                      ) : (
                        <ArrowRight className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-border border-dashed rounded-md bg-muted/20">
                <p className="text-[14px] text-muted-foreground">
                  No other organizations available right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
