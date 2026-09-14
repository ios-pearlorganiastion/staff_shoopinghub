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
} from "lucide-react";
import { Card, StatCard } from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const stats = [
  { title: "Total revenue", value: "₹2,84,650", change: "+12.8%", icon: CircleDollarSign, description: "vs last month", tone: "brand" },
  { title: "Total orders", value: "1,284", change: "+8.4%", icon: ShoppingBag, description: "vs last month", tone: "sky" },
  { title: "Active orders", value: "86", change: "+5.2%", icon: Truck, description: "currently processing", tone: "violet" },
  { title: "Out of stock", value: "24", change: "-6.1%", icon: Package, description: "items need attention", tone: "amber" },
];

const orders = [
  { id: "#CD-10482", customer: "Rahul Sharma", items: "5 Items", amount: "₹1,240", status: "Completed", time: "10 min ago" },
  { id: "#CD-10481", customer: "Priya Mehta", items: "3 Items", amount: "₹685", status: "Ready", time: "24 min ago" },
  { id: "#CD-10480", customer: "Amit Kapoor", items: "8 Items", amount: "₹2,150", status: "Packed", time: "42 min ago" },
  { id: "#CD-10479", customer: "Sneha Joshi", items: "4 Items", amount: "₹920", status: "Pending", time: "1 hr ago" },
  { id: "#CD-10478", customer: "Vikas Rawat", items: "6 Items", amount: "₹1,560", status: "Completed", time: "1 hr ago" },
];

const products = [
  { name: "Tata Salt", category: "Staples", sold: 284, revenue: "₹8,520" },
  { name: "Aashirvaad Atta", category: "Flour & Grains", sold: 218, revenue: "₹12,430" },
  { name: "Amul Milk", category: "Dairy", sold: 196, revenue: "₹10,780" },
  { name: "Fortune Sunflower Oil", category: "Cooking Oil", sold: 164, revenue: "₹14,760" },
];

const lowStock = [
  { name: "Amul Butter", stock: 4, unit: "packs" },
  { name: "Maggi 2-Minute Noodles", stock: 7, unit: "packs" },
  { name: "Tata Tea Gold", stock: 9, unit: "packs" },
  { name: "Kissan Tomato Ketchup", stock: 12, unit: "bottles" },
];

const salesData = [
  42, 55, 48, 68, 62, 74, 69, 81, 76, 88, 79, 94, 87, 102, 96, 110, 105, 118,
  112, 126, 119, 132, 125, 140, 134, 148, 143, 156, 150, 168,
];

const STATUS_CONFIG = {
  Completed: { icon: CheckCircle2, tone: "brand" },
  Ready: { icon: Truck, tone: "teal" },
  Packed: { icon: Package, tone: "violet" },
  Pending: { icon: Clock3, tone: "amber" },
  Cancelled: { icon: XCircle, tone: "rose" },
};

export default function Dashboard() {
  const maxValue = Math.max(...salesData);

  return (
    <div className="space-y-6 pb-8">
      {/* Heading */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Store overview
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Good morning, Admin 👋
          </h2>
          <p className="text-sm text-ink-soft mt-1.5">Here's what's happening with your store today.</p>
        </div>

        <button className="self-start lg:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-line bg-card text-xs font-bold text-ink-soft hover:border-brand-500 hover:text-brand-700 transition">
          <CalendarDays className="w-4 h-4" />
          September 2026
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-ink-soft">{stat.title}</p>
                <h3 className="text-2xl font-extrabold text-ink mt-2 tracking-tight">{stat.value}</h3>
              </div>

              <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-brand-700" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Badge tone={stat.change.startsWith("-") ? "rose" : "brand"}>{stat.change}</Badge>
              <span className="text-[10px] text-ink-faint">{stat.description}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart + order status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-ink">Sales overview</h3>
                <Badge tone="brand">+18.4%</Badge>
              </div>
              <p className="text-xs text-ink-faint mt-1">Revenue performance for the last 30 days</p>
            </div>

            <button className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-paper text-[10px] font-bold text-ink-soft hover:bg-brand-50 hover:text-brand-700 transition">
              Last 30 days
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-end gap-2 mb-6">
              <span className="text-3xl font-extrabold text-ink">₹2,84,650</span>
              <span className="text-xs text-brand-600 font-bold mb-1 inline-flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                18.4%
              </span>
            </div>

            <div className="h-[220px] flex">
              <div className="w-10 flex flex-col justify-between pb-7 text-[9px] text-ink-faint">
                <span>₹15k</span>
                <span>₹10k</span>
                <span>₹5k</span>
                <span>₹0</span>
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-0 flex flex-col justify-between pb-7">
                  {[1, 2, 3, 4].map((line) => (
                    <div key={line} className="border-t border-dashed border-line" />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-end gap-[3px] sm:gap-1.5 pb-7 px-1">
                  {salesData.map((value, index) => (
                    <div key={index} className="group/bar relative flex-1 h-full flex items-end">
                      <div
                        style={{ height: `${(value / maxValue) * 170}px` }}
                        className={`w-full rounded-t-[4px] transition-all duration-300 ${
                          index === salesData.length - 1 ? "bg-brand-600" : "bg-brand-100 hover:bg-brand-200"
                        }`}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-ink text-white text-[9px] font-bold opacity-0 group-hover/bar:opacity-100 transition whitespace-nowrap z-10">
                        ₹{value * 100}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-ink-faint">
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

        <Card>
          <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-ink">Order status</h3>
              <p className="text-xs text-ink-faint mt-1">Today's order distribution</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-brand-700" />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-[16px] border-brand-100" />
              <div className="absolute inset-0 rounded-full border-[16px] border-brand-600" style={{ clipPath: "polygon(0 0, 100% 0, 100% 68%, 0 68%)" }} />
              <div className="absolute inset-0 rounded-full border-[16px] border-teal-600" style={{ clipPath: "polygon(0 68%, 100% 68%, 100% 84%, 0 84%)" }} />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-ink">86</span>
                <span className="text-[10px] font-semibold text-ink-faint">Active orders</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {[
                ["Completed", 48, "bg-brand-600"],
                ["Processing", 22, "bg-teal-600"],
                ["Pending", 10, "bg-amber-500"],
                ["Cancelled", 6, "bg-line"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-semibold text-ink-soft">{label}</span>
                  </div>
                  <span className="text-xs font-extrabold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-line">
            <div>
              <h3 className="text-base font-extrabold text-ink">Recent orders</h3>
              <p className="text-xs text-ink-faint mt-1">Latest customer orders</p>
            </div>
            <button className="text-xs font-bold text-brand-700 hover:text-brand-800">View all</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-paper/70">
                  {["Order", "Customer", "Amount", "Status", "Time"].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-[9px] font-bold uppercase tracking-wide text-ink-faint ${i === 4 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

                  return (
                    <tr key={order.id} className="border-t border-line/70 hover:bg-paper/50 transition">
                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-ink">{order.id}</span>
                        <p className="text-[10px] text-ink-faint mt-0.5">{order.items}</p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <MiniAvatar name={order.customer} />
                          <span className="text-xs font-bold text-ink">{order.customer}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-ink">{order.amount}</span>
                      </td>

                      <td className="px-5 py-4">
                        <Badge tone={config.tone} icon={config.icon}>{order.status}</Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-[10px] text-ink-faint font-medium">{order.time}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-line">
            <div>
              <h3 className="text-base font-extrabold text-ink">Top products</h3>
              <p className="text-xs text-ink-faint mt-1">Best selling products</p>
            </div>
            <button className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center text-ink-faint">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            {products.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-paper/70 transition">
                <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-ink-faint" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-ink truncate">{product.name}</p>
                  <p className="text-[10px] text-ink-faint mt-0.5">{product.category} · {product.sold} sold</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-ink">{product.revenue}</p>
                  <span className="text-[9px] text-brand-600 font-bold">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <button className="w-full h-10 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition">
              View all products
            </button>
          </div>
        </Card>
      </div>

      {/* Low stock + performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-line">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-ink">Low stock alert</h3>
                <p className="text-xs text-ink-faint mt-1">Products that need restocking</p>
              </div>
            </div>

            <Badge tone="rose">{lowStock.length} critical</Badge>
          </div>

          <div className="p-4">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center gap-3 px-2 py-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-rose-500" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-ink">{item.name}</p>
                  <div className="mt-1.5 w-full max-w-[180px] h-1.5 rounded-full bg-line overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(item.stock * 5, 100)}%` }} />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-rose-500">{item.stock}</p>
                  <p className="text-[9px] text-ink-faint">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-brand-800 rounded-xl shadow-float p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-brand-100">Store performance</p>
                <h3 className="text-2xl font-extrabold mt-2">Excellent work!</h3>
                <p className="text-xs text-brand-50/90 mt-2 max-w-[320px] leading-relaxed">
                  Your store performance is above average this month. Keep up the great work.
                </p>
              </div>

              <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-7">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-lg font-extrabold">94%</p>
                <p className="text-[9px] text-brand-100 mt-1">Order success</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-lg font-extrabold">4.8</p>
                <p className="text-[9px] text-brand-100 mt-1">Customer rating</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-lg font-extrabold">98%</p>
                <p className="text-[9px] text-brand-100 mt-1">Stock accuracy</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-20 w-56 h-56 rounded-full border border-white/10" />
          <div className="absolute right-8 -bottom-28 w-48 h-48 rounded-full border border-white/10" />
        </div>
      </div>
    </div>
  );
}

function MiniAvatar({ name }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">
      {initials}
    </div>
  );
}