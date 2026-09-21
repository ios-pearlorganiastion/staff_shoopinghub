import { useState } from "react";
import {
  User,
  Store,
  Bell,
  Lock,
  Settings as SettingsIcon,
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "store", label: "Store settings", icon: Store },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "preferences", label: "Preferences", icon: SettingsIcon },
];

export default function Settings() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "Admin Seller",
    email: "seller@cdshopping.com",
    phone: "+91 98765 43210",
    role: "Store Manager",
  });

  const [store, setStore] = useState({
    name: "CD Shopping",
    email: "support@cdshopping.com",
    phone: "+91 98765 43210",
    address: "Dehradun, Uttarakhand, India",
    currency: "INR",
  });

  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    lowStock: true,
    customers: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const handleSave = () => showToast("Settings saved successfully");

  const activeTabData = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full min-w-0 space-y-5 overflow-hidden pb-8 sm:space-y-6 lg:space-y-7">
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-5 py-6 text-white shadow-lg shadow-brand-600/10 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]">
                Administration
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Manage your account, store preferences, notifications and
              security settings from one place.
            </p>
          </div>

          <div className="hidden shrink-0 sm:flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-brand-700/60 backdrop-blur-sm">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <HeaderMetric
            icon={User}
            label="Account"
            value="Active"
          />
          <HeaderMetric
            icon={ShieldCheck}
            label="Security"
            value="Protected"
          />
          <HeaderMetric
            icon={SlidersHorizontal}
            label="Section"
            value={activeTabData?.label || "Profile"}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
            <div className="border-b border-line px-5 py-4 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                Settings menu
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Manage your preferences
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto p-3 xl:block xl:space-y-1 xl:overflow-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex min-w-max items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold transition-all duration-300 xl:w-full ${
                      active
                        ? "bg-brand-50 text-brand-700 shadow-sm"
                        : "text-ink-soft hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                        active
                          ? "bg-brand-600 text-white shadow-sm"
                          : "bg-paper text-ink-faint group-hover:bg-brand-50 group-hover:text-brand-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span>{tab.label}</span>

                    {active && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-600 xl:block" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>

        <main className="min-w-0">
          {activeTab === "profile" && (
            <SettingsCard
              title="Profile settings"
              description="Update your personal account information."
              icon={User}
              onSave={handleSave}
            >
              <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-xl font-extrabold text-white shadow-md">
                      AS
                    </div>

                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-ink-soft shadow-md transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-ink">
                      {profile.name}
                    </p>

                    <p className="mt-1 text-xs text-ink-faint">
                      {profile.role}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-[9px] font-extrabold text-brand-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        Active account
                      </span>

                      <span className="text-[9px] font-semibold text-brand-600">
                        JPG, PNG or WEBP · Max 2MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <Field label="Full name">
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Email address">
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Phone number">
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Role">
                  <Input value={profile.role} disabled />
                </Field>
              </div>
            </SettingsCard>
          )}

          {activeTab === "store" && (
            <SettingsCard
              title="Store settings"
              description="Manage your store information and contact details."
              icon={Store}
              onSave={handleSave}
            >
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <Store className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-ink">
                    {store.name}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-faint">
                    Your store information and customer-facing details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <Field label="Store name">
                  <Input
                    value={store.name}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        name: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Store email">
                  <Input
                    type="email"
                    value={store.email}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        email: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Store phone">
                  <Input
                    value={store.phone}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        phone: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Currency">
                  <Select
                    value={store.currency}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        currency: e.target.value,
                      })
                    }
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Store address">
                    <Textarea
                      rows={4}
                      value={store.address}
                      onChange={(e) =>
                        setStore({
                          ...store,
                          address: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === "notifications" && (
            <SettingsCard
              title="Notification settings"
              description="Choose which notifications you want to receive."
              icon={Bell}
              onSave={handleSave}
            >
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <ToggleRow
                  title="New orders"
                  description="Get notified whenever a new order is placed."
                  checked={notifications.orders}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      orders: !notifications.orders,
                    })
                  }
                />

                <ToggleRow
                  title="Promotions"
                  description="Receive updates about promotions and offers."
                  checked={notifications.promotions}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      promotions: !notifications.promotions,
                    })
                  }
                />

                <ToggleRow
                  title="Low stock alerts"
                  description="Get notified when products are running low."
                  checked={notifications.lowStock}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      lowStock: !notifications.lowStock,
                    })
                  }
                />

                <ToggleRow
                  title="Customer updates"
                  description="Receive notifications about customer activity."
                  checked={notifications.customers}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      customers: !notifications.customers,
                    })
                  }
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === "security" && (
            <SettingsCard
              title="Security"
              description="Update your password and secure your account."
              icon={Lock}
              onSave={handleSave}
            >
              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-ink">
                      Account security
                    </p>
                    <p className="mt-1 text-[10px] text-ink-faint">
                      Keep your administrator account protected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 max-w-xl space-y-1">
                <PasswordField
                  label="Current password"
                  value={passwords.current}
                  onChange={(v) =>
                    setPasswords({
                      ...passwords,
                      current: v,
                    })
                  }
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />

                <PasswordField
                  label="New password"
                  value={passwords.newPassword}
                  onChange={(v) =>
                    setPasswords({
                      ...passwords,
                      newPassword: v,
                    })
                  }
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />

                <PasswordField
                  label="Confirm new password"
                  value={passwords.confirm}
                  onChange={(v) =>
                    setPasswords({
                      ...passwords,
                      confirm: v,
                    })
                  }
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-brand-800">
                      Password requirements
                    </p>

                    <ul className="mt-2 space-y-1.5 text-[11px] text-brand-700">
                      <li>• At least 8 characters</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                    </ul>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {activeTab === "preferences" && (
            <SettingsCard
              title="Preferences"
              description="Customize your admin panel experience."
              icon={SettingsIcon}
              onSave={handleSave}
            >
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <Field label="Language">
                  <Select defaultValue="English">
                    <option>English</option>
                    <option>Hindi</option>
                  </Select>
                </Field>

                <Field label="Timezone">
                  <Select defaultValue="Asia/Kolkata (IST)">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </Select>
                </Field>

                <Field label="Date format">
                  <Select defaultValue="DD/MM/YYYY">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </Select>
                </Field>
              </div>
            </SettingsCard>
          )}
        </main>
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  onSave,
}) {
  return (
    <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-line p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-ink sm:text-lg">
            {title}
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-ink-faint sm:text-xs">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>

      <div className="flex justify-end border-t border-line bg-paper/40 px-5 py-4 sm:px-6">
        <Button
          icon={Save}
          onClick={onSave}
          className="w-full sm:w-auto"
        >
          Save changes
        </Button>
      </div>
    </Card>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter password"
          className="pr-11"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-brand-700"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </Field>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/70 p-4 last:border-b-0 sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            checked
              ? "bg-brand-50 text-brand-700"
              : "bg-paper text-ink-faint"
          }`}
        >
          <Bell className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-extrabold text-ink sm:text-sm">
            {title}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-ink-faint sm:text-xs">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
          checked ? "bg-brand-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function HeaderMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-700/60 p-3 backdrop-blur-sm transition hover:bg-brand-700/80 sm:p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-white/70" />

        <p className="text-[9px] font-semibold uppercase tracking-wide text-white/65">
          {label}
        </p>
      </div>

      <p className="mt-1 truncate text-sm font-extrabold sm:text-base">
        {value}
      </p>
    </div>
  );
}