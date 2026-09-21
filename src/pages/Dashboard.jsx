
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  MoreHorizontal,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Clock3,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Boxes,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const dashboardData = {
  stats: [
    {
      title: "Total Revenue",
      value: "₹2,84,650",
      change: "+12.8%",
      description: "vs last month",
      icon: CircleDollarSign,
      tone: "brand",
    },
    {
      title: "Total Orders",
      value: "1,284",
      change: "+8.4%",
      description: "vs last month",
      icon: ShoppingBag,
      tone: "brand",
    },
    {
      title: "Active Orders",
      value: "86",
      change: "+5.2%",
      description: "currently processing",
      icon: Truck,
      tone: "brand",
    },
    {
      title: "Out of Stock",
      value: "24",
      change: "-6.1%",
      description: "items need attention",
      icon: Package,
      tone: "brand",
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
    79, 94, 87, 102, 96, 110, 105, 118, 112,
    126, 119, 132, 125, 140, 134, 148, 143,
    156, 150, 168,
  ],

  orderStatus: [
    {
      label: "Completed",
      value: 48,
      color: "bg-brand-600",
    },
    {
      label: "Processing",
      value: 22,
      color: "bg-brand-400",
    },
    {
      label: "Pending",
      value: 10,
      color: "bg-amber-500",
    },
    {
      label: "Cancelled",
      value: 6,
      color: "bg-slate-300",
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
    tone: "brand",
  },
  Ready: {
    icon: Truck,
    tone: "brand",
  },
  Packed: {
    icon: Package,
    tone: "brand",
  },
  Pending: {
    icon: Clock3,
    tone: "amber",
  },
  Cancelled: {
    icon: XCircle,
    tone: "rose",
  },
};

const statIconStyles = {
  brand: "bg-brand-50 text-brand-700",
};

export default function Dashboard() {
  const [period, setPeriod] = useState("Last 30 days");
  const [month] = useState("September 2026");
  const [refreshing, setRefreshing] = useState(false);

  const maxValue = Math.max(...dashboardData.sales);

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="w-full min-w-0 space-y-5 overflow-hidden pb-8 sm:space-y-6 lg:space-y-7">
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-5 py-6 text-white shadow-lg shadow-brand-600/10 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]">
                Store overview
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Good morning, Admin
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Monitor your store performance, orders and inventory from one
              place.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <button
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-brand-700/70 px-4 text-xs font-bold text-white shadow-sm backdrop-blur transition hover:bg-brand-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-brand-700 shadow-md transition hover:bg-brand-50">
              <CalendarDays className="h-4 w-4" />
              {month}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <HeaderMetric
            icon={CircleDollarSign}
            label="Revenue"
            value="₹2.84L"
          />
          <HeaderMetric
            icon={ShoppingBag}
            label="Orders"
            value="1,284"
          />
          <HeaderMetric
            icon={Truck}
            label="Active"
            value="86"
          />
          <HeaderMetric
            icon={Users}
            label="Customers"
            value="642"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.stats.map((stat) => {
          const Icon = stat.icon;
          const positive = !stat.change.startsWith("-");

          return (
            <Card
              key={stat.title}
              className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {stat.title}
                  </p>

                  <h3 className="mt-2 truncate text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${statIconStyles[stat.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${
                    positive
                      ? "bg-brand-50 text-brand-700"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </span>

                <span className="truncate text-[10px] text-ink-faint">
                  {stat.description}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden rounded-[22px] border border-slate-200 xl:col-span-2">
          <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  Sales overview
                </h3>

                <Badge tone="brand">+18.4%</Badge>
              </div>

              <p className="mt-1 text-xs text-ink-faint">
                Revenue performance for the last 30 days
              </p>
            </div>

            <button
              onClick={() =>
                setPeriod(
                  period === "Last 30 days"
                    ? "Last 7 days"
                    : "Last 30 days"
                )
              }
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-brand-50 px-3 text-[10px] font-bold text-brand-700 transition hover:bg-brand-100 sm:w-auto"
            >
              {period}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                  Revenue
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                    ₹2,84,650
                  </span>

                  <span className="inline-flex items-center text-xs font-bold text-brand-600">
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                    18.4%
                  </span>
                </div>
              </div>

              <span className="hidden text-[10px] font-semibold text-ink-faint sm:block">
                Aug 08 — Sep 06
              </span>
            </div>

            <div className="mt-6 flex h-[210px] min-w-0 sm:h-[240px]">
              <div className="flex w-9 shrink-0 flex-col justify-between pb-7 text-[8px] text-ink-faint sm:w-11 sm:text-[9px]">
                <span>₹15k</span>
                <span>₹10k</span>
                <span>₹5k</span>
                <span>₹0</span>
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="absolute inset-0 flex flex-col justify-between pb-7">
                  {[1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-line"
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-end gap-[2px] px-1 pb-7 sm:gap-1">
                  {dashboardData.sales.map((value, index) => (
                    <div
                      key={index}
                      className="group/bar relative flex h-full min-w-0 flex-1 items-end"
                    >
                      <div
                        style={{
                          height: `${(value / maxValue) * 175}px`,
                        }}
                        className={`w-full rounded-t-[4px] transition-all duration-300 ${
                          index === dashboardData.sales.length - 1
                            ? "bg-brand-600"
                            : "bg-brand-100 hover:bg-brand-300"
                        }`}
                      />

                      <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-700 px-2 py-1 text-[8px] font-bold text-white opacity-0 shadow-lg transition group-hover/bar:opacity-100">
                        ₹{value * 100}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-ink-faint sm:text-[9px]">
                  <span>Aug 08</span>
                  <span>Aug 15</span>
                  <span>Aug 22</span>
                  <span>Aug 29</span>
                  <span>Sep 06</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Order status
              </h3>
              <p className="mt-1 text-xs text-ink-faint">
                Today's order distribution
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <OrderStatusChart />

            <div className="mt-6 space-y-3">
              {dashboardData.orderStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    />
                    <span className="text-xs font-semibold text-ink-soft">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-ink">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden rounded-[22px] border border-slate-200 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Recent orders
              </h3>

              <p className="mt-1 text-xs text-ink-faint">
                Latest customer orders
              </p>
            </div>

            <button className="rounded-lg px-2 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-50">
              View all
            </button>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="bg-brand-50/50">
                  {["Order", "Customer", "Amount", "Status", "Time"].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-ink-faint ${
                          index === 4 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {dashboardData.orders.map((order) => {
                  const config =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-line/70 transition hover:bg-brand-50/30"
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-ink">
                          {order.id}
                        </span>
                        <p className="mt-0.5 text-[10px] text-ink-faint">
                          {order.items}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <MiniAvatar name={order.customer} />
                          <span className="text-xs font-bold text-ink">
                            {order.customer}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-ink">
                          {order.amount}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Badge tone={config.tone} icon={config.icon}>
                          {order.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-[10px] font-medium text-ink-faint">
                          {order.time}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-line/70 md:hidden">
            {dashboardData.orders.map((order) => {
              const config =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

              return (
                <div
                  key={order.id}
                  className="p-4 transition hover:bg-brand-50/30 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <MiniAvatar name={order.customer} />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-ink">
                          {order.customer}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-faint">
                          {order.id}
                        </p>
                      </div>
                    </div>

                    <Badge tone={config.tone} icon={config.icon}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-brand-50/60 p-3">
                    <div>
                      <p className="text-[8px] font-bold uppercase text-ink-faint">
                        Items
                      </p>
                      <p className="mt-1 text-xs font-bold text-ink">
                        {order.items}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-bold uppercase text-ink-faint">
                        Amount
                      </p>
                      <p className="mt-1 text-xs font-extrabold text-ink">
                        {order.amount}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase text-ink-faint">
                        Time
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink-soft">
                        {order.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                Top products
              </h3>

              <p className="mt-1 text-xs text-ink-faint">
                Best selling products
              </p>
            </div>

            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-brand-50 hover:text-brand-700">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 sm:p-4">
            {dashboardData.products.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-brand-50/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
                  <Boxes className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-ink">
                    {product.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                    {product.category} · {product.sold} sold
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-extrabold text-ink">
                    {product.revenue}
                  </p>

                  <span className="text-[9px] font-bold text-brand-600">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            <button className="h-10 w-full rounded-xl bg-brand-50 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
              View all products
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-ink">
                  Low stock alert
                </h3>

                <p className="mt-1 text-xs text-ink-faint">
                  Products that need restocking
                </p>
              </div>
            </div>

            <Badge tone="rose">
              {dashboardData.lowStock.length} critical
            </Badge>
          </div>

          <div className="p-3 sm:p-4">
            {dashboardData.lowStock.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-brand-50/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Package className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">
                    {item.name}
                  </p>

                  <div className="mt-2 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-brand-50">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${Math.min(item.stock * 5, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-extrabold text-brand-600">
                    {item.stock}
                  </p>
                  <p className="text-[9px] text-ink-faint">
                    {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-5 text-white shadow-lg shadow-brand-600/10 sm:p-6">
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                  Store performance
                </p>

                <h3 className="mt-2 text-2xl font-extrabold">
                  Excellent work!
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-white/75">
                  Your store performance is performing consistently this
                  month. Keep monitoring orders and inventory.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-brand-700/70">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {dashboardData.performance.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-brand-700/60 p-3 backdrop-blur-sm"
                >
                  <p className="text-lg font-extrabold">{item.value}</p>
                  <p className="mt-1 text-[9px] text-white/65">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-700/60 p-3 transition hover:bg-brand-700/80 sm:p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-white/70" />
        <p className="text-[9px] font-semibold uppercase tracking-wide text-white/65">
          {label}
        </p>
      </div>

      <p className="mt-1 text-base font-extrabold sm:text-lg">{value}</p>
    </div>
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
    <div className="flex items-center justify-center">
      <div className="relative h-36 w-36 sm:h-40 sm:w-40">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />

          {dashboardData.orderStatus.map((item) => {
            const length = (item.value / total) * circumference;
            const currentOffset = offset;
            offset += length;

            const strokeColor =
              item.label === "Completed"
                ? "#1b7340"
                : item.label === "Processing"
                ? "#69a86f"
                : item.label === "Pending"
                ? "#f59e0b"
                : "#cbd5e1";

            return (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-currentOffset}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-ink">86</span>
          <span className="text-[9px] font-semibold text-ink-faint">
            Active orders
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-[10px] font-extrabold text-brand-700">
      {initials}
    </div>
  );
}

