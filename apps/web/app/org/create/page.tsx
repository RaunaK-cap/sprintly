"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";
import { Sun, Moon, Trash2, Plus, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Org {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  // Left side: orgs user created (ADMIN)
  const [createdOrgs, setCreatedOrgs] = useState<Org[]>([]);
  // Right side: all other orgs (not created by user)
  const [availableOrgs, setAvailableOrgs] = useState<Org[]>([]);
  const [joinedOrgIds, setJoinedOrgIds] = useState<Set<number>>(new Set());
  
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
  
  const fetchOrgs = useCallback(async () => {
    try {
      const token = localStorage.getItem("sprintly_token");
      if (!token) {
        router.push("/login");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Two parallel requests:
      // 1. GET /getorg (no orgId) -> returns orgs user CREATED (ADMIN) -> left side
      // 2. GET /allorgs -> returns all OTHER orgs (excludes user-created) -> right side
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
        
        // Merge joined + available into one list for the right side
        setAvailableOrgs([...joined, ...available]);
        // Track which ones the user already joined
        setJoinedOrgIds(new Set(joined.map(o => o.id)));
      }
    } catch (err: unknown) {
      console.error("Failed to fetch orgs:", err);
    } finally {
      setLoading(false);
    }
  }, [router, NEXT_PUBLIC_API_URL]);

  // Initial fetch + polling every 3 seconds
  useEffect(() => {
    fetchOrgs();
    const intervalId = setInterval(fetchOrgs, 3000);
    return () => clearInterval(intervalId);
  }, [fetchOrgs]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim().length < 2) {
      setCreateError("Organization name must be at least 2 characters.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem("sprintly_token");
      await axios.post(
        `${NEXT_PUBLIC_API_URL}/api/v1/org/createorg`,
        { name: newOrgName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewOrgName("");
      setIsDialogOpen(false);
      fetchOrgs();
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

  const handleJoinOrg = async (e: React.MouseEvent, orgId: number) => {
    e.stopPropagation();
    setJoiningId(orgId);
    try {
      const token = localStorage.getItem("sprintly_token");
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

  const handleDeleteOrg = async (e: React.MouseEvent, orgId: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this organization? This cannot be undone.")) return;

    setDeletingId(orgId);
    try {
      const token = localStorage.getItem("sprintly_token");
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

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

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
              Create your own org or join an available one.
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground h-11 w-11 rounded-sm shrink-0"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger 
                render={
                  <Button className="h-11 bg-foreground text-background hover:bg-foreground/90 rounded-sm px-6 w-full sm:w-auto">
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
                      Give your organization a name. You can invite people after.
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
                      className="h-11 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-6"
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
                    onClick={() => router.push(`/checkingboard/${org.id}`)}
                    className="group relative flex items-center justify-between p-4 bg-background border border-border rounded-md cursor-pointer hover:border-foreground/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-10 rounded-sm bg-primary/10 text-primary font-semibold text-[16px]">
                        {getInitials(org.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-foreground leading-tight">
                          {org.name}
                        </span>
                        <span className="text-[12px] text-muted-foreground mt-0.5">
                          Click to enter board
                        </span>
                      </div>
                    </div>
                    
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
                      onClick={() => router.push(`/checkingboard/${org.id}`)}
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
                            {alreadyJoined ? "Joined — click to enter" : "Click to enter board"}
                          </span>
                        </div>
                      </div>
                      
                      {!alreadyJoined && (
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
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-md bg-background">
                <p className="text-[14px] text-muted-foreground">
                  No organizations available yet.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
