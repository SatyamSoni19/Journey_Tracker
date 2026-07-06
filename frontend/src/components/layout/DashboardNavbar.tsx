import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, LogOut, MapPin, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NOTIFICATIONS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function DashboardNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/auth");
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left — Logo only */}
        <div className="flex items-center flex-shrink-0">
          <Logo size="md" />
        </div>

        {/* Center — Big Search Bar */}
        <div className="flex flex-1 justify-center px-4">
          <motion.div
            animate={{ width: searchFocused ? "100%" : "65%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative max-w-2xl w-full"
          >
            <Search
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                searchFocused ? "text-brand" : "text-muted-foreground"
              )}
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips, destinations, activities..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "h-10 w-full rounded-full border bg-muted/60 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60",
                "transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand focus:bg-background focus:shadow-brand",
                searchFocused
                  ? "border-brand/60 bg-background shadow-sm"
                  : "border-transparent hover:border-border hover:bg-muted"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            )}
          </motion.div>
        </div>

        {/* Right — My Trips + Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* AI Planner Link */}
          <Link
            to="/ai-planner"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
          >
            <Sparkles size={18} className="text-brand group-hover:scale-110 transition-transform" />
            AI Planner
          </Link>

          {/* My Trips Link */}
          <Link
            to="/my-trips"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
          >
            <MapPin size={18} className="text-brand group-hover:scale-110 transition-transform" />
            My Trips
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-border" />

          <ThemeToggle />

          {/* Notifications — NO badge count */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowNotifications((p) => !p)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted hover:border-brand/40"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {/* Tiny unread dot — no count */}
              {NOTIFICATIONS.some((n) => !n.read) && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card p-4 shadow-elevated"
                >
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Notifications
                  </h3>
                  <div className="space-y-2">
                    {NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted cursor-pointer",
                          !n.read && "bg-brand/5"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 h-2 w-2 flex-shrink-0 rounded-full",
                            !n.read ? "bg-brand" : "bg-transparent"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/60">
                            {n.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar + dropdown */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand/80 to-brand border border-brand/30 text-base font-bold text-white shadow-sm"
              aria-label="User menu"
            >
              {user ? initial : <User size={20} />}
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-elevated"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}