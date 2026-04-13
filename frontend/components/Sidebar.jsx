"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar({ isOpen, onClose, items = [], activeClassName, ariaLabel = "Navigation", showSignOut = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSignOut = () => {
    setUser(null);
    router.push("/");
  };

  return (
      <>
        {isOpen && (
            <button
                type="button"
                className="fixed inset-0 z-40 cursor-pointer border-0 bg-black/50 p-0 lg:hidden"
                aria-label="Close menu"
                onClick={onClose}
            />
        )}
        <aside
            className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-[#862633] dark:bg-zinc-900 border-r border-white/10 dark:border-zinc-700 shadow-xl transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-label={ariaLabel}
        >
          <div className="flex flex-col h-full pt-4 px-4 pb-6">
            <nav className="flex flex-col gap-1">
              {items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                                ? activeClassName || ""
                                : "text-white/70 dark:text-zinc-400 hover:bg-white/10 dark:hover:bg-zinc-800 hover:text-white dark:hover:text-white"
                        }`}
                        style={isActive && !activeClassName ? { background: "#862633", color: "#F5E6C8" } : {}}
                    >
                      {Icon && <Icon className="w-5 h-5 shrink-0" />}
                      {label}
                    </Link>
                );
              })}
            </nav>
            {showSignOut && (
                <div className="mt-auto pt-4 border-t border-white/20 dark:border-zinc-700">
                  <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/70 dark:text-zinc-400 hover:bg-white/10 dark:hover:bg-zinc-800 hover:text-white dark:hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    Sign out
                  </button>
                </div>
            )}
          </div>
        </aside>
      </>
  );
}