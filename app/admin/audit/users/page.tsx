"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getUserList } from "@/lib/actions/audit.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AuditUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (
          !currentUser ||
          (currentUser.role !== "ADMIN" &&
            currentUser.role !== ("AUDITOR" as any))
        ) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        const usersList = await getUserList();
        setUsers(usersList || []);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(query) ||
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  function getRoleColor(role: string) {
    const colors: Record<string, string> = {
      ADMIN:
        "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
      AUDITOR:
        "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30",
      DOCTOR:
        "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
      PATIENT:
        "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
    };
    return (
      colors[role] ||
      "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30"
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <UsersIcon
            size={32}
            className="text-purple-600 dark:text-purple-400"
          />
          Utilisateurs du Système
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredUsers.length} utilisateurs actifs
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Rechercher par email, nom ou rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Utilisateurs
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administrateurs
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {users.filter((u) => u.role === "AUDITOR").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Auditeurs
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.filter((u) => u.role === "DOCTOR").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Médecins</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Liste des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800">
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Email
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Nom
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Rôle
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    Créé le
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <TableCell className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Mail
                          size={16}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        {u.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(u.role)}>
                          <Shield size={14} className="mr-1 inline" />
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="inline mr-2" />
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
