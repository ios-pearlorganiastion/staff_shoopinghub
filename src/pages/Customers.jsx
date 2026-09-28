import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShoppingBag,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  ChevronRight,
  X,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const CUSTOMERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    orders: 24,
    spent: 8420,
    status: "Active",
    joined: "12 Aug 2026",
    address: "Rajpur Road, Dehradun",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya.verma@gmail.com",
    phone: "+91 98765 12345",
    orders: 18,
    spent: 6240,
    status: "Active",
    joined: "08 Aug 2026",
    address: "Ballupur, Dehradun",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@gmail.com",
    phone: "+91 91234 56789",
    orders: 9,
    spent: 3180,
    status: "Inactive",
    joined: "02 Aug 2026",
    address: "Sahastradhara Road, Dehradun",
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha.singh@gmail.com",
    phone: "+91 99887 66554",
    orders: 31,
    spent: 12560,
    status: "Active",
    joined: "28 Jul 2026",
    address: "Clement Town, Dehradun",
  },
  {
    id: 5,
    name: "Vikas Rawat",
    email: "vikas.rawat@gmail.com",
    phone: "+91 97654 32109",
    orders: 7,
    spent: 2450,
    status: "Active",
    joined: "21 Jul 2026",
    address: "Patel Nagar, Dehradun",
  },
  {
    id: 6,
    name: "Anjali Gupta",
    email: "anjali.gupta@gmail.com",
    phone: "+91 98989 11223",
    orders: 14,
    spent: 5190,
    status: "Inactive",
    joined: "15 Jul 2026",
    address: "Vasant Vihar, Dehradun",
  },
  {
    id: 7,
    name: "Rohit Negi",
    email: "rohit.negi@gmail.com",
    phone: "+91 90123 45678",
    orders: 22,
    spent: 7860,
    status: "Active",
    joined: "10 Jul 2026",
    address: "Prem Nagar, Dehradun",
  },
];

const FILTERS = [
  ["", "All"],
  ["Active", "Active"],
  ["Inactive", "Inactive"],
];

const STATUS_STYLE = {
  Active: "bg-[#eef5e7] text-[#315d32]",
  Inactive: "bg-[#f8ecea] text-[#b35a54]",
};

const STATUS_ICON = {
  Active: UserCheck,
  Inactive: UserX,
};

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const initialsOf = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatINR = (value) => `₹${value.toLocaleString("en-IN")}`;

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status] || UserCheck;

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      className={`inline-flex max-w-full min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-black sm:min-h-7 sm:gap-1.5 sm:px-2.5 sm:text-[9px] ${STATUS_STYLE[status]}`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
      <span className="truncate">{status}</span>
    </motion.span>
  );
}

function Avatar({ name, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-sm rounded-2xl sm:h-14 sm:w-14"
      : "h-9 w-9 text-[11px] rounded-xl sm:h-11 sm:w-11 sm:text-xs";

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[#eef5e7] font-black text-[#315d32] transition-all duration-300 ${sizeClass}`}
    >
      {initialsOf(name)}
    </div>
  );
}

function StatCard({ label, value, description, icon: Icon, danger = false }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[16px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px] sm:p-4 lg:p-5"
    >
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#315d32] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-bold uppercase tracking-wider text-[#92998e] sm:text-[9px]">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-black tracking-tight text-[#202a20] sm:text-2xl lg:text-[28px]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-11 sm:w-11 ${
            danger
              ? "bg-[#f8ecea] text-[#b35a54] group-hover:bg-[#b35a54] group-hover:text-white"
              : "bg-[#eef5e7] text-[#315d32] group-hover:bg-[#315d32] group-hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      <p className="mt-2 truncate text-[9px] text-[#92998e] sm:mt-3 sm:text-xs">
        {description}
      </p>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-2 rounded-xl border border-[#dceacb] p-2.5 sm:p-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5e7] text-[#315d32]">
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[11px] font-semibold leading-5 text-[#202a20] sm:text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}

function CustomerDetailsModal({ customer, onClose, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#202a20]/45 p-2 backdrop-blur-sm sm:p-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[96vh] w-full max-w-[540px] flex-col overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_25px_80px_rgba(49,93,50,0.2)] sm:max-h-[90vh] sm:rounded-[26px]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#315d32] px-3.5 py-4 text-white sm:px-6 sm:py-6">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b8df7d]/20 blur-2xl"
          />

          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">
                Customer details
              </p>

              <h3 className="mt-1 truncate text-lg font-black tracking-tight sm:text-2xl">
                {customer.name}
              </h3>

              <p className="mt-1 text-[9px] text-white/70 sm:text-xs">
                Customer #{String(customer.id).padStart(4, "0")}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 sm:h-9 sm:w-9"
            >
              <X size={17} />
            </motion.button>
          </div>

          <div className="relative mt-3 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur sm:mt-4 sm:p-3">
            <div className="min-w-0">
              <p className="text-[8px] text-white/55 sm:text-[9px]">Email</p>

              <p className="mt-0.5 truncate text-[11px] font-bold sm:text-sm">
                {customer.email}
              </p>
            </div>

            <StatusBadge status={customer.status} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-2.5 sm:p-3">
              <ShoppingBag size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                Total orders
              </p>

              <p className="mt-1 text-base font-black text-[#202a20]">
                {customer.orders}
              </p>
            </div>

            <div className="rounded-xl border border-[#dceacb] bg-[#eef5e7] p-2.5 sm:p-3">
              <ArrowUpRight size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#315d32]">
                Total spent
              </p>

              <p className="mt-1 text-base font-black text-[#202a20]">
                {formatINR(customer.spent)}
              </p>
            </div>
          </div>

          <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-3">
            <InfoRow icon={Mail} label="Email" value={customer.email} />
            <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            <InfoRow
              icon={CalendarDays}
              label="Joined"
              value={customer.joined}
            />
            <InfoRow icon={MapPin} label="Address" value={customer.address} />
          </div>
        </div>

        <div className="shrink-0 border-t border-[#edf1e9] bg-white p-2.5 sm:px-5 sm:py-3.5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="h-10 w-full rounded-xl border border-[#dceacb] px-5 text-xs font-bold text-[#667065] transition hover:bg-[#f7f8f2] sm:w-auto"
            >
              Close
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction("Customer details saved")}
              className="h-10 w-full rounded-xl bg-[#315d32] px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] transition hover:bg-[#274d29] sm:w-auto"
            >
              Save Customer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return CUSTOMERS.filter((customer) => {
      const matchesStatus = filter ? customer.status === filter : true;

      const matchesSearch = value
        ? customer.name.toLowerCase().includes(value) ||
          customer.email.toLowerCase().includes(value) ||
          customer.phone.includes(value)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [search, filter]);

  const totalCustomers = CUSTOMERS.length;
  const activeCustomers = CUSTOMERS.filter((c) => c.status === "Active").length;
  const inactiveCustomers = CUSTOMERS.filter(
    (c) => c.status === "Inactive"
  ).length;
  const totalOrders = CUSTOMERS.reduce((sum, c) => sum + c.orders, 0);

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
      showToast("Customers refreshed");
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
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed right-2.5 top-2.5 z-[120] max-w-[calc(100vw-20px)] rounded-xl bg-[#315d32] px-3.5 py-2.5 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(49,93,50,0.22)] sm:right-6 sm:top-6 sm:text-sm"
          >
            {toast}
          </motion.div>
        )}

        {/* Hero */}
        <motion.section
          variants={itemVariants}
          className="group relative overflow-hidden rounded-[18px] bg-[#315d32] px-3 py-4 text-white shadow-[0_20px_60px_rgba(49,93,50,0.18)] sm:rounded-[28px] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#b8df7d]/20 blur-2xl"
          />

          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-28 left-[28%] h-64 w-64 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl"
                >
                  <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                </motion.div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2"
                    />

                    <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                      Customer management
                    </span>
                  </div>

                  <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                    Customers
                  </h1>

                  <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                    Manage customer profiles, activity, orders and spending
                    from one beautiful workspace.
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleRefresh}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh Customers
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.div
          variants={pageVariants}
          className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
        >
          <StatCard
            label="Total customers"
            value={totalCustomers}
            icon={Users}
            description="All registered customers"
          />

          <StatCard
            label="Active customers"
            value={activeCustomers}
            icon={UserCheck}
            description="Currently active"
          />

          <StatCard
            label="Inactive customers"
            value={inactiveCustomers}
            icon={UserX}
            description="Needs attention"
            danger
          />

          <StatCard
            label="Total orders"
            value={totalOrders}
            icon={ShoppingBag}
            description="Orders from customers"
          />
        </motion.div>

        {/* Search + filters */}
        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
              Customer directory
            </p>

            <div className="flex w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white lg:w-[340px]">
              <Search className="h-4 w-4 shrink-0 text-[#92998e]" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or phone..."
                className="h-10 w-full min-w-0 bg-transparent px-2 text-[11px] text-[#202a20] outline-none placeholder:text-[#92998e] sm:text-xs"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="shrink-0 text-[#92998e] transition hover:text-[#315d32]"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3">
            {FILTERS.map(([value, label]) => {
              const active = filter === value;

              return (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.96 }}
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

        {/* List heading */}
        <motion.div
          variants={itemVariants}
          className="flex items-end justify-between px-0.5 sm:px-1"
        >
          <div>
            <h3 className="text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
              {filter ? `${filter} Customers` : "All Customers"}
            </h3>

            <p className="mt-0.5 text-[9px] text-[#92998e] sm:text-xs">
              Showing {filteredCustomers.length} of {totalCustomers}{" "}
              {totalCustomers === 1 ? "customer" : "customers"}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] font-bold text-[#315d32] sm:flex sm:text-xs">
            <CheckCircle2 size={15} />
            Updated
          </div>
        </motion.div>

        {/* List */}
        {filteredCustomers.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-10 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <Users size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              No customers found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#92998e] sm:text-sm sm:leading-6">
              Try searching with another name, email or phone number.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            className="grid w-full min-w-0 grid-cols-1 gap-2 sm:gap-3"
          >
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedCustomer(customer)}
                className="group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-[16px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px]"
              >
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#315d32] opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
                  <div className="flex w-full min-w-0 flex-col">
                    <div className="flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
                      <div className="transition-all duration-300 [&>div]:group-hover:bg-[#315d32] [&>div]:group-hover:text-white">
                        <Avatar name={customer.name} />
                      </div>

                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <h4 className="min-w-0 flex-1 truncate text-[11px] font-black text-[#202a20] sm:text-sm">
                            {customer.name}
                          </h4>

                          <span className="shrink-0 rounded-md bg-[#f7f8f2] px-1.5 py-1 text-[7px] font-bold uppercase tracking-wider text-[#667065] sm:px-2 sm:text-[8px]">
                            #{String(customer.id).padStart(4, "0")}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[10px] font-semibold text-[#667065] sm:text-xs">
                          {customer.email}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#92998e] sm:text-xs">
                          {customer.orders}{" "}
                          {customer.orders === 1 ? "order" : "orders"}
                          <span className="mx-1.5 text-[#dceacb]">•</span>
                          Joined {customer.joined}
                        </p>
                      </div>
                    </div>

                    {/* Mobile / tablet */}
                    <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-2 border-t border-[#edf1e9] pt-2.5 sm:mt-4 sm:pt-3 lg:hidden">
                      <div className="min-w-0">
                        <p className="text-[7px] font-bold uppercase tracking-widest text-[#92998e] sm:text-[9px]">
                          Total spent
                        </p>

                        <p className="mt-0.5 text-sm font-black text-[#202a20] sm:text-lg">
                          {formatINR(customer.spent)}
                        </p>
                      </div>

                      <div className="min-w-0 max-w-[55%]">
                        <StatusBadge status={customer.status} />
                      </div>
                    </div>

                    <div className="mt-2.5 grid w-full min-w-0 grid-cols-1 gap-1.5 border-t border-[#edf1e9] pt-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-2 sm:pt-3 lg:hidden">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin size={12} className="shrink-0 text-[#315d32]" />

                        <span className="min-w-0 truncate text-[9px] text-[#92998e] sm:text-xs">
                          {customer.address}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone size={12} className="shrink-0 text-[#315d32]" />

                        <span className="truncate text-[9px] text-[#92998e] sm:text-xs">
                          {customer.phone}
                        </span>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden lg:flex lg:w-full lg:items-center lg:gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="mt-4 flex items-center justify-between gap-5 border-t border-[#edf1e9] pt-3">
                          <div className="flex min-w-0 items-center gap-2 text-xs text-[#92998e]">
                            <MapPin
                              size={13}
                              className="shrink-0 text-[#315d32]"
                            />

                            <span className="truncate">{customer.address}</span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#92998e]">
                            <Phone size={13} className="text-[#315d32]" />
                            {customer.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#92998e]">
                            Total spent
                          </p>

                          <p className="mt-0.5 text-lg font-black text-[#202a20]">
                            {formatINR(customer.spent)}
                          </p>
                        </div>

                        <StatusBadge status={customer.status} />

                        <motion.div
                          whileHover={{ scale: 1.08, x: 2 }}
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

        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onAction={(message) => {
              setSelectedCustomer(null);
              showToast(message);
            }}
          />
        )}
      </div>
    </motion.div>
  );
}