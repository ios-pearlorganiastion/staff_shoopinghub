import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  UsersRound,
  Tags,
  BookMarked,
  Settings,
  LogOut,
  X,
  Store,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Orders", icon: ShoppingCart, path: "/orders" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Categories", icon: Tags, path: "/categories" },
  { label: "Brands", icon: BookMarked, path: "/brand" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Staff", icon: UsersRound, path: "/staff" },
];

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.055,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#202a20]/40 backdrop-blur-sm lg:hidden"
            onClick={closeOnMobile}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial="hidden"
        animate="show"
        variants={sidebarVariants}
        className={`
          fixed left-0 top-0 z-50 flex h-[100dvh] w-[250px]
          flex-col overflow-hidden
          border-r border-[#dceacb]
          bg-[#fdfefd]
          shadow-[10px_0_40px_rgba(49,93,50,0.07)]
          transition-transform duration-300 ease-in-out
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <motion.div
          variants={itemVariants}
          className="relative flex h-[74px] shrink-0 items-center border-b border-[#edf1e9] px-4"
        >
          <motion.div
            animate={{
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#eef5e7] blur-2xl"
          />

          <div className="relative flex min-w-0 items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: 4,
              }}
              whileTap={{
                scale: 0.94,
              }}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#315d32] text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)]"
            >
              <motion.div
                animate={{
                  x: [0, 5, 0],
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-[#b8df7d]/20"
              />

              <Store
                className="relative h-[19px] w-[19px]"
                strokeWidth={2.2}
              />
            </motion.div>

            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-black tracking-tight text-[#202a20]">
                CD Shopping Hub
              </h1>

              <div className="mt-0.5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-[#315d32]" />

                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#315d32]">
                  Customer
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.08,
              rotate: 5,
            }}
            whileTap={{
              scale: 0.9,
            }}
            onClick={closeOnMobile}
            aria-label="Close menu"
            className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-[#92998e] transition hover:bg-[#eef5e7] hover:text-[#315d32] lg:hidden"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative mx-3 mt-4 overflow-hidden rounded-[15px] border border-[#dceacb] bg-[#eef5e7] px-3 py-2.5"
        >
          <motion.div
            animate={{
              x: [0, 20, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#b8df7d] blur-2xl"
          />

          <div className="relative flex items-center gap-2">
            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: 3,
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#315d32] shadow-sm"
            >
              <Store className="h-3.5 w-3.5" />
            </motion.div>

            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-wider text-[#315d32]">
                Store status
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <motion.span
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.65, 1, 0.65],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                />

                <span className="text-[9px] font-bold text-[#667065]">
                  Store is active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <motion.p
            variants={itemVariants}
            className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#92998e]"
          >
            Main menu
          </motion.p>

          <motion.div
            variants={sidebarVariants}
            className="space-y-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                >
                  <NavLink
                    to={item.path}
                    onClick={closeOnMobile}
                    className={({ isActive }) => `
                      group relative flex min-h-[44px] items-center gap-3
                      overflow-hidden rounded-xl px-3
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-[#315d32] text-white shadow-[0_8px_22px_rgba(49,93,50,0.18)]"
                          : "text-[#667065] hover:bg-[#eef5e7] hover:text-[#315d32]"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <>
                            <motion.span
                              layoutId="activeSidebarBar"
                              className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#b8df7d]"
                            />

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#b8df7d]/10 blur-xl"
                            />
                          </>
                        )}

                        <motion.div
                          whileHover={{
                            scale: 1.06,
                            rotate: isActive ? 2 : 3,
                          }}
                          className={`
                            relative flex h-8 w-8 shrink-0 items-center
                            justify-center rounded-lg transition-all duration-200
                            ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-[#92998e] group-hover:bg-white group-hover:text-[#315d32] group-hover:shadow-sm"
                            }
                          `}
                        >
                          <Icon
                            className="h-[17px] w-[17px]"
                            strokeWidth={isActive ? 2.3 : 2}
                          />
                        </motion.div>

                        <span
                          className={`
                            relative flex-1 text-[12px] font-bold
                            ${isActive ? "text-white" : "text-inherit"}
                          `}
                        >
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                              x: -5,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              x: 0,
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10"
                          >
                            <ChevronRight
                              className="h-3 w-3"
                              strokeWidth={2.5}
                            />
                          </motion.div>
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </motion.div>
        </nav>

        <motion.div
          variants={itemVariants}
          className="shrink-0 border-t border-[#edf1e9] bg-[#f7f8f2] px-3 py-3"
        >
          <NavLink
            to="/settings"
            onClick={closeOnMobile}
            className={({ isActive }) => `
              group relative flex min-h-[42px] items-center gap-3
              overflow-hidden rounded-xl px-3 transition-all duration-200
              ${
                isActive
                  ? "bg-[#315d32] text-white shadow-[0_7px_18px_rgba(49,93,50,0.16)]"
                  : "text-[#667065] hover:bg-[#eef5e7] hover:text-[#315d32]"
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="activeSettingsBar"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#b8df7d]"
                  />
                )}

                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                    transition-all
                    ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-[#92998e] group-hover:bg-white group-hover:text-[#315d32]"
                    }
                  `}
                >
                  <Settings className="h-[17px] w-[17px]" />
                </div>

                <span className="flex-1 text-[12px] font-bold">
                  Settings
                </span>

                {isActive && (
                  <ChevronRight
                    className="h-3.5 w-3.5"
                    strokeWidth={2.5}
                  />
                )}
              </>
            )}
          </NavLink>

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="mt-2 flex items-center gap-2.5 rounded-xl border border-[#dceacb] bg-white p-2 shadow-[0_5px_18px_rgba(49,93,50,0.04)]"
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

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-black text-[#202a20]">
                {staffName}
              </p>

              <p className="mt-0.5 truncate text-[8px] font-medium text-[#92998e]">
                {staffEmail}
              </p>
            </div>

            <motion.button
              whileHover={{
                scale: 1.08,
                rotate: -4,
              }}
              whileTap={{
                scale: 0.9,
              }}
              onClick={onLogout}
              title="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#92998e] transition-all hover:bg-[#f8ecea] hover:text-[#b35a54]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.aside>
    </>
  );
}
