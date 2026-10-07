import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  HandCoins,
  Users,
  Clock3,
  IndianRupee,
  TrendingUp,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Wallet,
  Ban,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import {
  getAffiliates,
  getAffiliateStats,
  getAffiliatePayouts,
  updateAffiliatePayout,
  getAffiliate,
  updateAffiliateStatus,
  createAffiliateAdjustment,
  getAffiliateReconciliation,
} from "../api/affiliateApis";

const STATUS_STYLE = {
  PENDING: "bg-[#fff4dc] text-[#a66b00]",
  REQUESTED: "bg-[#fff4dc] text-[#a66b00]",
  APPROVED: "bg-[#eef5e7] text-[#315d32]",
  REJECTED: "bg-[#f8ecea] text-[#b35a54]",
  SUSPENDED: "bg-[#f1eef8] text-[#70539b]",
  PAID: "bg-[#eef5e7] text-[#315d32]",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  REQUESTED: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
  PAID: "Paid",
};

const TABS = [
  ["applications", "Applications"],
  ["affiliates", "Affiliates"],
  ["payouts", "Payouts"],
];

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

const inputClass =
  "h-11 w-full rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 text-xs font-semibold text-[#202a20] outline-none transition placeholder:font-normal placeholder:text-[#92998e] focus:border-[#315d32] focus:bg-white sm:text-sm";


const normalizeObject = (response) => {
  if (response?.data && !Array.isArray(response.data)) {
    return response.data?.data || response.data?.summary || response.data?.stats || response.data;
  }
  if (response?.summary) return response.summary;
  if (response?.stats) return response.stats;
  return response || {};
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.affiliates)) return response.affiliates;
  if (Array.isArray(response?.payouts)) return response.payouts;
  return [];
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getId = (item) => item?.id || item?._id;

const getCustomerName = (item) =>
  item?.customer?.name ||
  item?.customerName ||
  item?.user?.name ||
  item?.user?.fullName ||
  item?.name ||
  "Unknown customer";

const getCustomerEmail = (item) =>
  item?.customer?.email ||
  item?.email ||
  item?.user?.email ||
  "";

const getAffiliateStatus = (item) =>
  String(item?.status || item?.affiliateStatus || "PENDING").toUpperCase();

const getReferralCode = (item) =>
  item?.referralCode || item?.code || item?.affiliateCode || "—";

const getChannel = (item) =>
  item?.channel || item?.application?.channel || "—";

const getAmount = (item) =>
  item?.amount ?? item?.requestedAmount ?? item?.payoutAmount ?? 0;

export default function Affiliates() {
  const [activeTab, setActiveTab] = useState("applications");
  const [affiliates, setAffiliates] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [reconciliation, setReconciliation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("30d");

  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAffiliate, setReviewAffiliate] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVED");
  const [reviewReason, setReviewReason] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [approvedCode, setApprovedCode] = useState("");

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutAction, setPayoutAction] = useState("PAID");
  const [transactionRef, setTransactionRef] = useState("");
  const [payoutReason, setPayoutReason] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustAffiliate, setAdjustAffiliate] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSaving, setAdjustSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [affiliateResponse, statsResponse, payoutResponse, reconciliationResponse] =
        await Promise.all([
          getAffiliates({
            search: search.trim() || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            channel: channelFilter !== "all" ? channelFilter : undefined,
          }),
          getAffiliateStats({ range: rangeFilter }),
          getAffiliatePayouts({
            search: search.trim() || undefined,
            status: activeTab === "payouts" ? undefined : "REQUESTED",
          }),
          getAffiliateReconciliation(),
        ]);

      setAffiliates(normalizeList(affiliateResponse));
      setStats(normalizeObject(statsResponse));
      setPayouts(normalizeList(payoutResponse));
      setReconciliation(
        reconciliationResponse?.data || reconciliationResponse || null
      );
    } catch (err) {
      setError(err?.message || "Unable to load affiliate programme data.");
      setAffiliates([]);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, channelFilter, rangeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredAffiliates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return affiliates.filter((affiliate) => {
      const name = getCustomerName(affiliate).toLowerCase();
      const email = getCustomerEmail(affiliate).toLowerCase();
      const code = getReferralCode(affiliate).toLowerCase();
      const channel = getChannel(affiliate).toLowerCase();

      return (
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        code.includes(query) ||
        channel.includes(query)
      );
    });
  }, [affiliates, search]);

  const applicationItems = useMemo(
    () =>
      filteredAffiliates.filter(
        (affiliate) => getAffiliateStatus(affiliate) === "PENDING"
      ),
    [filteredAffiliates]
  );

  const approvedItems = useMemo(
    () =>
      filteredAffiliates.filter((affiliate) =>
        ["APPROVED", "SUSPENDED"].includes(getAffiliateStatus(affiliate))
      ),
    [filteredAffiliates]
  );

  const channels = useMemo(() => {
    const values = new Set();
    affiliates.forEach((item) => {
      const channel = getChannel(item);
      if (channel && channel !== "—") values.add(channel);
    });
    return Array.from(values);
  }, [affiliates]);

  const pendingApplications =
    stats?.pendingApplications ??
    stats?.pending ??
    affiliates.filter((item) => getAffiliateStatus(item) === "PENDING").length;

  const approvedAffiliates =
    stats?.approvedAffiliates ??
    stats?.approved ??
    affiliates.filter((item) => getAffiliateStatus(item) === "APPROVED").length;

  const payoutsAwaiting =
    stats?.payoutsAwaiting ??
    stats?.pendingPayouts ??
    payouts.filter((item) => getAffiliateStatus(item) === "REQUESTED").length;

  const commissionLiability =
    stats?.totalCommissionLiability ??
    stats?.commissionLiability ??
    stats?.liability ??
    0;

  const attributedRevenue =
    stats?.attributedRevenue30d ??
    stats?.attributedRevenue ??
    stats?.revenue30d ??
    0;

  const openReview = (affiliate, action) => {
    setReviewAffiliate(affiliate);
    setReviewAction(action);
    setReviewReason("");
    setApprovedCode("");
    setFormError("");
    setReviewOpen(true);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      reviewAction === "REJECTED" &&
      !reviewReason.trim()
    ) {
      setFormError("Rejection reason is required.");
      return;
    }

    try {
      setReviewSaving(true);

      const response = await updateAffiliateStatus(getId(reviewAffiliate), {
        status: reviewAction,
        ...(reviewAction === "REJECTED"
          ? { rejectionReason: reviewReason.trim() }
          : {}),
      });

      if (reviewAction === "APPROVED") {
        const data = response?.data || response || {};
        setApprovedCode(
          data?.referralCode ||
            data?.affiliate?.referralCode ||
            getReferralCode(reviewAffiliate)
        );
      } else {
        setReviewOpen(false);
      }

      await loadData();
    } catch (err) {
      setFormError(err?.message || "Unable to update affiliate status.");
    } finally {
      setReviewSaving(false);
    }
  };

  const openDetail = async (affiliate) => {
    setFormError("");

    try {
      const response = await getAffiliate(getId(affiliate));
      setSelectedAffiliate(response?.data || response || affiliate);
    } catch {
      setSelectedAffiliate(affiliate);
    }

    setDetailOpen(true);
  };

  const openPayout = (payout, action = "PAID") => {
    setSelectedPayout(payout);
    setPayoutAction(action);
    setTransactionRef("");
    setPayoutReason("");
    setFormError("");
    setPayoutOpen(true);
  };

  const handlePayoutSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (payoutAction === "PAID" && !transactionRef.trim()) {
      setFormError("UTR / transaction reference is required.");
      return;
    }

    if (payoutAction === "REJECTED" && !payoutReason.trim()) {
      setFormError("Rejection reason is required.");
      return;
    }

    try {
      setPayoutSaving(true);

      await updateAffiliatePayout(getId(selectedPayout), {
        status: payoutAction,
        ...(payoutAction === "PAID"
          ? { transactionRef: transactionRef.trim() }
          : { rejectionReason: payoutReason.trim() }),
      });

      setPayoutOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err?.message || "Unable to update payout.");
    } finally {
      setPayoutSaving(false);
    }
  };

  const openAdjustment = (affiliate) => {
    setAdjustAffiliate(affiliate);
    setAdjustAmount("");
    setAdjustReason("");
    setFormError("");
    setAdjustOpen(true);
  };

  const handleAdjustmentSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const amount = Number(adjustAmount);

    if (!Number.isFinite(amount) || amount === 0) {
      setFormError("Enter a valid non-zero adjustment amount.");
      return;
    }

    if (!adjustReason.trim()) {
      setFormError("Adjustment reason is required.");
      return;
    }

    try {
      setAdjustSaving(true);

      await createAffiliateAdjustment(getId(adjustAffiliate), {
        amount,
        reason: adjustReason.trim(),
      });

      setAdjustOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err?.message || "Unable to create adjustment.");
    } finally {
      setAdjustSaving(false);
    }
  };

  const toggleAffiliateStatus = async (affiliate) => {
    const current = getAffiliateStatus(affiliate);
    const next = current === "SUSPENDED" ? "APPROVED" : "SUSPENDED";

    try {
      setFormError("");
      await updateAffiliateStatus(getId(affiliate), { status: next });
      await loadData();
    } catch (err) {
      setFormError(err?.message || "Unable to update affiliate status.");
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="box-border w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7f8f2] pb-5 sm:pb-8"
    >
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-3 px-2 sm:space-y-5 sm:px-3 md:px-4 lg:space-y-6 lg:px-5">
        <motion.section
          variants={itemVariants}
          className="group relative overflow-hidden rounded-[18px] bg-[#315d32] px-3 py-4 text-white shadow-[0_20px_60px_rgba(49,93,50,0.18)] sm:rounded-[28px] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.18, 0.28, 0.18],
            }}
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
                <HandCoins className="h-4 w-4 sm:h-6 sm:w-6" />
              </motion.div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2" />
                  <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                    Growth management
                  </span>
                </div>
                <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                  Affiliate Programme
                </h1>
                <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                  Review applications, manage affiliates, reconcile earnings
                  and process payout requests from one workspace.
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleRefresh}
              className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-[9px] font-bold text-white backdrop-blur transition hover:bg-white/20 sm:min-h-10 sm:w-auto sm:text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </motion.button>
          </div>
        </motion.section>

        <motion.div
          variants={pageVariants}
          className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5"
        >
          <StatCard
            label="Pending Applications"
            value={pendingApplications}
            icon={Clock3}
            tone="amber"
          />
          <StatCard
            label="Approved Affiliates"
            value={approvedAffiliates}
            icon={Users}
          />
          <StatCard
            label="Payouts Awaiting"
            value={payoutsAwaiting}
            icon={Wallet}
            danger={Number(payoutsAwaiting) > 0}
          />
          <StatCard
            label="Commission Liability"
            value={formatMoney(commissionLiability)}
            icon={IndianRupee}
          />
          <StatCard
            label="Attributed Revenue"
            value={formatMoney(attributedRevenue)}
            icon={TrendingUp}
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </motion.div>
        )}

        {formError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{formError}</span>
            <button
              type="button"
              onClick={() => setFormError("")}
              className="ml-auto shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#edf1e9] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3">
            {TABS.map(([value, label]) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(value)}
                className={`shrink-0 rounded-xl px-3 py-2 text-[8px] font-bold transition-all sm:px-3.5 sm:text-xs ${
                  activeTab === value
                    ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                    : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center">
            <div className="flex w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white lg:flex-1">
              <Search className="h-4 w-4 shrink-0 text-[#92998e]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, email, code or channel..."
                className="h-10 w-full min-w-0 bg-transparent px-2 text-[11px] text-[#202a20] outline-none placeholder:text-[#92998e] sm:text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 text-[#92998e] transition hover:text-[#315d32]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`${inputClass} min-w-[130px] appearance-none px-3`}
              >
                <option value="all">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={channelFilter}
                onChange={(event) => setChannelFilter(event.target.value)}
                className={`${inputClass} min-w-[130px] appearance-none px-3`}
              >
                <option value="all">All channels</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>

              <select
                value={rangeFilter}
                onChange={(event) => setRangeFilter(event.target.value)}
                className={`${inputClass} col-span-2 min-w-[130px] appearance-none px-3 sm:col-span-1`}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </motion.section>

        {activeTab === "applications" && (
          <ApplicationsTable
            loading={loading}
            items={applicationItems}
            onView={openDetail}
            onApprove={(item) => openReview(item, "APPROVED")}
            onReject={(item) => openReview(item, "REJECTED")}
          />
        )}

        {activeTab === "affiliates" && (
          <>
            <AffiliatesTable
              loading={loading}
              items={approvedItems}
              onView={openDetail}
              onToggle={toggleAffiliateStatus}
              onAdjust={openAdjustment}
              onPayout={(affiliate) => {
                const affiliateId = getId(affiliate);
                const payout = payouts.find(
                  (item) =>
                    getId(item?.affiliate) === affiliateId ||
                    getId(item?.affiliateProfile) === affiliateId ||
                    getId(item?.affiliateUser) === affiliateId ||
                    item?.affiliateId === affiliateId ||
                    item?.affiliateProfileId === affiliateId
                );

                if (!payout) {
                  setFormError("No requested payout was found for this affiliate.");
                  return;
                }

                openPayout(payout, "PAID");
              }}
            />

            <ReconciliationStrip reconciliation={reconciliation} />
          </>
        )}

        {activeTab === "payouts" && (
          <PayoutsTable
            loading={loading}
            items={payouts}
            onAction={openPayout}
          />
        )}
      </div>

      {reviewOpen && reviewAffiliate && (
        <ModalShell
          eyebrow={reviewAction === "APPROVED" ? "Approve application" : "Reject application"}
          title={getCustomerName(reviewAffiliate)}
          subtitle={`${getChannel(reviewAffiliate)} · ${formatDate(
            reviewAffiliate?.createdAt || reviewAffiliate?.appliedAt
          )}`}
          onClose={() => !reviewSaving && setReviewOpen(false)}
          footer={
            approvedCode ? (
              <ModalButton primary onClick={() => setReviewOpen(false)}>
                Done
              </ModalButton>
            ) : (
              <>
                <ModalButton
                  onClick={() => setReviewOpen(false)}
                  disabled={reviewSaving}
                >
                  Cancel
                </ModalButton>
                <ModalButton
                  primary={reviewAction === "APPROVED"}
                  danger={reviewAction === "REJECTED"}
                  onClick={handleReviewSubmit}
                  disabled={reviewSaving}
                >
                  {reviewSaving && <Loader2 size={14} className="animate-spin" />}
                  {reviewSaving
                    ? "Saving..."
                    : reviewAction === "APPROVED"
                    ? "Approve affiliate"
                    : "Reject application"}
                </ModalButton>
              </>
            )
          }
        >
          {approvedCode ? (
            <div className="rounded-2xl border border-[#dceacb] bg-[#eef5e7] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315d32]">
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#202a20]">
                    Affiliate approved
                  </p>
                  <p className="mt-1 text-xs text-[#667065]">
                    Share or copy the referral code below.
                  </p>
                  <CopyField value={approvedCode} />
                </div>
              </div>
            </div>
          ) : reviewAction === "REJECTED" ? (
            <FormField label="Rejection reason" required>
              <textarea
                value={reviewReason}
                onChange={(event) => setReviewReason(event.target.value)}
                placeholder="Explain why this application is being rejected."
                rows={4}
                className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
              />
            </FormField>
          ) : (
            <div className="rounded-2xl border border-[#dceacb] bg-[#f7f8f2] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#92998e]">
                Application
              </p>
              <p className="mt-2 text-sm font-black text-[#202a20]">
                {reviewAffiliate?.motivation ||
                  reviewAffiliate?.application?.motivation ||
                  "No motivation provided."}
              </p>
            </div>
          )}
        </ModalShell>
      )}

      {payoutOpen && selectedPayout && (
        <ModalShell
          eyebrow="Payout review"
          title={getCustomerName(selectedPayout)}
          subtitle={formatMoney(getAmount(selectedPayout))}
          onClose={() => !payoutSaving && setPayoutOpen(false)}
          footer={
            <>
              <ModalButton
                onClick={() => setPayoutOpen(false)}
                disabled={payoutSaving}
              >
                Cancel
              </ModalButton>
              <ModalButton
                primary={payoutAction === "PAID"}
                danger={payoutAction === "REJECTED"}
                onClick={handlePayoutSubmit}
                disabled={payoutSaving}
              >
                {payoutSaving && <Loader2 size={14} className="animate-spin" />}
                {payoutSaving
                  ? "Saving..."
                  : payoutAction === "PAID"
                  ? "Mark paid"
                  : "Reject payout"}
              </ModalButton>
            </>
          }
        >
          <div className="space-y-3">
            <FormField label="Payout action">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutAction("PAID")}
                  className={`h-11 rounded-xl text-xs font-bold transition ${
                    payoutAction === "PAID"
                      ? "bg-[#315d32] text-white"
                      : "border border-[#dceacb] bg-white text-[#667065]"
                  }`}
                >
                  Mark Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutAction("REJECTED")}
                  className={`h-11 rounded-xl text-xs font-bold transition ${
                    payoutAction === "REJECTED"
                      ? "bg-[#b35a54] text-white"
                      : "border border-[#dceacb] bg-white text-[#667065]"
                  }`}
                >
                  Reject
                </button>
              </div>
            </FormField>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoBox label="Amount" value={formatMoney(getAmount(selectedPayout))} />
              <InfoBox
                label="Requested"
                value={formatDate(
                  selectedPayout?.createdAt || selectedPayout?.requestedAt
                )}
              />
            </div>

            {selectedPayout?.upiId && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#667065]">
                  UPI ID
                </p>
                <CopyField value={selectedPayout.upiId} />
              </div>
            )}

            {payoutAction === "PAID" ? (
              <FormField label="UTR / Transaction reference" required>
                <input
                  value={transactionRef}
                  onChange={(event) => setTransactionRef(event.target.value)}
                  placeholder="Enter UTR number"
                  className={inputClass}
                />
              </FormField>
            ) : (
              <FormField label="Rejection reason" required>
                <textarea
                  value={payoutReason}
                  onChange={(event) => setPayoutReason(event.target.value)}
                  placeholder="Explain why the payout is being rejected."
                  rows={4}
                  className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
                />
              </FormField>
            )}
          </div>
        </ModalShell>
      )}

      {adjustOpen && adjustAffiliate && (
        <ModalShell
          eyebrow="Balance adjustment"
          title={getCustomerName(adjustAffiliate)}
          subtitle={getReferralCode(adjustAffiliate)}
          onClose={() => !adjustSaving && setAdjustOpen(false)}
          footer={
            <>
              <ModalButton
                onClick={() => setAdjustOpen(false)}
                disabled={adjustSaving}
              >
                Cancel
              </ModalButton>
              <ModalButton
                primary
                onClick={handleAdjustmentSubmit}
                disabled={adjustSaving}
              >
                {adjustSaving && <Loader2 size={14} className="animate-spin" />}
                {adjustSaving ? "Saving..." : "Save adjustment"}
              </ModalButton>
            </>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#92998e]">
                Signed adjustment
              </p>
              <p className="mt-1 text-xs leading-5 text-[#667065]">
                Use a positive amount to credit the affiliate or a negative
                amount to debit the balance.
              </p>
            </div>

            <FormField label="Amount" required>
              <input
                type="number"
                step="0.01"
                value={adjustAmount}
                onChange={(event) => setAdjustAmount(event.target.value)}
                placeholder="e.g. 500 or -250"
                className={inputClass}
              />
            </FormField>

            <FormField label="Reason" required>
              <textarea
                value={adjustReason}
                onChange={(event) => setAdjustReason(event.target.value)}
                placeholder="Enter adjustment reason."
                rows={4}
                className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
              />
            </FormField>
          </div>
        </ModalShell>
      )}

      {detailOpen && selectedAffiliate && (
        <AffiliateDetailModal
          affiliate={selectedAffiliate}
          onClose={() => setDetailOpen(false)}
          onAdjust={() => {
            setDetailOpen(false);
            openAdjustment(selectedAffiliate);
          }}
          onToggle={() => {
            setDetailOpen(false);
            toggleAffiliateStatus(selectedAffiliate);
          }}
        />
      )}
    </motion.div>
  );
}

function ApplicationsTable({ loading, items, onView, onApprove, onReject }) {
  return (
    <DataSection
      eyebrow="Applications"
      title="Pending Applications"
      count={items.length}
      loading={loading}
      empty="No pending affiliate applications found."
      icon={Clock3}
    >
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={getId(item)}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-[16px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.05)] sm:rounded-[22px] sm:p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[1.1fr_.8fr_1.4fr_.7fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#202a20] sm:text-sm">
                  {getCustomerName(item)}
                </p>
                <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                  {getCustomerEmail(item) || "No email"}
                </p>
              </div>

              <InfoLine label="Applied" value={formatDate(item.createdAt || item.appliedAt)} />
              <InfoLine label="Motivation" value={item.motivation || item.application?.motivation || "—"} />
              <StatusBadge status={getAffiliateStatus(item)} />

              <div className="grid grid-cols-3 gap-1.5">
                <MobileAction icon={Eye} label="View" onClick={() => onView(item)} />
                <MobileAction icon={CheckCircle2} label="Approve" onClick={() => onApprove(item)} />
                <MobileAction icon={XCircle} label="Reject" danger onClick={() => onReject(item)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DataSection>
  );
}

function AffiliatesTable({ loading, items, onView, onToggle, onAdjust, onPayout }) {
  return (
    <DataSection
      eyebrow="Affiliates"
      title="Approved Affiliates"
      count={items.length}
      loading={loading}
      empty="No approved affiliates found."
      icon={Users}
    >
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={getId(item)}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-[16px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.05)] sm:rounded-[22px] sm:p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[1.2fr_.75fr_.65fr_.65fr_.8fr_.8fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#202a20] sm:text-sm">
                  {getCustomerName(item)}
                </p>
                <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                  {getCustomerEmail(item) || getChannel(item)}
                </p>
              </div>

              <CopyField compact value={getReferralCode(item)} />
              <InfoLine label="Referred" value={item.referredCustomers ?? item.referredCount ?? 0} />
              <InfoLine label="Orders" value={item.orders ?? item.orderCount ?? 0} />
              <InfoLine label="Revenue" value={formatMoney(item.revenue ?? item.attributedRevenue)} />
              <InfoLine label="Earned" value={formatMoney(item.earned ?? item.totalEarned)} />

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-4">
                <MobileAction icon={Eye} label="View" onClick={() => onView(item)} />
                <MobileAction
                  icon={getAffiliateStatus(item) === "SUSPENDED" ? RotateCcw : Ban}
                  label={getAffiliateStatus(item) === "SUSPENDED" ? "Restore" : "Suspend"}
                  onClick={() => onToggle(item)}
                />
                <MobileAction icon={SlidersHorizontal} label="Adjust" onClick={() => onAdjust(item)} />
                <MobileAction icon={Wallet} label="Payout" onClick={() => onPayout(item)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DataSection>
  );
}

function PayoutsTable({ loading, items, onAction }) {
  return (
    <DataSection
      eyebrow="Payout queue"
      title="Requested Payouts"
      count={items.length}
      loading={loading}
      empty="No payout requests found."
      icon={Wallet}
    >
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={getId(item)}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="rounded-[16px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.05)] sm:rounded-[22px] sm:p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[1.2fr_.9fr_.9fr_.7fr_.8fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#202a20] sm:text-sm">
                  {getCustomerName(item)}
                </p>
                <p className="mt-1 truncate text-[9px] text-[#92998e] sm:text-xs">
                  {getReferralCode(item)}
                </p>
              </div>

              <CopyField compact value={item.upiId || "No UPI ID"} />
              <InfoLine label="Amount" value={formatMoney(getAmount(item))} />
              <InfoLine label="Age" value={formatAge(item.createdAt || item.requestedAt)} />
              <StatusBadge status={getAffiliateStatus(item)} />

              <div className="grid grid-cols-2 gap-1.5">
                <MobileAction icon={CheckCircle2} label="Mark Paid" onClick={() => onAction(item, "PAID")} />
                <MobileAction icon={XCircle} label="Reject" danger onClick={() => onAction(item, "REJECTED")} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DataSection>
  );
}

function DataSection({ eyebrow, title, count, loading, empty, icon: Icon, children }) {
  return (
    <motion.section
      variants={itemVariants}
      className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
    >
      <div className="flex items-center justify-between border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32]">
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
              {eyebrow}
            </p>
            <h3 className="mt-0.5 truncate text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
              {title}
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-[#f7f8f2] px-2.5 py-1 text-[9px] font-black text-[#315d32] sm:text-xs">
          {count}
        </span>
      </div>

      <div className="p-2.5 sm:p-4">
        {loading ? (
          <div className="rounded-2xl border border-[#dceacb] bg-[#f7f8f2] px-4 py-12 text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#315d32]" />
            <p className="mt-3 text-sm font-black text-[#202a20]">
              Loading...
            </p>
          </div>
        ) : children && count > 0 ? (
          children
        ) : (
          <div className="rounded-2xl border border-[#dceacb] bg-[#f7f8f2] px-4 py-12 text-center">
            <Icon className="mx-auto h-7 w-7 text-[#92998e]" />
            <p className="mt-3 text-sm font-black text-[#202a20]">
              {empty}
            </p>
            <p className="mt-1 text-xs text-[#92998e]">
              Try changing your filters or refresh the data.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function ReconciliationStrip({ reconciliation }) {
  const delta = Number(
    reconciliation?.delta ??
      reconciliation?.difference ??
      reconciliation?.unreconciledAmount ??
      0
  );

  const balanced =
    reconciliation?.balanced ??
    reconciliation?.isBalanced ??
    delta === 0;

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-col gap-3 rounded-[18px] border px-4 py-3 shadow-[0_8px_30px_rgba(49,93,50,0.04)] sm:flex-row sm:items-center sm:justify-between sm:rounded-[22px] sm:px-5 ${
        balanced
          ? "border-[#dceacb] bg-[#eef5e7]"
          : "border-[#efd3d0] bg-[#f8ecea]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ${
            balanced ? "text-[#315d32]" : "text-[#b35a54]"
          }`}
        >
          {balanced ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
        </div>
        <div className="min-w-0">
          <p
            className={`text-xs font-black ${
              balanced ? "text-[#315d32]" : "text-[#b35a54]"
            }`}
          >
            {balanced ? "Balanced ✓" : "Reconciliation mismatch"}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[#667065] sm:text-xs">
            {balanced
              ? "Affiliate earnings and payout balances are reconciled."
              : `Current reconciliation delta is ${formatMoney(Math.abs(delta))}.`}
          </p>
        </div>
      </div>
      {!balanced && (
        <div className="flex items-center gap-1 text-xs font-black text-[#b35a54]">
          <ArrowUpRight size={14} />
          {formatMoney(delta)}
        </div>
      )}
    </motion.div>
  );
}

function AffiliateDetailModal({ affiliate, onClose, onAdjust, onToggle }) {
  const status = getAffiliateStatus(affiliate);

  return (
    <ModalShell
      eyebrow="Affiliate details"
      title={getCustomerName(affiliate)}
      subtitle={getReferralCode(affiliate)}
      badge={<StatusBadge status={status} />}
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>Close</ModalButton>
          <ModalButton onClick={onAdjust}>
            <SlidersHorizontal size={13} />
            Adjust
          </ModalButton>
          <ModalButton primary={status === "SUSPENDED"} danger={status !== "SUSPENDED"} onClick={onToggle}>
            {status === "SUSPENDED" ? (
              <RotateCcw size={13} />
            ) : (
              <Ban size={13} />
            )}
            {status === "SUSPENDED" ? "Restore" : "Suspend"}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <MetricBox
            label="Referred"
            value={affiliate.referredCustomers ?? affiliate.referredCount ?? 0}
            icon={Users}
          />
          <MetricBox
            label="Orders"
            value={affiliate.orders ?? affiliate.orderCount ?? 0}
            icon={TrendingUp}
          />
          <MetricBox
            label="Revenue"
            value={formatMoney(affiliate.revenue ?? affiliate.attributedRevenue)}
            icon={IndianRupee}
          />
          <MetricBox
            label="Earned"
            value={formatMoney(affiliate.earned ?? affiliate.totalEarned)}
            icon={Wallet}
          />
          <MetricBox
            label="Available"
            value={formatMoney(affiliate.available ?? affiliate.availableBalance)}
            icon={HandCoins}
          />
          <MetricBox
            label="Requested"
            value={formatMoney(affiliate.requestedPayouts ?? affiliate.pendingPayoutAmount)}
            icon={Clock3}
          />
        </div>

        <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
          <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
            Referral code
          </p>
          <CopyField value={getReferralCode(affiliate)} />
        </div>

        <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
          <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
            Customer
          </p>
          <p className="mt-1 text-sm font-black text-[#202a20]">
            {getCustomerName(affiliate)}
          </p>
          <p className="mt-1 text-xs text-[#92998e]">
            {getCustomerEmail(affiliate) || "No email available"}
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "PENDING").toUpperCase();
  const icon =
    normalized === "APPROVED" || normalized === "PAID"
      ? CheckCircle2
      : normalized === "REJECTED"
      ? XCircle
      : normalized === "SUSPENDED"
      ? Ban
      : Clock3;

  const Icon = icon;

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      className={`inline-flex max-w-full min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-black sm:min-h-7 sm:gap-1.5 sm:px-2.5 sm:text-[9px] ${
        STATUS_STYLE[normalized] || "bg-[#f7f8f2] text-[#667065]"
      }`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
      <span className="truncate">
        {STATUS_LABEL[normalized] || normalized}
      </span>
    </motion.span>
  );
}

function StatCard({ label, value, icon: Icon, danger = false, tone = "green" }) {
  const iconClass =
    danger
      ? "bg-[#f8ecea] text-[#b35a54] group-hover:bg-[#b35a54] group-hover:text-white"
      : tone === "amber"
      ? "bg-[#fff4dc] text-[#a66b00] group-hover:bg-[#a66b00] group-hover:text-white"
      : "bg-[#eef5e7] text-[#315d32] group-hover:bg-[#315d32] group-hover:text-white";

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[16px] border border-[#dceacb] bg-white p-3 shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px] sm:p-4 lg:p-5"
    >
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${
          danger ? "bg-[#b35a54]" : tone === "amber" ? "bg-[#a66b00]" : "bg-[#315d32]"
        } opacity-0 transition-opacity group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-bold uppercase tracking-wider text-[#92998e] sm:text-[9px]">
            {label}
          </p>
          <p className="mt-1.5 truncate text-xl font-black tracking-tight text-[#202a20] sm:text-2xl lg:text-[25px]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-11 sm:w-11 ${iconClass}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-[#315d32]" />
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
          {label}
        </p>
      </div>
      <p className="mt-1 text-sm font-black text-[#202a20]">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-[#202a20]">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-[#202a20]">
        {value}
      </p>
    </div>
  );
}

function CopyField({ value, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event) => {
    event.stopPropagation();

    if (!value || value === "—" || value === "No UPI ID") return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group/copy flex min-w-0 items-center gap-2 rounded-xl border border-[#dceacb] bg-white text-left transition hover:border-[#315d32] hover:bg-[#eef5e7] ${
        compact ? "h-9 px-2.5" : "mt-2 h-10 w-full px-3"
      }`}
      title="Copy"
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold text-[#315d32] sm:text-xs">
        {value}
      </span>
      <span className="shrink-0 text-[#92998e] group-hover/copy:text-[#315d32]">
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      </span>
    </button>
  );
}

function MobileAction({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border text-[9px] font-bold transition active:scale-[0.97] sm:h-10 sm:gap-1.5 sm:text-xs ${
        danger
          ? "border-[#efd3d0] bg-[#fff8f7] text-[#b35a54]"
          : "border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
      }`}
    >
      <Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
        {label}
        {required && <span className="ml-0.5 text-[#b35a54]">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalButton({
  children,
  onClick,
  primary = false,
  danger = false,
  disabled = false,
}) {
  const style = primary
    ? "bg-[#315d32] text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] hover:bg-[#274d29]"
    : danger
    ? "bg-[#b35a54] text-white shadow-[0_8px_20px_rgba(179,90,84,0.2)] hover:bg-[#9c4b46]"
    : "border border-[#dceacb] text-[#667065] hover:border-[#315d32] hover:bg-[#f7f8f2]";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${style}`}
    >
      {children}
    </motion.button>
  );
}

function ModalShell({
  eyebrow,
  title,
  subtitle,
  badge,
  onClose,
  footer,
  children,
}) {
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
        className="flex max-h-[96vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_25px_80px_rgba(49,93,50,0.2)] sm:max-h-[90vh] sm:rounded-[26px]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#315d32] px-3.5 py-4 text-white sm:px-6 sm:py-6">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
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
                {eyebrow}
              </p>
              <h3 className="mt-1 truncate text-lg font-black tracking-tight sm:text-2xl">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 truncate text-[9px] text-white/70 sm:text-xs">
                  {subtitle}
                </p>
              )}
              {badge && <div className="mt-2.5">{badge}</div>}
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-[#edf1e9] bg-white p-2.5 sm:px-5 sm:py-3.5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function formatAge(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const days = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000)
  );

  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
