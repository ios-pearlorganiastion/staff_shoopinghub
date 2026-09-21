
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShoppingBag,
  Eye,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Card, StatCard } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";

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

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return CUSTOMERS;

    return CUSTOMERS.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        customer.phone.includes(value)
    );
  }, [search]);

  const totalCustomers = CUSTOMERS.length;
  const activeCustomers = CUSTOMERS.filter(
    (customer) => customer.status === "Active"
  ).length;
  const inactiveCustomers = CUSTOMERS.filter(
    (customer) => customer.status === "Inactive"
  ).length;
  const totalOrders = CUSTOMERS.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

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
                Customer management
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Customers
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Manage customer profiles, activity, orders and spending from one
              place.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-brand-700/70 px-4 text-xs font-bold text-white shadow-sm backdrop-blur">
              <Users className="h-4 w-4 text-white/80" />
              {totalCustomers} Total Customers
            </div>
          </div>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <HeaderMetric label="Customers" value={totalCustomers} />
          <HeaderMetric label="Active" value={activeCustomers} />
          <HeaderMetric label="Inactive" value={inactiveCustomers} />
          <HeaderMetric label="Orders" value={totalOrders} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5">
          <CustomerStat
            label="Total customers"
            value={totalCustomers}
            icon={Users}
            description="All registered customers"
          />
        </Card>

        <Card className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5">
          <CustomerStat
            label="Active customers"
            value={activeCustomers}
            icon={UserCheck}
            description="Currently active"
          />
        </Card>

        <Card className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5">
          <CustomerStat
            label="Inactive customers"
            value={inactiveCustomers}
            icon={UserX}
            description="Needs attention"
            rose
          />
        </Card>

        <Card className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5">
          <CustomerStat
            label="Total orders"
            value={totalOrders}
            icon={ShoppingBag}
            description="Orders from customers"
          />
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-ink sm:text-lg">
                Customer directory
              </h3>

              <Badge tone="brand">
                {filteredCustomers.length} records
              </Badge>
            </div>

            <p className="mt-1 text-xs text-ink-faint">
              View customer details, order activity and spending information.
            </p>
          </div>

          <div className="flex w-full items-center rounded-xl border border-line bg-paper px-3 transition focus-within:border-brand-500 focus-within:bg-white sm:w-[320px]">
            <Search className="h-4 w-4 shrink-0 text-ink-faint" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or phone..."
              className="h-11 w-full bg-transparent px-2 text-xs text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Users}
              title="No customers found"
              description="Try searching with another name, email or phone number."
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="bg-brand-50/50">
                    {[
                      "Customer",
                      "Contact",
                      "Orders",
                      "Total spent",
                      "Status",
                      "Joined",
                      "Action",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-ink-faint ${
                          index === 2 ? "text-center" : ""
                        } ${index === 6 ? "text-right" : "text-left"}`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-line/70 transition hover:bg-brand-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={customer.name} />

                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-ink">
                              {customer.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-ink-faint">
                              Customer #
                              {String(customer.id).padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate text-xs font-semibold text-ink">
                          {customer.email}
                        </p>

                        <p className="mt-1 text-[10px] text-ink-faint">
                          {customer.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-brand-50 px-2 py-1 text-xs font-extrabold text-brand-700">
                          {customer.orders}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-ink">
                          ₹{customer.spent.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          tone={
                            customer.status === "Active" ? "brand" : "rose"
                          }
                          dot
                        >
                          {customer.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[10px] font-semibold text-ink-soft">
                          {customer.joined}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="group flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-[10px] font-bold text-ink-soft transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line/70 md:hidden">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 transition hover:bg-brand-50/20 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={customer.name} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-ink">
                          {customer.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                          Customer #
                          {String(customer.id).padStart(4, "0")}
                        </p>
                      </div>
                    </div>

                    <Badge
                      tone={customer.status === "Active" ? "brand" : "rose"}
                      dot
                    >
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-xl bg-brand-50/60 p-3">
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />

                      <p className="min-w-0 truncate text-[11px] font-semibold text-ink-soft">
                        {customer.email}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-brand-600" />

                      <p className="text-[11px] font-semibold text-ink-soft">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MobileInfo
                      label="Orders"
                      value={customer.orders}
                    />

                    <MobileInfo
                      label="Spent"
                      value={`₹${customer.spent.toLocaleString("en-IN")}`}
                    />

                    <MobileInfo
                      label="Joined"
                      value={customer.joined}
                    />
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    className="mt-4 w-full"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    View customer
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-ink-faint">
                Showing{" "}
                <span className="font-extrabold text-ink-soft">
                  {filteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-ink-soft">
                  {totalCustomers}
                </span>{" "}
                customers
              </p>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Customer activity
              </div>
            </div>
          </>
        )}
      </Card>

      {selectedCustomer && (
        <Modal
          title="Customer details"
          description={`Customer #${String(selectedCustomer.id).padStart(
            4,
            "0"
          )}`}
          onClose={() => setSelectedCustomer(null)}
          width="md"
        >
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-sm font-black text-white shadow-md shadow-brand-600/20">
                {initialsOf(selectedCustomer.name)}
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-base font-extrabold text-ink">
                  {selectedCustomer.name}
                </h4>

                <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                  {selectedCustomer.email}
                </p>

                <div className="mt-2">
                  <Badge
                    tone={
                      selectedCustomer.status === "Active"
                        ? "brand"
                        : "rose"
                    }
                    dot
                  >
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailBox
              icon={Mail}
              label="Email"
              value={selectedCustomer.email}
            />

            <DetailBox
              icon={Phone}
              label="Phone"
              value={selectedCustomer.phone}
            />

            <DetailBox
              icon={CalendarDays}
              label="Joined"
              value={selectedCustomer.joined}
            />

            <DetailBox
              icon={MapPin}
              label="Address"
              value={selectedCustomer.address}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="group rounded-2xl border border-line bg-paper p-4 transition hover:border-brand-200 hover:bg-brand-50/50">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                  Total orders
                </p>

                <ShoppingBag className="h-4 w-4 text-brand-600" />
              </div>

              <p className="mt-2 text-2xl font-black text-ink">
                {selectedCustomer.orders}
              </p>
            </div>

            <div className="group rounded-2xl bg-brand-600 p-4 text-white shadow-md shadow-brand-600/10 transition hover:bg-brand-700">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/65">
                  Total spent
                </p>

                <ArrowUpRight className="h-4 w-4 text-white/70" />
              </div>

              <p className="mt-2 text-2xl font-black">
                ₹{selectedCustomer.spent.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-700/60 p-3 transition hover:bg-brand-700/80 sm:p-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-white/65">
        {label}
      </p>

      <p className="mt-1 text-base font-extrabold sm:text-lg">{value}</p>
    </div>
  );
}

function CustomerStat({
  label,
  value,
  icon: Icon,
  description,
  rose = false,
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            rose
              ? "bg-rose-50 text-rose-600"
              : "bg-brand-50 text-brand-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-extrabold ${
            rose
              ? "bg-rose-50 text-rose-600"
              : "bg-brand-50 text-brand-700"
          }`}
        >
          {rose ? "Attention" : "Updated"}
        </span>

        <span className="truncate text-[10px] text-ink-faint">
          {description}
        </span>
      </div>
    </>
  );
}

function Avatar({ name }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-xs font-extrabold text-brand-700">
      {initialsOf(name)}
    </div>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white p-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-extrabold text-ink">
        {value}
      </p>
    </div>
  );
}

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3 transition hover:border-brand-200 hover:bg-brand-50/30">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-semibold text-ink">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

const initialsOf = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

