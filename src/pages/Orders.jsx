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
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

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
  PENDING_PAYMENT: "bg-[#f7f2df] text-[#a07824]",
  CONFIRMED: "bg-[#edf4e7] text-[#527e45]",
  PACKED: "bg-[#f1f5e9] text-[#527e45]",
  READY: "bg-[#eef5e7] text-[#315d32]",
  COMPLETED: "bg-[#eef5e7] text-[#315d32]",
  CANCELLED: "bg-[#f8ecea] text-[#b35a54]",
};

const STATUS_ICON = {
  PENDING_PAYMENT: Clock3,
  CONFIRMED: CheckCircle2,
  PACKED: Package,
  READY: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

const pageVariants = {
  hidden: { opacity: 0 },
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

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status] || Clock3;

  return (
    <motion.span
      whileHover={{
        scale: 1.05,
        y: -1,
      }}
      className={`inline-flex max-w-full min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[7px] font-black sm:min-h-7 sm:gap-1.5 sm:px-2.5 sm:text-[9px] ${STATUS_STYLE[status]}`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
      <span className="truncate">{STATUS_LABEL[status]}</span>
    </motion.span>
  );
}

function OrderDetailsModal({ order, onClose, onAction }) {
  const items = [
    { name: "Organic Rice", qty: 2, price: 500 },
    { name: "Premium Atta", qty: 1, price: 299 },
    { name: "Cooking Oil", qty: 1, price: 500 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#202a20]/45 p-2 backdrop-blur-sm sm:p-5"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="flex max-h-[96vh] w-full max-w-[540px] flex-col overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_25px_80px_rgba(49,93,50,0.2)] sm:max-h-[90vh] sm:rounded-[26px]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#315d32] px-3.5 py-4 text-white sm:px-6 sm:py-6">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b8df7d]/20 blur-2xl"
          />

          <motion.div
            animate={{
              x: [0, 15, 0],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">
                Order details
              </p>

              <h3 className="mt-1 truncate text-lg font-black tracking-tight sm:text-2xl">
                {order.number}
              </h3>

              <p className="mt-1 text-[9px] text-white/70 sm:text-xs">
                {order.date}
              </p>
            </div>

            <motion.button
              whileHover={{
                scale: 1.08,
                rotate: 5,
              }}
              whileTap={{
                scale: 0.92,
              }}
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 sm:h-9 sm:w-9"
            >
              <X size={17} />
            </motion.button>
          </div>

          <div className="relative mt-3 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur sm:mt-4 sm:p-3">
            <div className="min-w-0">
              <p className="text-[8px] text-white/55 sm:text-[9px]">
                Customer
              </p>

              <p className="mt-0.5 truncate text-[11px] font-bold sm:text-sm">
                {order.customer}
              </p>
            </div>

            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-2.5 sm:p-3">
              <Package size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                Items
              </p>

              <p className="mt-1 text-base font-black text-[#202a20]">
                {order.items}
              </p>
            </div>

            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-2.5 sm:p-3">
              <CreditCard size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                Payment
              </p>

              <p className="mt-1 text-base font-black text-[#202a20]">
                {order.payment}
              </p>
            </div>
          </div>

          <div className="mt-2.5 rounded-xl border border-[#dceacb] bg-[#eef5e7] p-3 sm:mt-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-[#315d32]">
                  Total amount
                </p>

                <p className="mt-1 text-lg font-black text-[#202a20] sm:text-2xl">
                  ₹{order.amount.toLocaleString()}
                </p>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#315d32] shadow-sm sm:h-10 sm:w-10">
                <CreditCard size={16} />
              </div>
            </div>
          </div>

          <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-3">
            <div className="flex gap-2 rounded-xl border border-[#dceacb] p-2.5 sm:p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5e7] text-[#315d32]">
                <Phone size={14} />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                  Phone
                </p>

                <p className="mt-0.5 break-all text-[11px] font-semibold text-[#202a20] sm:text-sm">
                  {order.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-2 rounded-xl border border-[#dceacb] p-2.5 sm:p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5e7] text-[#315d32]">
                <MapPin size={14} />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                  Delivery address
                </p>

                <p className="mt-0.5 text-[11px] font-semibold leading-5 text-[#202a20] sm:text-sm">
                  {order.address}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2.5 rounded-xl border border-[#edf1e9] bg-[#f7f8f2] p-2.5 sm:mt-3 sm:p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                  Order items
                </p>

                <p className="mt-0.5 text-[11px] font-black text-[#202a20]">
                  {items.length} products
                </p>
              </div>

              <Package className="h-4 w-4 text-[#315d32]" />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold text-[#202a20]">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-[8px] text-[#92998e]">
                      Qty: {item.qty}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] font-black text-[#315d32]">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#edf1e9] bg-white p-2.5 sm:px-5 sm:py-3.5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <motion.button
              whileTap={{
                scale: 0.97,
              }}
              onClick={onClose}
              className="h-10 w-full rounded-xl border border-[#dceacb] px-5 text-xs font-bold text-[#667065] transition hover:bg-[#f7f8f2] sm:w-auto"
            >
              Close
            </motion.button>

            {!["COMPLETED", "CANCELLED"].includes(order.status) && (
              <motion.button
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() => onAction("Order updated successfully")}
                className="h-10 w-full rounded-xl bg-[#315d32] px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] transition hover:bg-[#274d29] sm:w-auto"
              >
                Update Order
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Orders() {
  const [filter, setFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const orders = filter
    ? ordersData.filter((order) => order.status === filter)
    : ordersData;

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      showToast("Orders refreshed");
    }, 800);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="box-border w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7f8f2] pb-5 sm:pb-8"
    >
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-3 px-2 sm:space-y-5 sm:px-3 md:px-4 lg:space-y-6 lg:px-5">
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            className="fixed right-2.5 top-2.5 z-[120] max-w-[calc(100vw-20px)] rounded-xl bg-[#315d32] px-3.5 py-2.5 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(49,93,50,0.22)] sm:right-6 sm:top-6 sm:text-sm"
          >
            {toast}
          </motion.div>
        )}

        <motion.section
          variants={itemVariants}
          className="group relative overflow-hidden rounded-[18px] bg-[#315d32] px-3 py-4 text-white shadow-[0_20px_60px_rgba(49,93,50,0.18)] sm:rounded-[28px] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
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

          <div className="relative">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotate: 4,
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl"
                >
                  <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6" />
                </motion.div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                    <motion.span
                      animate={{
                        scale: [1, 1.35, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2"
                    />

                    <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                      Order management
                    </span>
                  </div>

                  <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                    Orders
                  </h1>

                  <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                    Track, manage and fulfill customer orders from one
                    beautiful workspace.
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{
                  scale: 0.96,
                }}
                onClick={handleRefresh}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh Orders
              </motion.button>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
              Order status
            </p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3">
            {STATUSES.map(([value, label]) => {
              const active = filter === value;

              return (
                <motion.button
                  key={value}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() => setFilter(value)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[8px] font-bold transition-all sm:px-3.5 sm:text-xs ${
                    active
                      ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                      : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#b8df7d] hover:bg-[#eef5e7] hover:text-[#315d32]"
                  }`}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.div
          variants={itemVariants}
          className="flex items-end justify-between px-0.5 sm:px-1"
        >
          <div>
            <h3 className="text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
              {filter
                ? STATUSES.find(([value]) => value === filter)?.[1]
                : "All Orders"}
            </h3>

            <p className="mt-0.5 text-[9px] text-[#92998e] sm:text-xs">
              Showing {orders.length}{" "}
              {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] font-bold text-[#315d32] sm:flex sm:text-xs">
            <CheckCircle2 size={15} />
            Updated
          </div>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-10 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <ShoppingBag size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              No orders found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#92998e] sm:text-sm sm:leading-6">
              There are no orders matching the selected status.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            className="grid w-full min-w-0 grid-cols-1 gap-2 sm:gap-3"
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.99,
                }}
                onClick={() => setSelectedOrder(order)}
                className="group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-[16px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px]"
              >
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#315d32] opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
                  <div className="flex w-full min-w-0 flex-col">
                    <div className="flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
                      <motion.div
                        whileHover={{
                          rotate: 5,
                          scale: 1.08,
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] transition-all duration-300 group-hover:bg-[#315d32] group-hover:text-white sm:h-11 sm:w-11"
                      >
                        <ShoppingBag size={16} />
                      </motion.div>

                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <h4 className="min-w-0 flex-1 truncate text-[11px] font-black text-[#202a20] sm:text-sm">
                            #{order.number}
                          </h4>

                          <span className="shrink-0 rounded-md bg-[#f7f8f2] px-1.5 py-1 text-[7px] font-bold uppercase tracking-wider text-[#667065] sm:px-2 sm:text-[8px]">
                            {order.payment}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[11px] font-bold text-[#202a20] sm:text-sm">
                          {order.customer}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#92998e] sm:text-xs">
                          {order.items}{" "}
                          {order.items === 1 ? "item" : "items"}
                          <span className="mx-1.5 text-[#dceacb]">
                            •
                          </span>
                          {order.date}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-2 border-t border-[#edf1e9] pt-2.5 sm:mt-4 sm:pt-3 lg:hidden">
                      <div className="min-w-0">
                        <p className="text-[7px] font-bold uppercase tracking-widest text-[#92998e] sm:text-[9px]">
                          Amount
                        </p>

                        <p className="mt-0.5 text-sm font-black text-[#202a20] sm:text-lg">
                          ₹{order.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="min-w-0 max-w-[55%]">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    <div className="mt-2.5 grid w-full min-w-0 grid-cols-1 gap-1.5 border-t border-[#edf1e9] pt-2.5 sm:mt-3 sm:gap-2 sm:pt-3 lg:hidden">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin
                          size={12}
                          className="shrink-0 text-[#315d32]"
                        />

                        <span className="min-w-0 truncate text-[9px] text-[#92998e] sm:text-xs">
                          {order.address}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone
                          size={12}
                          className="shrink-0 text-[#315d32]"
                        />

                        <span className="truncate text-[9px] text-[#92998e] sm:text-xs">
                          {order.phone}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:flex lg:w-full lg:items-center lg:gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="mt-4 flex items-center justify-between gap-5 border-t border-[#edf1e9] pt-3">
                          <div className="flex min-w-0 items-center gap-2 text-xs text-[#92998e]">
                            <MapPin
                              size={13}
                              className="shrink-0 text-[#315d32]"
                            />

                            <span className="truncate">
                              {order.address}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#92998e]">
                            <Phone
                              size={13}
                              className="text-[#315d32]"
                            />
                            {order.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#92998e]">
                            Amount
                          </p>

                          <p className="mt-0.5 text-lg font-black text-[#202a20]">
                            ₹{order.amount.toLocaleString()}
                          </p>
                        </div>

                        <StatusBadge status={order.status} />

                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            x: 2,
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f8f2] text-[#92998e] transition-all group-hover:bg-[#eef5e7] group-hover:text-[#315d32]"
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end sm:hidden">
                      <span className="flex items-center gap-1 text-[8px] font-bold text-[#315d32]">
                        View details
                        <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onAction={(message) => {
              setSelectedOrder(null);
              showToast(message);
            }}
          />
        )}
      </div>
    </motion.div>
  );
}