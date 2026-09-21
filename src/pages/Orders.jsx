
import { useState } from "react";
import {
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  X,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const ordersData = [
  {
    id: 1,
    number: "CD-10021",
    customer: "Rahul Sharma",
    items: 3,
    amount: 1299,
    status: "PENDING_PAYMENT",
    date: "01 Sep 2026, 10:30 AM",
    phone: "+91 9876543210",
    address: "Rajpur Road, Dehradun, Uttarakhand",
    payment: "Online",
  },
  {
    id: 2,
    number: "CD-10020",
    customer: "Ankit Rawat",
    items: 2,
    amount: 849,
    status: "CONFIRMED",
    date: "01 Sep 2026, 09:45 AM",
    phone: "+91 9876543211",
    address: "Clock Tower, Dehradun, Uttarakhand",
    payment: "Online",
  },
  {
    id: 3,
    number: "CD-10019",
    customer: "Neha Singh",
    items: 4,
    amount: 2199,
    status: "PACKED",
    date: "31 Aug 2026, 06:20 PM",
    phone: "+91 9876543212",
    address: "Jakhan, Dehradun, Uttarakhand",
    payment: "COD",
  },
  {
    id: 4,
    number: "CD-10018",
    customer: "Amit Kumar",
    items: 1,
    amount: 499,
    status: "READY",
    date: "31 Aug 2026, 04:10 PM",
    phone: "+91 9876543213",
    address: "Vasant Vihar, Dehradun",
    payment: "Online",
  },
  {
    id: 5,
    number: "CD-10017",
    customer: "Priya Joshi",
    items: 5,
    amount: 2899,
    status: "COMPLETED",
    date: "30 Aug 2026, 02:15 PM",
    phone: "+91 9876543214",
    address: "Clement Town, Dehradun",
    payment: "Online",
  },
  {
    id: 6,
    number: "CD-10016",
    customer: "Vikas Negi",
    items: 2,
    amount: 799,
    status: "CANCELLED",
    date: "30 Aug 2026, 11:30 AM",
    phone: "+91 9876543215",
    address: "Prem Nagar, Dehradun",
    payment: "COD",
  },
];

const STATUSES = [
  ["", "All"],
  ["PENDING_PAYMENT", "Pending"],
  ["CONFIRMED", "Confirmed"],
  ["PACKED", "Packed"],
  ["READY", "Ready"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

const STATUS_LABEL = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_STYLE = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  PACKED: "bg-violet-50 text-violet-700 border-violet-200",
  READY: "bg-teal-50 text-teal-700 border-teal-200",
  COMPLETED: "bg-brand-50 text-brand-700 border-brand-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_DOT = {
  PENDING_PAYMENT: "bg-amber-500",
  CONFIRMED: "bg-sky-500",
  PACKED: "bg-violet-500",
  READY: "bg-teal-500",
  COMPLETED: "bg-brand-500",
  CANCELLED: "bg-rose-500",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-[11px] ${STATUS_STYLE[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

function OrderModal({ order, close, action }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="w-full max-h-[94vh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[28px]">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-5 pb-6 pt-5 text-white sm:px-7">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                Order details
              </p>
              <h3 className="mt-1 text-xl font-extrabold sm:text-2xl">
                {order.number}
              </h3>
              <p className="mt-1 text-xs text-white/75">
                {order.date}
              </p>
            </div>

            <button
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/10 p-3 backdrop-blur">
            <div>
              <p className="text-[10px] text-white/65">Customer</p>
              <p className="mt-0.5 font-bold">{order.customer}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Package size={18} className="text-brand-600" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Items
              </p>
              <p className="mt-1 text-xl font-extrabold text-ink">
                {order.items}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <CreditCard size={18} className="text-brand-600" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Payment
              </p>
              <p className="mt-1 text-xl font-extrabold text-ink">
                {order.payment}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  Total amount
                </p>
                <p className="mt-1 text-2xl font-extrabold text-ink">
                  ₹{order.amount.toLocaleString()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex gap-3 rounded-2xl border border-slate-100 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Phone size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Phone
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-ink">
                  {order.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-slate-100 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <MapPin size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Delivery address
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink">
                  {order.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            onClick={close}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            onClick={() => action("Order updated successfully")}
            className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Update Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [filter, setFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState("");

  const orders = filter
    ? ordersData.filter((order) => order.status === filter)
    : ordersData;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="w-full min-w-0 space-y-5 pb-8 sm:space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-xl sm:right-6 sm:top-6">
          {toast}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-5 py-6 text-white shadow-lg shadow-brand-600/10 sm:px-7 sm:py-7 lg:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur sm:h-14 sm:w-14">
              <ShoppingBag size={24} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
                Management
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Orders
              </h2>

              <p className="mt-1.5 max-w-md text-xs leading-5 text-white/75 sm:text-sm">
                Track, manage and fulfill customer orders from one place.
              </p>
            </div>
          </div>

          <button
            onClick={() => showToast("Orders refreshed")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-700 shadow-md transition hover:bg-white/90 md:w-auto"
          >
            <RefreshCw size={16} />
            Refresh Orders
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold text-white/60">
              Total
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {ordersData.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold text-white/60">
              Pending
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {ordersData.filter(
                (o) => o.status === "PENDING_PAYMENT"
              ).length}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold text-white/60">
              Active
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {
                ordersData.filter((o) =>
                  ["CONFIRMED", "PACKED", "READY"].includes(o.status)
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold text-white/60">
              Completed
            </p>
            <p className="mt-1 text-xl font-extrabold">
              {ordersData.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 px-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
            Order status
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUSES.map(([value, label]) => {
            const active = filter === value;

            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  active
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className="text-base font-extrabold text-ink sm:text-lg">
            {filter
              ? STATUSES.find(([value]) => value === filter)?.[1]
              : "All Orders"}
          </h3>

          <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
            Showing {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        <div className="hidden items-center gap-1.5 text-xs font-bold text-brand-700 sm:flex">
          <CheckCircle2 size={15} />
          Updated
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ShoppingBag size={27} />
          </div>

          <h3 className="mt-5 text-lg font-extrabold text-ink">
            No orders found
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink-soft">
            There are no orders matching the selected status.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-brand-600 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-all group-hover:bg-brand-600 group-hover:text-white sm:h-12 sm:w-12">
                      <ShoppingBag size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-ink sm:text-lg">
                          {order.number}
                        </h4>

                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {order.payment}
                        </span>
                      </div>

                      <p className="mt-1 font-semibold text-ink">
                        {order.customer}
                      </p>

                      <p className="mt-1 text-xs text-ink-soft sm:text-sm">
                        {order.items}{" "}
                        {order.items === 1 ? "item" : "items"}
                        <span className="mx-1.5 text-slate-300">•</span>
                        {order.date}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_auto_auto] sm:border-t-0 sm:pt-0 lg:min-w-[410px]">
                    <div className="sm:text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-ink-soft">
                        Amount
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-ink sm:text-xl">
                        ₹{order.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all group-hover:bg-brand-50 group-hover:text-brand-600 sm:flex">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 hidden border-t border-slate-100 pt-4 lg:block">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-ink-soft">
                      <MapPin size={14} className="shrink-0 text-brand-600" />
                      <span className="truncate">{order.address}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-soft">
                      <Phone size={14} className="text-brand-600" />
                      {order.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          close={() => setSelectedOrder(null)}
          action={(message) => {
            setSelectedOrder(null);
            showToast(message);
          }}
        />
      )}
    </div>
  );
}

