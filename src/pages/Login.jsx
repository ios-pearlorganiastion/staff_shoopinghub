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
} from "lucide-react";
import { staffLogin } from "../api/authApis";
import { saveSession } from "../utils/auth";
import Button from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";

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
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#f4f8f5] px-3 py-4 sm:px-5 sm:py-6 md:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-brand-200/25 blur-3xl sm:h-60 sm:w-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-brand-300/20 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative my-auto w-full max-w-[1000px]">
        <div className="grid w-full overflow-hidden rounded-[20px] border border-[#dce9df] bg-white shadow-[0_15px_50px_rgba(18,77,42,0.10)] sm:rounded-[24px] lg:grid-cols-[0.92fr_1.08fr]">

          <div className="relative hidden min-h-[590px] overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-8 lg:flex lg:flex-col xl:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[42px] border-white/[0.04]" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[48px] border-white/[0.04]" />
            <div className="absolute right-10 top-1/3 h-24 w-24 rounded-full bg-brand-300/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
                <ShoppingBag className="h-[18px] w-[18px] text-brand-700" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-white">
                  CD Shopping Hub
                </h2>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-brand-100/70">
                  Admin Panel
                </p>
              </div>
            </div>

            <div className="relative z-10 my-auto py-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-brand-200" />
                Store management
              </div>

              <h1 className="max-w-[420px] text-3xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-[40px]">
                Everything your store needs,
                <span className="block text-brand-200">
                  in one place.
                </span>
              </h1>

              <p className="mt-4 max-w-[360px] text-xs leading-5 text-brand-50/70">
                Manage products, orders, customers and store operations from
                one powerful dashboard.
              </p>

              <div className="mt-7 grid max-w-[400px] grid-cols-2 gap-2.5">
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

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-[9px] text-white/40">
                © 2026 CD Shopping Hub
              </p>

              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-white/50">
                <ShieldCheck className="h-3 w-3" />
                Secure access
              </div>
            </div>
          </div>

          <div className="flex min-h-[560px] w-full items-center justify-center px-4 py-7 sm:min-h-[590px] sm:px-8 sm:py-9 md:px-10 lg:px-10 xl:px-12">
            <div className="w-full max-w-[360px]">

              <div className="mb-6 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-700/20">
                  <ShoppingBag className="h-[18px] w-[18px] text-white" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-extrabold text-ink">
                    CD Shopping Hub
                  </h2>

                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    Admin Panel
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:h-12 sm:w-12">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-600">
                  Welcome back
                </p>

                <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink sm:text-[28px]">
                  Sign in to your account
                </h1>

                <p className="mt-2 max-w-[330px] text-xs leading-5 text-ink-soft sm:text-sm">
                  Enter your credentials to continue to the admin dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex w-full items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-[10px] font-semibold leading-4 text-rose-600 sm:px-3.5 sm:text-[11px]">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                spellCheck={false}
                className="w-full"
              >
                <Field label="Username">
                  <Input
                    autoComplete="off"
                    value={username}
                    onChange={clearErrorOnChange(setUsername)}
                    disabled={loading}
                    placeholder="Enter your username"
                    className="h-11 w-full rounded-xl border-[#dce9df] bg-[#fbfdfb] text-sm transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  />
                </Field>

                <Field label="Password">
                  <div className="relative w-full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={clearErrorOnChange(setPassword)}
                      disabled={loading}
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-xl border-[#dce9df] bg-[#fbfdfb] pr-11 text-sm transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Button
                  type="submit"
                  loading={loading}
                  icon={loading ? undefined : ArrowRight}
                  className="mt-3 h-11 w-full rounded-xl bg-brand-700 text-xs font-bold shadow-lg shadow-brand-700/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-brand-700/25 sm:text-sm"
                  size="lg"
                >
                  {loading ? "Signing in..." : "Sign in to dashboard"}
                </Button>
              </form>

              <div className="my-5 flex w-full items-center gap-2.5">
                <div className="h-px flex-1 bg-line" />

                <span className="shrink-0 text-[7px] font-bold uppercase tracking-wider text-ink-faint sm:text-[8px]">
                  Secure login
                </span>

                <div className="h-px flex-1 bg-line" />
              </div>

              <div className="flex w-full items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/60 p-3 sm:p-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-ink sm:text-[11px]">
                    Your account is protected
                  </p>

                  <p className="mt-0.5 text-[8px] leading-4 text-ink-faint sm:text-[9px]">
                    Secure authentication keeps your account and store data
                    protected.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-center text-[8px] font-medium text-ink-faint sm:text-[9px]">
                Authorized staff access only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.07] p-2.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.11]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-brand-100">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold text-white">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[8px] text-white/45">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}