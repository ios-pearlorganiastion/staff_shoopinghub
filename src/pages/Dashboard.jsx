
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  HandCoins,
  MoreHorizontal,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { getAffiliateStats } from "../api/affiliateApis";

const dashboardData = {
  stats: [
    {
      title: "Total Revenue",
      value: "₹2,84,650",
      change: "+12.8%",
      description: "vs last month",
      icon: CircleDollarSign,
    },
    {
      title: "Total Orders",
      value: "1,284",
      change: "+8.4%",
      description: "vs last month",
      icon: ShoppingBag,
    },
    {
      title: "Active Orders",
      value: "86",
      change: "+5.2%",
      description: "currently processing",
      icon: Truck,
    },
    {
      title: "Out of Stock",
      value: "24",
      change: "-6.1%",
      description: "items need attention",
      icon: Package,
    },
  ],

  orders: [
    {
      id: "#CD-10482",
      customer: "Rahul Sharma",
      items: "5 Items",
      amount: "₹1,240",
      status: "Completed",
      time: "10 min ago",
    },
    {
      id: "#CD-10481",
      customer: "Priya Mehta",
      items: "3 Items",
      amount: "₹685",
      status: "Ready",
      time: "24 min ago",
    },
    {
      id: "#CD-10480",
      customer: "Amit Kapoor",
      items: "8 Items",
      amount: "₹2,150",
      status: "Packed",
      time: "42 min ago",
    },
    {
      id: "#CD-10479",
      customer: "Sneha Joshi",
      items: "4 Items",
      amount: "₹920",
      status: "Pending",
      time: "1 hr ago",
    },
    {
      id: "#CD-10478",
      customer: "Vikas Rawat",
      items: "6 Items",
      amount: "₹1,560",
      status: "Completed",
      time: "1 hr ago",
    },
  ],

  products: [
    {
      name: "Tata Salt",
      category: "Staples",
      sold: 284,
      revenue: "₹8,520",
    },
    {
      name: "Aashirvaad Atta",
      category: "Flour & Grains",
      sold: 218,
      revenue: "₹12,430",
    },
    {
      name: "Amul Milk",
      category: "Dairy",
      sold: 196,
      revenue: "₹10,780",
    },
    {
      name: "Fortune Sunflower Oil",
      category: "Cooking Oil",
      sold: 164,
      revenue: "₹14,760",
    },
  ],

  lowStock: [
    {
      name: "Amul Butter",
      stock: 4,
      unit: "packs",
    },
    {
      name: "Maggi 2-Minute Noodles",
      stock: 7,
      unit: "packs",
    },
    {
      name: "Tata Tea Gold",
      stock: 9,
      unit: "packs",
    },
    {
      name: "Kissan Tomato Ketchup",
      stock: 12,
      unit: "bottles",
    },
  ],

  sales: [
    42, 55, 48, 68, 62, 74, 69, 81, 76, 88,
    79, 94, 87, 102, 96, 110, 105, 118, 112, 126,
    119, 132, 125, 140, 134, 148, 143, 156, 150, 168,
  ],

  orderStatus: [
    {
      label: "Completed",
      value: 48,
      color: "#315d32",
    },
    {
      label: "Processing",
      value: 22,
      color: "#6f9f52",
    },
    {
      label: "Pending",
      value: 10,
      color: "#b8df7d",
    },
    {
      label: "Cancelled",
      value: 6,
      color: "#d7ddd1",
    },
  ],

  performance: [
    {
      value: "94%",
      label: "Order success",
    },
    {
      value: "4.8",
      label: "Customer rating",
    },
    {
      value: "98%",
      label: "Stock accuracy",
    },
  ],
};

const STATUS_CONFIG = {
  Completed: {
    icon: CheckCircle2,
    className: "bg-[#eef5e7] text-[#315d32]",
  },
  Ready: {
    icon: Truck,
    className: "bg-[#edf4e7] text-[#527e45]",
  },
  Packed: {
    icon: Package,
    className: "bg-[#f1f5e9] text-[#527e45]",
  },
  Pending: {
    icon: Clock3,
    className: "bg-[#f7f2df] text-[#a07824]",
  },
  Cancelled: {
    icon: XCircle,
    className: "bg-[#f7eceb] text-[#b35a54]",
  },
};

const pageVariants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const cardHover = {
  y: -5,
  scale: 1.012,
  transition: {
    duration: 0.22,
    ease: "easeOut",
  },
};

export default function Dashboard() {
  const [period, setPeriod] = useState("Last 30 days");
  const [month] = useState("September 2026");
  const [refreshing, setRefreshing] = useState(false);
  const [affiliateStats, setAffiliateStats] = useState(null);

  const maxValue = Math.max(...dashboardData.sales);

  useEffect(() => {
    let mounted = true;

    const loadAffiliateStats = async () => {
      try {
        const response = await getAffiliateStats();
        const data = response?.data ?? response;

        if (mounted) {
          setAffiliateStats(data?.summary ?? data?.stats ?? data ?? null);
        }
      } catch (error) {
        if (mounted) {
          setAffiliateStats(null);
        }
      }
    };

    loadAffiliateStats();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="box-border w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7f8f2] pb-6 sm:pb-8"
    >
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-3.5 px-2.5 sm:space-y-5 sm:px-3 md:px-4 lg:space-y-6 lg:px-5">
        <motion.section
          variants={itemVariants}
          whileHover={{
            y: -2,
            transition: {
              duration: 0.25,
            },
          }}
          className="group relative overflow-hidden rounded-[22px] bg-[#315d32] px-3.5 py-5 text-white shadow-[0_20px_60px_rgba(49,93,50,0.18)] sm:rounded-[28px] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.18, 0.28, 0.18],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#b8df7d]/20 blur-2xl"
          />

          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-28 left-[28%] h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -12, 0],
              y: [0, 8, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[20%] top-1/2 h-32 w-32 rounded-full bg-[#b8df7d]/10 blur-2xl"
          />

          <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <motion.span
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className="h-2 w-2 rounded-full bg-[#b8df7d]"
                />

                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[10px]">
                  Store overview
                </span>
              </div>

              <motion.h1
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.55,
                  delay: 0.1,
                }}
                className="text-[22px] font-black tracking-tight sm:text-3xl lg:text-[34px]"
              >
                Good morning, Admin
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
                className="mt-1.5 max-w-xl text-[10px] leading-5 text-white/70 sm:mt-2 sm:text-sm"
              >
                Monitor your store performance, orders and inventory from one
                beautiful workspace.
              </motion.p>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.25,
              }}
              className="grid w-full grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex sm:w-auto"
            >
              <motion.button
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={handleRefresh}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-[10px] font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/15 hover:shadow-lg sm:text-xs"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[10px] font-bold text-[#315d32] shadow-lg transition-all duration-300 hover:bg-[#f7f8f2] hover:shadow-xl sm:text-xs"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="truncate">{month}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          variants={pageVariants}
          className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4"
        >
          {dashboardData.stats.map((stat, index) => {
            const Icon = stat.icon;
            const positive = !stat.change.startsWith("-");

            return (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={cardHover}
                whileTap={{ scale: 0.985 }}
                className="group min-w-0"
              >
                <Card className="relative h-full overflow-hidden rounded-[18px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.14)] sm:rounded-[22px] sm:p-5">
                  <motion.div
                    initial={{
                      x: "-120%",
                      opacity: 0,
                    }}
                    whileHover={{
                      x: "120%",
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 skew-x-[-18deg] bg-white/50 blur-xl"
                  />

                  <div className="relative z-20">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[7px] font-bold uppercase tracking-[0.1em] text-[#8a9287] min-[390px]:text-[8px] sm:text-[10px]">
                          {stat.title}
                        </p>

                        <motion.h3
                          initial={{
                            opacity: 0,
                            y: 5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.1 + 0.2,
                            duration: 0.35,
                          }}
                          className="mt-1.5 whitespace-nowrap text-[17px] font-black tracking-tight text-[#202a20] min-[390px]:text-lg sm:mt-2 sm:text-[27px]"
                        >
                          {stat.value}
                        </motion.h3>
                      </div>

                      <motion.div
                        whileHover={{
                          rotate: [0, -6, 6, 0],
                          scale: 1.12,
                        }}
                        whileTap={{
                          scale: 0.92,
                        }}
                        transition={{
                          duration: 0.4,
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] shadow-sm transition-all duration-300 group-hover:shadow-[0_6px_18px_rgba(49,93,50,0.16)] sm:h-11 sm:w-11 sm:rounded-2xl"
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </motion.div>
                    </div>

                    <div className="mt-2.5 flex min-w-0 items-center gap-1.5 sm:mt-5 sm:gap-2">
                      <span
                        className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[7px] font-black min-[390px]:px-2 min-[390px]:text-[8px] sm:text-[9px] ${
                          positive
                            ? "bg-[#eef5e7] text-[#315d32]"
                            : "bg-[#f8ecea] text-[#b35a54]"
                        }`}
                      >
                        {positive ? (
                          <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        )}

                        {stat.change}
                      </span>

                      <span className="min-w-0 truncate text-[7px] text-[#92998e] min-[390px]:text-[8px] sm:text-[10px]">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#eef5e7] blur-3xl" />

            <div className="relative flex flex-col gap-4 p-3.5 sm:p-5 lg:p-6">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <motion.div
                    whileHover={{
                      rotate: 8,
                      scale: 1.08,
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] shadow-sm sm:h-11 sm:w-11"
                  >
                    <HandCoins className="h-5 w-5" />
                  </motion.div>

                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
                      Affiliate programme
                    </p>

                    <h3 className="mt-1 truncate text-[15px] font-black tracking-tight text-[#202a20] sm:text-lg">
                      Affiliate overview
                    </h3>
                  </div>
                </div>

                <a
                  href="/affiliates"
                  className="shrink-0 rounded-lg bg-[#eef5e7] px-3 py-2 text-[8px] font-black text-[#315d32] transition-all duration-200 hover:bg-[#dceacb] hover:shadow-md sm:text-[9px]"
                >
                  View programme
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <AffiliateMetric
                  label="Pending"
                  value={getAffiliateValue(
                    affiliateStats,
                    [
                      "pendingApplications",
                      "pending_applications",
                      "pending",
                      "applicationsPending",
                    ],
                    0
                  )}
                />

                <AffiliateMetric
                  label="Approved"
                  value={getAffiliateValue(
                    affiliateStats,
                    [
                      "approvedAffiliates",
                      "approved_affiliates",
                      "approved",
                      "activeAffiliates",
                    ],
                    0
                  )}
                />

                <AffiliateMetric
                  label="Payouts"
                  value={getAffiliateValue(
                    affiliateStats,
                    [
                      "payoutsAwaiting",
                      "payouts_awaiting",
                      "pendingPayouts",
                      "pending_payouts",
                      "awaitingPayouts",
                    ],
                    0
                  )}
                />

                <AffiliateMetric
                  label="Revenue 30d"
                  value={formatAffiliateCurrency(
                    getAffiliateValue(
                      affiliateStats,
                      [
                        "attributedRevenue30d",
                        "attributed_revenue_30d",
                        "attributedRevenue",
                        "revenue30d",
                        "revenue_30d",
                      ],
                      0
                    )
                  )}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-5 xl:grid-cols-3">
          <motion.div
            variants={itemVariants}
            className="group min-w-0 xl:col-span-2"
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
          >
            <Card className="relative overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
              <div className="flex flex-col gap-3.5 border-b border-[#edf1e9] p-3.5 sm:p-5 md:flex-row md:items-center md:justify-between lg:p-6">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-[14px] font-black tracking-tight text-[#202a20] sm:text-lg">
                      Sales overview
                    </h3>

                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.5,
                      }}
                      className="shrink-0 rounded-full bg-[#eef5e7] px-2 py-1 text-[7px] font-black text-[#315d32] sm:text-[9px]"
                    >
                      +18.4%
                    </motion.span>
                  </div>

                  <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                    Revenue performance for the last 30 days
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    setPeriod(
                      period === "Last 30 days"
                        ? "Last 7 days"
                        : "Last 30 days"
                    )
                  }
                  className="flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-[#f1f5e9] px-3 text-[9px] font-bold text-[#315d32] transition-all duration-300 hover:bg-[#e6efd9] hover:shadow-md sm:w-auto sm:text-[10px]"
                >
                  {period}
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.button>
              </div>

              <div className="p-3.5 sm:p-5 lg:p-6">
                <div className="flex min-w-0 items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#92998e] sm:text-[9px]">
                      Revenue
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 sm:gap-2">
                      <span className="truncate text-[21px] font-black tracking-tight text-[#202a20] min-[390px]:text-2xl sm:text-3xl">
                        ₹2,84,650
                      </span>

                      <span className="flex shrink-0 items-center text-[9px] font-black text-[#315d32] sm:text-xs">
                        <TrendingUp className="mr-0.5 h-3 w-3 sm:mr-1 sm:h-3.5 sm:w-3.5" />
                        18.4%
                      </span>
                    </div>
                  </div>

                  <span className="hidden shrink-0 text-[8px] font-semibold text-[#92998e] min-[390px]:block sm:text-[9px]">
                    Aug 08 — Sep 06
                  </span>
                </div>

                <div className="mt-4 flex h-[185px] min-w-0 sm:mt-6 sm:h-[210px]">
                  <div className="flex w-7 shrink-0 flex-col justify-between pb-6 text-[7px] text-[#a0a69d] sm:w-12 sm:pb-7 sm:text-[9px]">
                    <span>₹15k</span>
                    <span>₹10k</span>
                    <span>₹5k</span>
                    <span>₹0</span>
                  </div>

                  <div className="relative min-w-0 flex-1 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-6 sm:pb-7">
                      {[1, 2, 3, 4].map((line) => (
                        <div
                          key={line}
                          className="border-t border-dashed border-[#e4eadf]"
                        />
                      ))}
                    </div>

                    <div className="absolute inset-0 flex items-end gap-[2px] px-0.5 pb-6 min-[390px]:gap-[3px] sm:gap-1 sm:pb-7">
                      {dashboardData.sales.map((value, index) => (
                        <div
                          key={index}
                          className="group/bar relative flex h-full min-w-0 flex-1 items-end"
                        >
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: `${(value / maxValue) * 100}%`,
                              opacity: 1,
                            }}
                            transition={{
                              duration: 0.65,
                              delay: index * 0.025,
                              ease: "easeOut",
                            }}
                            whileHover={{
                              scaleY: 1.04,
                            }}
                            className={`w-full origin-bottom rounded-t-[3px] transition-colors sm:rounded-t-[5px] ${
                              index === dashboardData.sales.length - 1
                                ? "bg-[#315d32]"
                                : "bg-[#dceacb] group-hover/bar:bg-[#b8df7d]"
                            }`}
                          />

                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#315d32] px-2 py-1 text-[8px] font-bold text-white shadow-lg group-hover/bar:block">
                            ₹{value * 100}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[6px] text-[#a0a69d] min-[390px]:text-[7px] sm:text-[8px]">
                      <span>Aug 08</span>
                      <span className="hidden min-[360px]:block">
                        Aug 15
                      </span>
                      <span className="hidden min-[390px]:block">
                        Aug 22
                      </span>
                      <span className="hidden min-[360px]:block">
                        Aug 29
                      </span>
                      <span>Sep 06</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group min-w-0"
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
          >
            <Card className="h-full overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
              <div className="flex items-center justify-between border-b border-[#edf1e9] p-3.5 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-black tracking-tight text-[#202a20] sm:text-[15px]">
                    Order status
                  </h3>

                  <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                    Today&apos;s order distribution
                  </p>
                </div>

                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.08,
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] shadow-sm transition-shadow group-hover:shadow-md sm:h-10 sm:w-10"
                >
                  <ShoppingBag className="h-4 w-4" />
                </motion.div>
              </div>

              <div className="p-3.5 sm:p-5">
                <OrderStatusChart />

                <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:block sm:space-y-3">
                  {dashboardData.orderStatus.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.3 + index * 0.08,
                      }}
                      whileHover={{
                        x: 4,
                        scale: 1.01,
                      }}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#f7f8f2] px-2.5 py-2 transition-all duration-200 sm:bg-transparent sm:px-0 sm:py-0"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="truncate text-[9px] font-semibold text-[#667065] sm:text-xs">
                          {item.label}
                        </span>
                      </div>

                      <span className="shrink-0 text-[10px] font-black text-[#202a20] sm:text-xs">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-5 xl:grid-cols-3">
          <motion.div
            variants={itemVariants}
            className="group min-w-0 xl:col-span-2"
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
          >
            <Card className="overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#edf1e9] p-3.5 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-black tracking-tight text-[#202a20] sm:text-[15px]">
                    Recent orders
                  </h3>

                  <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                    Latest customer orders
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.04,
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  className="shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold text-[#315d32] transition-all duration-200 hover:bg-[#eef5e7] sm:text-xs"
                >
                  View all
                </motion.button>
              </div>

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-[#f7f8f2]">
                      {[
                        "Order",
                        "Customer",
                        "Amount",
                        "Status",
                        "Time",
                      ].map((heading, index) => (
                        <th
                          key={heading}
                          className={`px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-[#92998e] ${
                            index === 4 ? "text-right" : ""
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {dashboardData.orders.map((order, index) => {
                      const config =
                        STATUS_CONFIG[order.status] ||
                        STATUS_CONFIG.Pending;

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{
                            opacity: 0,
                            y: 5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.05,
                          }}
                          whileHover={{
                            backgroundColor: "#f8faf4",
                          }}
                          className="border-t border-[#edf1e9] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <span className="text-xs font-black text-[#202a20]">
                              {order.id}
                            </span>

                            <p className="mt-0.5 text-[10px] text-[#92998e]">
                              {order.items}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <MiniAvatar name={order.customer} />

                              <span className="text-xs font-bold text-[#202a20]">
                                {order.customer}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-xs font-black text-[#202a20]">
                              {order.amount}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              icon={config.icon}
                              className={config.className}
                            >
                              {order.status}
                            </StatusBadge>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="text-[10px] font-medium text-[#92998e]">
                              {order.time}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#edf1e9] xl:hidden">
                {dashboardData.orders.map((order, index) => {
                  const config =
                    STATUS_CONFIG[order.status] ||
                    STATUS_CONFIG.Pending;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      whileHover={{
                        backgroundColor: "#f7f8f2",
                      }}
                      whileTap={{
                        scale: 0.99,
                      }}
                      className="group p-3.5 transition-all duration-200 sm:p-5"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <MiniAvatar name={order.customer} />

                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-black text-[#202a20] sm:text-xs">
                              {order.customer}
                            </p>

                            <p className="mt-0.5 truncate text-[8px] text-[#92998e] sm:text-[10px]">
                              {order.id}
                            </p>
                          </div>
                        </div>

                        <StatusBadge
                          icon={config.icon}
                          className={config.className}
                        >
                          {order.status}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f8f2] p-2.5 min-[390px]:grid-cols-3 sm:mt-4 sm:p-3">
                        <div className="min-w-0">
                          <p className="text-[7px] font-bold uppercase text-[#92998e] sm:text-[8px]">
                            Items
                          </p>

                          <p className="mt-1 truncate text-[10px] font-bold text-[#202a20] sm:text-xs">
                            {order.items}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[7px] font-bold uppercase text-[#92998e] sm:text-[8px]">
                            Amount
                          </p>

                          <p className="mt-1 truncate text-[10px] font-black text-[#202a20] sm:text-xs">
                            {order.amount}
                          </p>
                        </div>

                        <div className="min-w-0 text-right">
                          <p className="text-[7px] font-bold uppercase text-[#92998e] sm:text-[8px]">
                            Time
                          </p>

                          <p className="mt-1 truncate text-[10px] font-semibold text-[#667065] sm:text-xs">
                            {order.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group min-w-0"
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
          >
            <Card className="h-full overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
              <div className="flex items-center justify-between border-b border-[#edf1e9] p-3.5 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-black tracking-tight text-[#202a20] sm:text-[15px]">
                    Top products
                  </h3>

                  <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                    Best selling products
                  </p>
                </div>

                <motion.button
                  whileHover={{
                    rotate: 90,
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#92998e] transition-all hover:bg-[#eef5e7] hover:text-[#315d32]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="p-2.5 sm:p-4">
                {dashboardData.products.map((product, index) => (
                  <motion.div
                    key={product.name}
                    initial={{
                      opacity: 0,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    whileHover={{
                      x: 4,
                      y: -2,
                      scale: 1.01,
                      backgroundColor: "#f7f8f2",
                    }}
                    className="flex min-w-0 items-center gap-2.5 rounded-xl border border-transparent p-2.5 transition-all duration-300 hover:border-[#dceacb] hover:shadow-[0_8px_24px_rgba(49,93,50,0.08)] sm:gap-3 sm:p-3"
                  >
                    <motion.div
                      whileHover={{
                        rotate: 8,
                        scale: 1.08,
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10"
                    >
                      <Boxes className="h-4 w-4" />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-black text-[#202a20] sm:text-xs">
                        {product.name}
                      </p>

                      <p className="mt-0.5 truncate text-[8px] text-[#92998e] sm:text-[10px]">
                        {product.category} · {product.sold} sold
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-black text-[#202a20] sm:text-xs">
                        {product.revenue}
                      </p>

                      <span className="text-[8px] font-black text-[#527e45] sm:text-[9px]">
                        #{index + 1}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-3 pb-3 sm:px-5 sm:pb-5">
                <motion.button
                  whileHover={{
                    scale: 1.015,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="h-9 w-full rounded-xl bg-[#eef5e7] text-[10px] font-bold text-[#315d32] transition-all duration-300 hover:bg-[#dceacb] hover:shadow-md sm:h-10 sm:text-xs"
                >
                  View all products
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-5">
          <motion.div
            variants={itemVariants}
            className="group min-w-0"
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
          >
            <Card className="overflow-hidden rounded-[20px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 group-hover:border-[#b8df7d] group-hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[24px]">
              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-[#edf1e9] p-3.5 sm:p-5">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, -4, 4, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    whileHover={{
                      scale: 1.08,
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2df] text-[#a07824] sm:h-10 sm:w-10"
                  >
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>

                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-black tracking-tight text-[#202a20] sm:text-[15px]">
                      Low stock alert
                    </h3>

                    <p className="mt-1 truncate text-[8px] text-[#92998e] sm:text-xs">
                      Products that need restocking
                    </p>
                  </div>
                </div>

                <motion.span
                  whileHover={{
                    scale: 1.06,
                  }}
                  className="shrink-0 rounded-full bg-[#f8ecea] px-2 py-1 text-[7px] font-black text-[#b35a54] sm:px-2.5 sm:text-[9px]"
                >
                  {dashboardData.lowStock.length} critical
                </motion.span>
              </div>

              <div className="p-2.5 sm:p-4">
                {dashboardData.lowStock.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.07,
                    }}
                    whileHover={{
                      x: 4,
                      y: -1,
                      backgroundColor: "#f7f8f2",
                    }}
                    className="flex min-w-0 items-center gap-2.5 rounded-xl border border-transparent px-2 py-2.5 transition-all duration-300 hover:border-[#dceacb] hover:shadow-[0_8px_24px_rgba(49,93,50,0.06)] sm:gap-3 sm:py-3"
                  >
                    <motion.div
                      whileHover={{
                        rotate: -8,
                        scale: 1.08,
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] sm:h-9 sm:w-9"
                    >
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold text-[#202a20] sm:text-xs">
                        {item.name}
                      </p>

                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef5e7] sm:mt-2">
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${Math.min(
                              item.stock * 5,
                              100
                            )}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.1,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full bg-[#b8df7d]"
                        />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-black text-[#315d32] sm:text-xs">
                        {item.stock}
                      </p>

                      <p className="text-[8px] text-[#92998e] sm:text-[9px]">
                        {item.unit}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{
              y: -4,
              transition: {
                duration: 0.22,
              },
            }}
            className="group relative min-w-0 overflow-hidden rounded-[22px] bg-[#315d32] p-4 text-white shadow-[0_20px_50px_rgba(49,93,50,0.18)] sm:rounded-[28px] sm:p-6"
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#b8df7d]/20 blur-2xl"
            />

            <motion.div
              animate={{
                x: [0, 15, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
              className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative min-w-0">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/55 sm:text-[10px]">
                    Store performance
                  </p>

                  <h3 className="mt-1.5 text-xl font-black sm:mt-2 sm:text-2xl">
                    Excellent work!
                  </h3>

                  <p className="mt-1.5 max-w-md text-[9px] leading-5 text-white/70 sm:mt-2 sm:text-xs">
                    Your store performance is staying consistent this month.
                    Keep monitoring orders and inventory.
                  </p>
                </div>

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 3, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 8,
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 sm:h-11 sm:w-11"
                >
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 min-[390px]:grid-cols-3 sm:mt-6 sm:gap-2.5">
                {dashboardData.performance.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.25 + index * 0.1,
                    }}
                    whileHover={{
                      y: -5,
                      scale: 1.025,
                      backgroundColor: "rgba(255,255,255,0.16)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-md sm:p-3"
                  >
                    <p className="text-lg font-black sm:text-xl">
                      {item.value}
                    </p>

                    <p className="mt-0.5 truncate text-[8px] text-white/60 sm:mt-1 sm:text-[9px]">
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function AffiliateMetric({ label, value }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="rounded-xl border border-[#edf1e9] bg-[#f7f8f2] p-2.5 transition-all duration-200 hover:border-[#dceacb] sm:p-3"
    >
      <p className="truncate text-[7px] font-bold uppercase tracking-[0.08em] text-[#92998e] sm:text-[8px]">
        {label}
      </p>

      <p className="mt-1 truncate text-[13px] font-black text-[#202a20] sm:text-sm">
        {value}
      </p>
    </motion.div>
  );
}

function getAffiliateValue(source, keys, fallback = 0) {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return fallback;
}

function formatAffiliateCurrency(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function StatusBadge({ icon: Icon, className, children }) {
  return (
    <motion.span
      whileHover={{
        scale: 1.05,
        y: -1,
      }}
      className={`inline-flex min-h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[7px] font-black min-[390px]:gap-1.5 min-[390px]:px-2.5 min-[390px]:text-[8px] sm:min-h-7 sm:text-[9px] ${className}`}
    >
      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      {children}
    </motion.span>
  );
}

function OrderStatusChart() {
  const total = dashboardData.orderStatus.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const circumference = 2 * Math.PI * 54;
  let offset = 0;

  return (
    <motion.div
      initial={{
        scale: 0.85,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.025,
      }}
      className="flex items-center justify-center transition-transform duration-300"
    >
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#edf1e9"
            strokeWidth="12"
          />

          {dashboardData.orderStatus.map((item, index) => {
            const length = (item.value / total) * circumference;
            const currentOffset = offset;

            offset += length;

            return (
              <motion.circle
                key={item.label}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${length} ${
                  circumference - length
                }`}
                strokeDashoffset={-currentOffset}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.35,
              type: "spring",
              stiffness: 220,
            }}
            className="text-2xl font-black text-[#202a20] sm:text-3xl"
          >
            86
          </motion.span>

          <span className="text-[7px] font-semibold text-[#92998e] sm:text-[9px]">
            Active orders
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MiniAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.div
      whileHover={{
        scale: 1.1,
        rotate: 4,
      }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[9px] font-black text-[#315d32] transition-shadow duration-200 hover:shadow-[0_6px_15px_rgba(49,93,50,0.14)] sm:h-9 sm:w-9 sm:text-[10px]"
    >
      {initials}
    </motion.div>
  );
}

