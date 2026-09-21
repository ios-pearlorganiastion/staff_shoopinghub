import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { getSession, clearSession } from "../../utils/auth";

export default function AppLayout() {
  const navigate = useNavigate();
  const session = getSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const staffName = session?.staff?.name || "Staff";
  const staffEmail = session?.staff?.email || "";
  const firstName = staffName?.split(" ")[0] || "Staff";

  const initials =
    staffName
      ?.split(" ")
      .map((word) => word?.[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-ink">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        storeName="CD Shopping Hub"
        staffName={staffName}
        staffEmail={staffEmail}
        onLogout={handleLogout}
      />

      <div className="min-h-screen lg:ml-[250px]">
        <header className="sticky top-0 z-30 border-b border-[#e3ebe5] bg-white/95 shadow-[0_2px_18px_rgba(18,77,42,0.035)] backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-7">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-ink-soft shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md lg:hidden"
            >
              <Menu className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-105" />
            </button>

            <div className="hidden min-w-0 md:block">
              <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-brand-600">
                <Sparkles className="h-3 w-3" />
                Seller Dashboard
              </p>

              <h1 className="mt-0.5 truncate text-sm font-extrabold tracking-tight text-ink lg:text-[15px]">
                Welcome back, {firstName}
              </h1>
            </div>

            <div className="relative ml-auto hidden w-full max-w-[370px] lg:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-ink-faint" />

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search anything..."
                className="h-10 w-full rounded-xl border border-[#dfe8e1] bg-[#f8faf8] pl-10 pr-4 text-[11px] font-medium text-ink outline-none transition-all duration-200 placeholder:text-ink-faint hover:border-[#cfded3] focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/5"
              />
            </div>

            <button
              aria-label="Search"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-ink-soft shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md md:hidden"
            >
              <Search className="h-[17px] w-[17px] transition-transform duration-200 group-hover:scale-105" />
            </button>

            <button
              aria-label="Notifications"
              className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe9e2] bg-white text-ink-soft shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
            >
              <Bell className="h-[17px] w-[17px] transition-transform duration-200 group-hover:scale-110" />

              <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full border border-white bg-brand-600 shadow-[0_0_0_3px_rgba(27,115,64,0.08)]" />
            </button>

            <div className="hidden h-8 w-px bg-[#e5ece7] sm:block" />

            <div className="hidden items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1 transition-all duration-200 hover:border-[#e5eee8] hover:bg-[#f8fbf9] sm:flex">
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 text-[10px] font-extrabold text-white shadow-sm shadow-brand-700/15">
                  {initials}
                </div>

                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="hidden min-w-0 xl:block">
                <p className="max-w-[125px] truncate text-[10px] font-extrabold text-ink">
                  {staffName}
                </p>

                <p className="mt-0.5 max-w-[125px] truncate text-[8px] font-medium text-ink-faint">
                  {staffEmail}
                </p>
              </div>

              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-faint transition-transform duration-200 xl:block" />
            </div>
          </div>

          <div className="px-4 pb-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint" />

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anything..."
                  className="h-10 w-full rounded-xl border border-[#dfe8e1] bg-[#f8faf8] pl-10 pr-3 text-[11px] font-medium text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/5"
                />
              </div>

              <div className="flex h-10 shrink-0 items-center rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-[#f5faf6] px-3 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />

                <span className="ml-1.5 text-[9px] font-extrabold text-brand-700">
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