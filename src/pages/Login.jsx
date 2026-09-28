import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  BarChart3,
  LockKeyhole,
  CheckCircle2,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staffLogin } from "../api/authApis";
import { saveSession } from "../utils/auth";

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const inputWrapClass =
  "flex h-12 w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(49,93,50,0.08)]";

const inputClass =
  "h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm font-semibold text-[#202a20] outline-none placeholder:font-normal placeholder:text-[#92998e] disabled:opacity-60";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearErrorOnChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Enter your username and password to continue.");
      return;
    }

    try {
      setLoading(true);

      const response = await staffLogin({
        username: username.trim(),
        password,
      });

      if (!response?.success || !response?.data?.accessToken) {
        throw new Error(response?.message || "Login failed. Please try again.");
      }

      saveSession({
        accessToken: response.data.accessToken,
        staff: response.data.staff,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign in. Please try again.";

      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#f7f8f2] px-3 py-4 sm:px-5 sm:py-8">
      {/* Page background blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#b8df7d]/40 blur-3xl sm:h-80 sm:w-80"
      />

      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-[#315d32]/15 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative my-auto w-full max-w-[1020px]"
      >
        <motion.div
          variants={itemVariants}
          className="grid w-full overflow-hidden rounded-[22px] border border-[#dceacb] bg-white shadow-[0_25px_80px_rgba(49,93,50,0.15)] sm:rounded-[30px] lg:grid-cols-[1fr_1fr]"
        >
          {/* ================= LEFT PANEL (desktop) ================= */}
          <div className="relative hidden min-h-[620px] overflow-hidden bg-[#315d32] p-8 text-white lg:flex lg:flex-col xl:p-11">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.3, 0.18] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#b8df7d]/25 blur-2xl"
            />

            <motion.div
              animate={{ x: [0, 22, 0], y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            />

            <motion.div
              animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[18%] top-[42%] h-28 w-28 rounded-full bg-[#b8df7d]/15 blur-2xl"
            />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 4 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#315d32] shadow-lg"
              >
                <ShoppingBag className="h-5 w-5" />
              </motion.div>

              <div>
                <h2 className="text-base font-black tracking-tight">
                  CD Shopping Hub
                </h2>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Hero copy */}
            <div className="relative z-10 my-auto py-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                <motion.span
                  animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-[#b8df7d]"
                />
                Store management
              </div>

              <h1 className="max-w-[420px] text-3xl font-black leading-[1.12] tracking-tight xl:text-[40px]">
                Everything your store needs,{" "}
                <span className="text-[#b8df7d]">in one place.</span>
              </h1>

              <p className="mt-4 max-w-[380px] text-xs leading-5 text-white/70 xl:text-sm xl:leading-6">
                Manage products, orders, customers and store operations from
                one beautiful dashboard.
              </p>

              <div className="mt-8 grid max-w-[420px] grid-cols-2 gap-2.5">
                <FeatureCard
                  icon={ShoppingBag}
                  title="Orders"
                  text="Manage daily orders"
                />

                <FeatureCard
                  icon={BarChart3}
                  title="Analytics"
                  text="Track store growth"
                />

                <FeatureCard
                  icon={LockKeyhole}
                  title="Security"
                  text="Protected access"
                />

                <FeatureCard
                  icon={CheckCircle2}
                  title="Operations"
                  text="Stay organized"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-[10px] text-white/50">
                © 2026 CD Shopping Hub
              </p>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/60">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure access
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANEL (form) ================= */}
          <div className="flex w-full flex-col">
            {/* Mobile / tablet brand banner */}
            <div className="relative overflow-hidden bg-[#315d32] px-4 py-4 text-white sm:px-8 sm:py-5 lg:hidden">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.3, 0.18] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#b8df7d]/25 blur-2xl"
              />

              <motion.div
                animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              />

              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315d32] shadow-md sm:h-11 sm:w-11">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black tracking-tight sm:text-base">
                    CD Shopping Hub
                  </h2>

                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[9px]">
                    Admin Panel
                  </p>
                </div>

                <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] font-bold text-white/80 sm:flex">
                  <Sparkles className="h-3 w-3 text-[#b8df7d]" />
                  Store management
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center px-4 py-7 sm:px-10 sm:py-10 xl:px-14">
              <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-[380px]"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.06 }}
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]"
                  >
                    <LockKeyhole className="h-5 w-5" />
                  </motion.div>

                  <div className="mb-1.5 flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-[#315d32]"
                    />

                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#92998e]">
                      Welcome back
                    </span>
                  </div>

                  <h1 className="text-[24px] font-black leading-tight tracking-tight text-[#202a20] sm:text-[28px]">
                    Sign in to your account
                  </h1>

                  <p className="mt-2 text-xs leading-5 text-[#92998e] sm:text-sm sm:leading-6">
                    Enter your credentials to continue to the admin dashboard.
                  </p>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4 flex w-full items-start gap-2.5 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-3 text-[11px] font-semibold leading-4 text-[#b35a54] sm:text-xs">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b35a54]" />
                        <span className="min-w-0 break-words">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  variants={itemVariants}
                  onSubmit={handleSubmit}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
                      Username
                    </label>

                    <div className={inputWrapClass}>
                      <User className="h-4 w-4 shrink-0 text-[#92998e]" />

                      <input
                        autoComplete="off"
                        value={username}
                        onChange={clearErrorOnChange(setUsername)}
                        disabled={loading}
                        placeholder="Enter your username"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
                      Password
                    </label>

                    <div className={inputWrapClass}>
                      <LockKeyhole className="h-4 w-4 shrink-0 text-[#92998e]" />

                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={clearErrorOnChange(setPassword)}
                        disabled={loading}
                        placeholder="Enter your password"
                        className={inputClass}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#92998e] transition hover:bg-[#eef5e7] hover:text-[#315d32] disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={loading ? undefined : { y: -2 }}
                    whileTap={loading ? undefined : { scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="group mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(49,93,50,0.25)] transition hover:bg-[#274d29] disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to dashboard
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </motion.form>

                <motion.div
                  variants={itemVariants}
                  className="my-5 flex w-full items-center gap-2.5"
                >
                  <div className="h-px flex-1 bg-[#edf1e9]" />

                  <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e]">
                    Secure login
                  </span>

                  <div className="h-px flex-1 bg-[#edf1e9]" />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex w-full items-start gap-2.5 rounded-xl border border-[#dceacb] bg-[#eef5e7]/60 p-3 sm:p-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#315d32] shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-[#202a20] sm:text-xs">
                      Your account is protected
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 text-[#92998e] sm:text-[10px]">
                      Secure authentication keeps your account and store data
                      protected.
                    </p>
                  </div>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-5 text-center text-[9px] font-medium text-[#92998e]"
                >
                  Authorized staff access only
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group rounded-xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur transition-colors duration-300 hover:bg-white/[0.14]"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-[#b8df7d] transition-all duration-300 group-hover:bg-[#b8df7d] group-hover:text-[#315d32]">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black text-white">{title}</p>

          <p className="mt-0.5 truncate text-[9px] text-white/55">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}