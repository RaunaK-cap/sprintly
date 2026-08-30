"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Kanban,
  Building2,
  Plus,
  Clock,
  LogOut,
  UserPlus,
} from "lucide-react";

interface Organization {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [myOrgs, setMyOrgs] = useState<Organization[]>([]);
  const [otherOrgs, setOtherOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrgs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch("http://localhost:4000/api/v1/org/allorgs", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to fetch organizations");
      }

      setMyOrgs(resData.data?.myOrgs || []);
      setOtherOrgs(resData.data?.otherOrgs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleJoinOrg = async (e: React.MouseEvent, orgId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:4000/api/v1/org/joinorg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ orgId }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to join organization");
      }

      await fetchOrgs();
    } catch (err: any) {
      setError(err.message || "Failed to join organization");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Kanban className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Sprintly</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/org/create"
              className="text-xs font-medium px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Org</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-medium px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
            Loading workspaces...
          </div>
        ) : (
          <div className="space-y-12">
            {/* Joined workspaces */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Your Workspaces</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Select an organization you belong to, to manage your collaborative boards in real-time.
                  </p>
                </div>
              </div>

              {myOrgs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl bg-gray-900/10">
                  <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-xs">
                    You haven't joined any workspaces yet. Create one or join an available one below!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myOrgs.map((org) => (
                    <Link
                      key={org.id}
                      href={`/checkingboard/${org.id}`}
                      className="group p-6 bg-gray-900/80 border border-gray-800 rounded-2xl hover:border-indigo-500/50 hover:bg-gray-900 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full">
                            ID: {org.id}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {org.name}
                        </h3>
                        {org.description && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {org.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Joined
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other workspaces available to join */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4 border-t border-gray-800/40">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Available Workspaces</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Discover and join other active organizations on Sprintly.
                  </p>
                </div>
              </div>

              {otherOrgs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl bg-gray-900/10">
                  <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-xs">
                    No other workspaces are currently available to join.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherOrgs.map((org) => (
                    <div
                      key={org.id}
                      className="p-6 bg-gray-900/40 border border-gray-800/60 rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-gray-800 text-gray-400 rounded-xl">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">
                            ID: {org.id}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-300">
                          {org.name}
                        </h3>
                        {org.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {org.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Available
                        </span>

                        <button
                          onClick={(e) => handleJoinOrg(e, org.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Join Workspace</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
