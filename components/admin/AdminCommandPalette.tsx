"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Command } from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  href?: string;
  action?: () => void;
}

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "alerts",
      title: "Alertes",
      href: "/dashboard/admin/alerts",
      description: "Voir toutes les alertes",
    },
    {
      id: "analytics",
      title: "Analyses",
      href: "/dashboard/admin/analytics",
      description: "Voir les statistiques",
    },
    {
      id: "users",
      title: "Utilisateurs",
      href: "/dashboard/admin/users",
      description: "Gérer les utilisateurs",
    },
    {
      id: "services",
      title: "Services",
      href: "/dashboard/admin/services",
      description: "Gérer les services",
    },
    {
      id: "questionnaires",
      title: "Questionnaires",
      href: "/dashboard/admin/questionnaires",
      description: "Gérer les questionnaires",
    },
    {
      id: "pending",
      title: "Patients en Attente",
      href: "/dashboard/admin/pending-patients",
      description: "Approuver les patients",
    },
    {
      id: "export",
      title: "Export",
      href: "/dashboard/admin/export",
      description: "Exporter les données",
    },
    {
      id: "audit",
      title: "Audit",
      href: "/dashboard/admin/audit",
      description: "Voir les logs d'audit",
    },
    {
      id: "settings",
      title: "Paramètres",
      href: "/dashboard/admin/settings",
      description: "Configuration du système",
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (item: CommandItem) => {
    if (item.href) router.push(item.href);
    if (item.action) item.action();
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* Command Palette Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm text-slate-600 dark:text-slate-400"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Recherche...</span>
        <kbd className="hidden sm:inline ml-auto text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Command Palette */}
      {open && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 shadow-lg rounded-lg overflow-hidden bg-white dark:bg-slate-800">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <Command size={20} className="text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Rechercher par commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-500"
            />
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {filtered.length > 0 ? (
              <div className="p-2">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors mb-1"
                  >
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Aucune commande trouvée
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            Appuyez sur{" "}
            <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
              ESC
            </kbd>{" "}
            pour fermer
          </div>
        </div>
      )}
    </>
  );
}
