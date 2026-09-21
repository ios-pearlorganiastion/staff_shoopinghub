
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tags,
  BookMarked,
  Settings,
  LogOut,
  X,
  Store,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Orders", icon: ShoppingCart, path: "/orders" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Categories", icon: Tags, path: "/categories" },
  { label: "Brands", icon: BookMarked, path: "/brand" },
  { label: "Customers", icon: Users, path: "/customers" },
];

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  storeName,
  staffName,
  staffEmail,
  onLogout,
}) {
  const closeOnMobile = () => setMobileOpen(false);

  const initials =
    staffName
      ?.split(" ")
      .map((word) => word?.[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={closeOnMobile}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-[100dvh] w-[250px]
          flex-col overflow-hidden border-r border-[#dce9df]
          bg-white shadow-[8px_0_30px_rgba(18,77,42,0.05)]
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="relative flex h-[72px] shrink-0 items-center border-b border-[#e7efe9] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-br from-brand-700 to-brand-500 shadow-md shadow-brand-700/15">
              <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/10" />

              <Store
                className="relative h-[19px] w-[19px] text-white"
                strokeWidth={2.2}
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-extrabold tracking-tight text-ink">
                {storeName}
              </h1>

              <div className="mt-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-brand-600" />

                <p className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-brand-600">
                  Seller Hub
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={closeOnMobile}
            aria-label="Close menu"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint transition hover:bg-brand-50 hover:text-brand-700 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-3 mt-4 rounded-[14px] border border-brand-100 bg-gradient-to-r from-brand-50 to-[#f5faf6] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
              <Store className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-wider text-brand-600">
                Store status
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />

                <span className="text-[9px] font-bold text-ink-soft">
                  Store is active
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-2 text-[8px] font-extrabold uppercase tracking-[0.18em] text-ink-faint">
            Main menu
          </p>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeOnMobile}
                  className={({ isActive }) => `
                    group relative flex min-h-[43px] items-center gap-3
                    overflow-hidden rounded-xl px-3
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-brand-700 text-white shadow-md shadow-brand-700/15"
                        : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-300" />
                      )}

                      <div
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-white/12 text-white"
                              : "bg-transparent text-ink-faint group-hover:bg-white group-hover:text-brand-700"
                          }
                        `}
                      >
                        <Icon
                          className="h-[17px] w-[17px]"
                          strokeWidth={isActive ? 2.3 : 2}
                        />
                      </div>

                      <span
                        className={`
                          flex-1 text-[12px] font-bold
                          ${isActive ? "text-white" : "text-inherit"}
                        `}
                      >
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-200" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#e7efe9] bg-[#fbfdfb] px-3 py-3">
          <NavLink
            to="/settings"
            onClick={closeOnMobile}
            className={({ isActive }) => `
              group flex min-h-[42px] items-center gap-3 rounded-xl
              px-3 transition-all duration-200
              ${
                isActive
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                    ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-ink-faint group-hover:text-brand-700"
                    }
                  `}
                >
                  <Settings className="h-[17px] w-[17px]" />
                </div>

                <span className="text-[12px] font-bold">Settings</span>
              </>
            )}
          </NavLink>

          <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-[#e5eee8] bg-white p-2">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 text-[10px] font-extrabold text-white shadow-sm">
                {initials}
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-extrabold text-ink">
                {staffName}
              </p>

              <p className="mt-0.5 truncate text-[8px] font-medium text-ink-faint">
                {staffEmail}
              </p>
            </div>

            <button
              onClick={onLogout}
              title="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-all hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

