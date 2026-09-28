import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Lock,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Eye,
  EyeOff,
  ShoppingBag,
  Users,
  Truck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { motion } from "framer-motion";

/* =========================================================
   ANIMATION
========================================================= */

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

/* =========================================================
   FORM PIECES
========================================================= */

const inputWrapClass =
  "flex h-11 w-full min-w-0 items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(49,93,50,0.08)]";

const inputClass =
  "h-full min-w-0 flex-1 bg-transparent text-xs font-semibold text-[#202a20] outline-none placeholder:font-normal placeholder:text-[#92998e] sm:text-sm";

const Field = ({ label, hint, children }) => (
  <div className="min-w-0">
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
      {label}
    </label>

    {children}

    {hint && <p className="mt-1 text-[10px] text-[#92998e]">{hint}</p>}
  </div>
);

const Input = ({
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon: Icon,
  suffix,
}) => (
  <div className={inputWrapClass}>
    {Icon && <Icon className="mr-2 h-4 w-4 shrink-0 text-[#92998e]" />}

    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={inputClass}
    />

    {suffix}
  </div>
);

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={Lock}
      suffix={
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Hide password" : "Show password"}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#92998e] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
};

const Select = ({ value, onChange, children }) => (
  <div className="relative w-full min-w-0">
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full min-w-0 appearance-none rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 pr-10 text-xs font-semibold text-[#202a20] outline-none transition focus:border-[#315d32] focus:bg-white focus:shadow-[0_0_0_4px_rgba(49,93,50,0.08)] sm:text-sm"
    >
      {children}
    </select>

    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#92998e]">
      <ChevronDown size={16} />
    </div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
      checked ? "bg-[#315d32]" : "bg-[#dfe5da]"
    }`}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm ${
        checked ? "right-1" : "left-1"
      }`}
    />
  </button>
);

const SettingsCard = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) => (
  <motion.section
    variants={itemVariants}
    className={`group relative min-w-0 overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.1)] sm:rounded-[24px] ${className}`}
  >
    <div className="flex min-w-0 items-center gap-3 border-b border-[#edf1e9] px-3.5 py-3.5 sm:px-5 sm:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] transition-all duration-300 group-hover:bg-[#315d32] group-hover:text-white sm:h-11 sm:w-11">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
          {title}
        </h2>

        <p className="mt-0.5 truncate text-[9px] text-[#92998e] sm:text-xs">
          {description}
        </p>
      </div>
    </div>

    <div className="min-w-0 p-3.5 sm:p-5">{children}</div>
  </motion.section>
);

/* =========================================================
   NOTIFICATION CONFIG
========================================================= */

const NOTIFICATION_ITEMS = [
  {
    key: "orders",
    icon: ShoppingBag,
    title: "Order Notifications",
    description: "Alerts for new and updated orders",
  },
  {
    key: "customers",
    icon: Users,
    title: "Customer Notifications",
    description: "Updates related to customer activity",
  },
  {
    key: "vendors",
    icon: Store,
    title: "Vendor Notifications",
    description: "Updates from vendors and stores",
  },
  {
    key: "delivery",
    icon: Truck,
    title: "Delivery Notifications",
    description: "Delivery partner activity updates",
  },
];

const THEME_OPTIONS = [
  ["Light", Sun],
  ["Dark", Moon],
  ["System", Monitor],
];

/* =========================================================
   PAGE
========================================================= */

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "+91 98765 43210",
  });

  const [store, setStore] = useState({
    name: "CD Shopping Hub",
    email: "support@example.com",
    phone: "+91 98765 43210",
    address: "Dehradun, Uttarakhand",
    radius: "10",
    commission: "10",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    orders: true,
    customers: true,
    vendors: true,
    delivery: false,
  });

  const [preferences, setPreferences] = useState({
    language: "English",
    timezone: "Asia/Kolkata",
    theme: "Light",
  });

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const saveSettings = () => {
    console.log({
      profile,
      store,
      security,
      notifications,
      preferences,
    });

    showToast("Settings saved successfully");
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const enabledNotifications = Object.values(notifications).filter(
    Boolean
  ).length;

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
            className="fixed right-2.5 top-2.5 z-[120] flex max-w-[calc(100vw-20px)] items-center gap-2 rounded-xl bg-[#315d32] px-3.5 py-2.5 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(49,93,50,0.22)] sm:right-6 sm:top-6 sm:text-sm"
          >
            <CheckCircle2 size={15} className="shrink-0 text-[#b8df7d]" />
            {toast}
          </motion.div>
        )}

        {/* HERO */}
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

          <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 4 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl"
              >
                <SettingsIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              </motion.div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2"
                  />

                  <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                    Admin control
                  </span>
                </div>

                <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                  Settings
                </h1>

                <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                  Manage your account, store configuration and application
                  preferences from one beautiful workspace.
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={saveSettings}
              className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Save Changes
            </motion.button>
          </div>
        </motion.section>

        {/* CARDS GRID */}
        <motion.div
          variants={pageVariants}
          className="grid min-w-0 grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-2"
        >
          {/* PROFILE */}
          <SettingsCard
            icon={User}
            title="Admin Profile"
            description="Manage administrator account details"
          >
            <div className="mb-4 flex min-w-0 items-center gap-3 rounded-xl border border-[#dceacb] bg-[#eef5e7]/60 p-3 sm:p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#315d32] text-sm font-black text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] sm:h-14 sm:w-14">
                {initials || "AD"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#202a20] sm:text-base">
                  {profile.name || "Admin User"}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-[#92998e] sm:text-xs">
                  {profile.email}
                </p>

                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8px] font-black text-[#315d32] sm:text-[9px]">
                  <ShieldCheck size={10} />
                  Administrator
                </span>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-4">
              <Field label="Full Name">
                <Input
                  icon={User}
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </Field>

              <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
                <Field label="Email Address">
                  <Input
                    type="email"
                    icon={Mail}
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </Field>

                <Field label="Phone Number">
                  <Input
                    icon={Phone}
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>
          </SettingsCard>

          {/* NOTIFICATIONS */}
          <SettingsCard
            icon={Bell}
            title="Notifications"
            description={`${enabledNotifications} of ${NOTIFICATION_ITEMS.length} alerts enabled`}
          >
            <div className="space-y-2 sm:space-y-2.5">
              {NOTIFICATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = notifications[item.key];

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-colors duration-300 sm:p-3 ${
                      active
                        ? "border-[#dceacb] bg-[#eef5e7]/50"
                        : "border-[#edf1e9] bg-[#f7f8f2]"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                          active
                            ? "bg-[#315d32] text-white"
                            : "bg-white text-[#92998e]"
                        }`}
                      >
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-black text-[#202a20] sm:text-sm">
                          {item.title}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[#92998e] sm:text-xs">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Toggle
                      checked={active}
                      onChange={(value) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: value,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </SettingsCard>

          {/* STORE */}
          <SettingsCard
            icon={Store}
            title="Store Settings"
            description="Configure your store and delivery operations"
            className="lg:col-span-2"
          >
            <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              <Field label="Store Name">
                <Input
                  icon={Store}
                  value={store.name}
                  onChange={(e) =>
                    setStore({ ...store, name: e.target.value })
                  }
                />
              </Field>

              <Field label="Store Email">
                <Input
                  type="email"
                  icon={Mail}
                  value={store.email}
                  onChange={(e) =>
                    setStore({ ...store, email: e.target.value })
                  }
                />
              </Field>

              <Field label="Store Phone">
                <Input
                  icon={Phone}
                  value={store.phone}
                  onChange={(e) =>
                    setStore({ ...store, phone: e.target.value })
                  }
                />
              </Field>

              <Field label="Delivery Radius (KM)">
                <Input
                  type="number"
                  icon={Truck}
                  value={store.radius}
                  onChange={(e) =>
                    setStore({ ...store, radius: e.target.value })
                  }
                />
              </Field>

              <Field label="Commission (%)">
                <Input
                  type="number"
                  value={store.commission}
                  onChange={(e) =>
                    setStore({ ...store, commission: e.target.value })
                  }
                  suffix={
                    <span className="ml-1 shrink-0 rounded-md bg-[#eef5e7] px-1.5 py-0.5 text-[10px] font-black text-[#315d32]">
                      %
                    </span>
                  }
                />
              </Field>

              <Field label="Store Address">
                <Input
                  icon={MapPin}
                  value={store.address}
                  onChange={(e) =>
                    setStore({ ...store, address: e.target.value })
                  }
                />
              </Field>
            </div>
          </SettingsCard>

          {/* SECURITY */}
          <SettingsCard
            icon={Lock}
            title="Security"
            description="Update your password and account security"
          >
            <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-4">
              <Field label="Current Password">
                <PasswordInput
                  value={security.currentPassword}
                  placeholder="Enter current password"
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </Field>

              <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
                <Field label="New Password">
                  <PasswordInput
                    value={security.newPassword}
                    placeholder="Enter new password"
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Confirm Password">
                  <PasswordInput
                    value={security.confirmPassword}
                    placeholder="Confirm new password"
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          </SettingsCard>

          {/* PREFERENCES */}
          <SettingsCard
            icon={ShieldCheck}
            title="Preferences"
            description="Customize your admin application experience"
          >
            <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-4">
              <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
                <Field label="Language">
                  <Select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </Select>
                </Field>

                <Field label="Timezone">
                  <Select
                    value={preferences.timezone}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        timezone: e.target.value,
                      })
                    }
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </Field>
              </div>

              <Field label="Theme">
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map(([value, Icon]) => {
                    const active = preferences.theme === value;

                    return (
                      <motion.button
                        key={value}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          setPreferences({ ...preferences, theme: value })
                        }
                        className={`flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-bold transition-all sm:text-xs ${
                          active
                            ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                            : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#b8df7d] hover:bg-[#eef5e7] hover:text-[#315d32]"
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{value}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </SettingsCard>
        </motion.div>

        {/* SAVE BAR */}
        <motion.div
          variants={itemVariants}
          className="sticky bottom-2 z-20 flex flex-col gap-2.5 rounded-[16px] border border-[#dceacb] bg-white/95 p-3 shadow-[0_12px_40px_rgba(49,93,50,0.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:p-4"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32]">
              <CheckCircle2 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black text-[#202a20] sm:text-sm">
                Ready to save?
              </p>

              <p className="truncate text-[9px] text-[#92998e] sm:text-xs">
                Review your changes, then save all settings at once.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={saveSettings}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#315d32] px-6 text-xs font-bold text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] transition hover:bg-[#274d29] sm:w-auto"
          >
            <Save size={15} />
            Save Changes
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}