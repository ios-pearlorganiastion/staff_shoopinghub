import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { getSession, clearSession } from "../../utils/auth";

export default function AppLayout() {
  const navigate = useNavigate();
  const session = getSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const staffName = session?.staff?.name || "Rahul Sharma";
  const staffEmail =
    session?.staff?.email || "rahul@greenbasket.com";

  const firstName = staffName?.split(" ")[0] || "Rahul";

  const initials =
    staffName
      ?.split(" ")
      .map((word) => word?.[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RS";

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#202a20]">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        storeName="Green Basket Store"
        staffName={staffName}
        staffEmail={staffEmail}
        onLogout={handleLogout}
      />

      <div className="min-h-screen lg:ml-[250px]">
        <header className="sticky top-0 z-30 border-b border-[#e3ebe5] bg-white/95 shadow-[0_2px_18px_rgba(49,93,50,0.035)] backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-7">
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.94,
              }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-[#667065] shadow-sm transition-all duration-200 hover:border-[#b8df7d] hover:bg-[#eef5e7] hover:text-[#315d32] hover:shadow-md lg:hidden"
            >
              <Menu className="h-[19px] w-[19px]" />
            </motion.button>

            <div className="hidden min-w-0 md:block">
              <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#315d32]">
                <Sparkles className="h-3 w-3" />
                Management Hub
              </p>

              <h1 className="mt-0.5 truncate text-sm font-black tracking-tight text-[#202a20] lg:text-[15px]">
                Welcome back, {firstName}
              </h1>
            </div>

            <div className="relative ml-auto hidden w-full max-w-[370px] lg:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#92998e]" />

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search orders, products..."
                className="h-10 w-full rounded-xl border border-[#dfe8e1] bg-[#f8faf8] pl-10 pr-4 text-[11px] font-medium text-[#202a20] outline-none transition-all duration-200 placeholder:text-[#92998e] hover:border-[#cfded3] focus:border-[#315d32] focus:bg-white focus:ring-4 focus:ring-[#315d32]/5"
              />
            </div>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.94,
              }}
              aria-label="Search"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-[#667065] shadow-sm transition-all duration-200 hover:border-[#b8df7d] hover:bg-[#eef5e7] hover:text-[#315d32] hover:shadow-md md:hidden"
            >
              <Search className="h-[17px] w-[17px]" />
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.94,
              }}
              aria-label="Notifications"
              className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-[#667065] shadow-sm transition-all duration-200 hover:border-[#b8df7d] hover:bg-[#eef5e7] hover:text-[#315d32] hover:shadow-md"
            >
              <Bell className="h-[17px] w-[17px] transition-transform duration-200 group-hover:scale-110" />

              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full border border-white bg-emerald-500"
              />
            </motion.button>

            <div className="hidden h-8 w-px bg-[#e5ece7] sm:block" />

            <motion.div
              whileHover={{
                y: -1,
              }}
              className="hidden items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1 transition-all duration-200 hover:border-[#e5eee8] hover:bg-[#f8fbf9] sm:flex"
            >
              <div className="relative shrink-0">
                <motion.div
                  whileHover={{
                    scale: 1.07,
                    rotate: 3,
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#315d32] text-[10px] font-black text-white shadow-[0_6px_15px_rgba(49,93,50,0.16)]"
                >
                  {initials}
                </motion.div>

                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                />
              </div>

              <div className="hidden min-w-0 xl:block">
                <p className="max-w-[125px] truncate text-[10px] font-black text-[#202a20]">
                  {staffName}
                </p>

                <p className="mt-0.5 max-w-[125px] truncate text-[8px] font-medium text-[#92998e]">
                  {staffEmail}
                </p>
              </div>

              <ChevronDown className="hidden h-3.5 w-3.5 text-[#92998e] xl:block" />
            </motion.div>
          </div>

          <div className="px-4 pb-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#92998e]" />

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search orders, products..."
                  className="h-10 w-full rounded-xl border border-[#dfe8e1] bg-[#f8faf8] pl-10 pr-3 text-[11px] font-medium text-[#202a20] outline-none transition-all duration-200 placeholder:text-[#92998e] focus:border-[#315d32] focus:bg-white focus:ring-4 focus:ring-[#315d32]/5"
                />
              </div>

              <div className="flex h-10 shrink-0 items-center rounded-xl border border-[#dceacb] bg-gradient-to-r from-[#eef5e7] to-[#f5faf6] px-3 shadow-sm">
                <motion.span
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                />

                <span className="ml-1.5 text-[9px] font-black text-[#315d32]">
                  Online
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}