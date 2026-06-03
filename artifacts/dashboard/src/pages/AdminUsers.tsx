import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, UserCheck, UserX, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const API_BASE = `${BASE_URL}/api`;

interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  signupDate: string;
  banned: boolean;
  role: string;
}

async function fetchUsers(): Promise<{ users: AdminUser[]; total: number }> {
  const res = await fetch(`${API_BASE}/admin/users`);
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

async function setUserBanned(userId: string, banned: boolean): Promise<void> {
  const action = banned ? "disable" : "enable";
  const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    retry: false,
  });

  const toggleBan = useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) =>
      setUserBanned(userId, banned),
    onSuccess: (_data, { banned }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: banned ? "User disabled" : "User enabled",
        description: banned
          ? "The user has been banned and can no longer sign in."
          : "The user has been re-enabled and can sign in again.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const filtered = (data?.users ?? []).filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const isForbidden = isError && (error as Error)?.message === "forbidden";

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">User Management</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage all registered accounts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4">
        {isForbidden ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Shield className="w-12 h-12 text-muted-foreground/40" />
            <h2 className="text-lg font-semibold text-foreground">Admin access required</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your account does not have admin privileges. Contact an existing administrator to
              grant access.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {data && (
                <p className="text-sm text-muted-foreground">
                  {filtered.length} of {data.total} users
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Signed up
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        {search ? "No users match your search." : "No users found."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {user.displayName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(user.signupDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {user.role === "admin" ? (
                            <Badge variant="default" className="bg-primary/10 text-primary border-0">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.banned ? (
                            <Badge variant="destructive" className="gap-1">
                              <UserX className="w-3 h-3" />
                              Disabled
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1 text-green-700 border-green-200 bg-green-50"
                            >
                              <UserCheck className="w-3 h-3" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={user.banned ? "outline" : "ghost"}
                            size="sm"
                            disabled={toggleBan.isPending}
                            onClick={() =>
                              toggleBan.mutate({ userId: user.id, banned: !user.banned })
                            }
                            className={
                              user.banned
                                ? "text-green-700 border-green-200 hover:bg-green-50"
                                : "text-destructive hover:text-destructive hover:bg-destructive/10"
                            }
                          >
                            {user.banned ? "Enable" : "Disable"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
