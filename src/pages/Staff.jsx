
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  UserRound,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  Loader2,
  KeyRound,
  AtSign,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../api/staffApis";

const FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

const STATUS_STYLE = {
  Active: "bg-[#eef5e7] text-[#315d32]",
  Inactive: "bg-[#f8ecea] text-[#b35a54]",
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

const inputClass =
  "h-11 w-full rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 text-xs font-semibold text-[#202a20] outline-none transition placeholder:font-normal placeholder:text-[#92998e] focus:border-[#315d32] focus:bg-white sm:text-sm";

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Staff() {
  const [staff, setStaff] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    isActive: true,
  });

  const loadStaff = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const response = await getStaff(requestedPage, limit);

      const data = response?.data || {};

      setStaff(Array.isArray(data.items) ? data.items : []);

      setMeta(
        data.meta || {
          total: 0,
          page: requestedPage,
          limit,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load staff.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff(page);
  }, [page]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        member.username?.toLowerCase().includes(query) ||
        member.displayName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && member.isActive === true) ||
        (statusFilter === "inactive" && member.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, statusFilter]);

  const totalStaff = meta.total || staff.length;

  const activeStaff = staff.filter(
    (item) => item.isActive === true
  ).length;

  const inactiveStaff = staff.filter(
    (item) => item.isActive === false
  ).length;

  const openAddModal = () => {
    setEditingStaff(null);

    setForm({
      username: "",
      password: "",
      displayName: "",
      isActive: true,
    });

    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);

    setForm({
      username: member.username || "",
      password: "",
      displayName: member.displayName || "",
      isActive: member.isActive === true,
    });

    setModalOpen(true);
  };

  const openViewModal = async (member) => {
    try {
      setError("");

      const response = await getStaffById(member.id);

      const details = response?.data || member;

      setSelectedStaff(details);
      setViewModalOpen(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load staff details.");
    }
  };

  const openDeleteModal = (member) => {
    setSelectedStaff(member);
    setDeleteModalOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!form.displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    if (!editingStaff && !form.password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingStaff) {
        const payload = {
          displayName: form.displayName.trim(),
          isActive: form.isActive,
        };

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        const response = await updateStaff(
          editingStaff.id,
          payload
        );

        const updated = response?.data;

        if (updated) {
          setStaff((prev) =>
            prev.map((item) =>
              item.id === editingStaff.id
                ? {
                    ...item,
                    ...updated,
                  }
                : item
            )
          );
        }
      } else {
        const payload = {
          username: form.username.trim(),
          password: form.password.trim(),
          displayName: form.displayName.trim(),
          isActive: form.isActive,
        };

        await createStaff(payload);
      }

      setModalOpen(false);

      await loadStaff(page);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save staff.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    try {
      setDeleting(true);
      setError("");

      await deleteStaff(selectedStaff.id);

      setDeleteModalOpen(false);
      setSelectedStaff(null);

      if (staff.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadStaff(page);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete staff.");
    } finally {
      setDeleting(false);
    }
  };

  const refreshStaff = () => {
    loadStaff(page);
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

          <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl"
              >
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
              </motion.div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2" />

                  <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                    Team management
                  </span>
                </div>

                <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                  Staff
                </h1>

                <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                  Manage staff accounts, usernames, access status and team
                  information from one workspace.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={refreshStaff}
                disabled={loading}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-[9px] font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60 sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={openAddModal}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add staff
              </motion.button>
            </div>
          </div>
        </motion.section>

        {error && (
          <motion.div
            variants={itemVariants}
            className="flex items-start gap-2 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-3 text-xs font-semibold text-[#b35a54]"
          >
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-auto shrink-0"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}

        <motion.div
          variants={pageVariants}
          className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
        >
          <StatCard
            label="Total staff"
            value={totalStaff}
            icon={Users}
            description="All staff accounts"
          />

          <StatCard
            label="Active"
            value={activeStaff}
            icon={UserCheck}
            description="Currently active"
          />

          <StatCard
            label="Inactive"
            value={inactiveStaff}
            icon={UserX}
            description="Currently disabled"
            danger
          />

          <StatCard
            label="Current page"
            value={meta.page || page}
            icon={ShieldCheck}
            description={`of ${meta.totalPages || 1} pages`}
          />
        </motion.div>

        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
                Staff directory
              </p>

              <p className="mt-1 text-xs font-bold text-[#202a20] sm:text-sm">
                Team members
              </p>
            </div>

            <div className="flex w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white lg:w-[360px]">
              <Search className="h-4 w-4 shrink-0 text-[#92998e]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search username or display name..."
                className="h-10 w-full min-w-0 bg-transparent px-2 text-[11px] text-[#202a20] outline-none placeholder:text-[#92998e] sm:text-xs"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="shrink-0 text-[#92998e] transition hover:text-[#315d32]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:p-3">
            {FILTERS.map(([value, label]) => {
              const active = statusFilter === value;

              return (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStatusFilter(value)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[8px] font-bold transition-all sm:px-3.5 sm:text-xs ${
                    active
                      ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                      : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
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
              {statusFilter === "all"
                ? "All Staff"
                : `${statusFilter === "active" ? "Active" : "Inactive"} Staff`}
            </h3>

            <p className="mt-0.5 text-[9px] text-[#92998e] sm:text-xs">
              Showing {filteredStaff.length} of {staff.length} members
            </p>
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] font-bold text-[#315d32] sm:flex sm:text-xs">
            <CheckCircle2 size={15} />
            API Connected
          </div>
        </motion.div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[18px] border border-[#dceacb] bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#315d32]" />
              <p className="text-xs font-semibold text-[#92998e]">
                Loading staff...
              </p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-10 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <Users size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              No staff found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#92998e] sm:text-sm sm:leading-6">
              Try changing your search or status filter.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openAddModal}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] transition hover:bg-[#274d29]"
            >
              <Plus size={14} />
              Add staff
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            className="grid w-full min-w-0 grid-cols-1 gap-2 sm:gap-3"
          >
            {filteredStaff.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                onView={() => openViewModal(member)}
                onEdit={() => openEditModal(member)}
                onDelete={() => openDeleteModal(member)}
              />
            ))}
          </motion.div>
        )}

        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-xl border border-[#dceacb] bg-white px-4 py-2 text-xs font-bold text-[#667065] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <div className="rounded-xl bg-[#315d32] px-4 py-2 text-xs font-bold text-white">
              {meta.page} / {meta.totalPages}
            </div>

            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-xl border border-[#dceacb] bg-white px-4 py-2 text-xs font-bold text-[#667065] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <ModalShell
          eyebrow={editingStaff ? "Edit staff member" : "New staff member"}
          title={editingStaff ? editingStaff.displayName : "Add staff"}
          subtitle={
            editingStaff
              ? "Update staff account information."
              : "Create a new staff account."
          }
          onClose={() => !saving && setModalOpen(false)}
          footer={
            <>
              <ModalButton
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </ModalButton>

              <ModalButton
                primary
                type="submit"
                form="staff-form"
                disabled={saving}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : editingStaff
                  ? "Update staff"
                  : "Create staff"}
              </ModalButton>
            </>
          }
        >
          <form
            id="staff-form"
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4"
          >
            <FormField label="Username" required>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92998e]" />

                <input
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  placeholder="Enter username"
                  disabled={Boolean(editingStaff)}
                  className={`${inputClass} pl-9 ${
                    editingStaff ? "cursor-not-allowed opacity-60" : ""
                  }`}
                />
              </div>
            </FormField>

            <FormField
              label={editingStaff ? "Password (optional)" : "Password"}
              required={!editingStaff}
            >
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92998e]" />

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder={
                    editingStaff
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
            </FormField>

            <FormField label="Display name" required>
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleFormChange}
                placeholder="Enter display name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Account status">
              <div className="grid grid-cols-2 gap-2">
                {[
                  [true, "Active"],
                  [false, "Inactive"],
                ].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: value,
                      }))
                    }
                    className={`h-11 rounded-xl text-xs font-bold transition ${
                      form.isActive === value
                        ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                        : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FormField>
          </form>
        </ModalShell>
      )}

      {viewModalOpen && selectedStaff && (
        <ModalShell
          eyebrow="Staff details"
          title={selectedStaff.displayName}
          subtitle={`@${selectedStaff.username}`}
          badge={
            <StatusBadge
              status={selectedStaff.isActive ? "Active" : "Inactive"}
            />
          }
          onClose={() => setViewModalOpen(false)}
          footer={
            <>
              <ModalButton onClick={() => setViewModalOpen(false)}>
                Close
              </ModalButton>

              <ModalButton
                primary
                onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(selectedStaff);
                }}
              >
                <Pencil size={13} />
                Edit staff
              </ModalButton>
            </>
          }
        >
          <div className="flex flex-col items-center rounded-xl border border-[#dceacb] bg-[#eef5e7] p-5 sm:p-7">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#315d32] text-white shadow-[0_10px_25px_rgba(49,93,50,0.18)]">
              <UserRound size={34} />
            </div>

            <h3 className="mt-3 text-lg font-black text-[#202a20]">
              {selectedStaff.displayName}
            </h3>

            <p className="mt-1 text-xs text-[#92998e]">
              @{selectedStaff.username}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <DetailBox
              icon={AtSign}
              label="Username"
              value={selectedStaff.username}
            />

            <DetailBox
              icon={CheckCircle2}
              label="Status"
              value={selectedStaff.isActive ? "Active" : "Inactive"}
            />

            <DetailBox
              icon={CalendarDays}
              label="Created"
              value={formatDate(selectedStaff.createdAt)}
            />

            <DetailBox
              icon={RefreshCw}
              label="Updated"
              value={formatDate(selectedStaff.updatedAt)}
            />
          </div>
        </ModalShell>
      )}

      {deleteModalOpen && selectedStaff && (
        <ModalShell
          eyebrow="Confirm action"
          title="Delete staff?"
          subtitle={selectedStaff.displayName}
          onClose={() => !deleting && setDeleteModalOpen(false)}
          footer={
            <>
              <ModalButton
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </ModalButton>

              <ModalButton
                danger
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && (
                  <Loader2 size={14} className="animate-spin" />
                )}

                {deleting ? "Deleting..." : "Delete"}
              </ModalButton>
            </>
          }
        >
          <div className="rounded-xl border border-[#efd3d0] bg-[#f8ecea] p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#b35a54]">
                <Trash2 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-[#202a20]">
                  This action can't be undone
                </p>

                <p className="mt-1 text-xs leading-5 text-[#92998e]">
                  Are you sure you want to delete{" "}
                  <strong className="break-words text-[#202a20]">
                    {selectedStaff.displayName}
                  </strong>
                  ?
                </p>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </motion.div>
  );
}

function StaffCard({
  member,
  onView,
  onEdit,
  onDelete,
}) {
  const isActive = member.isActive === true;

  const stop = (fn) => (event) => {
    event.stopPropagation();
    fn();
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onView}
      className="group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-[16px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px]"
    >
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#315d32] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
        <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">

          <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eef5e7] text-[#315d32] sm:h-[72px] sm:w-[72px] sm:rounded-2xl">
              <UserRound className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-1.5">
                <h4 className="min-w-0 flex-1 truncate text-[12px] font-black text-[#202a20] sm:text-base">
                  {member.displayName}
                </h4>

                <span className="shrink-0 lg:hidden">
                  <StatusBadge
                    status={isActive ? "Active" : "Inactive"}
                  />
                </span>
              </div>

              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <AtSign
                  size={11}
                  className="shrink-0 text-[#315d32]"
                />

                <p className="truncate text-[9px] font-semibold text-[#92998e] sm:text-xs">
                  {member.username}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#eef5e7] px-2.5 py-1 text-[8px] font-bold text-[#315d32] sm:text-[10px]">
                  Staff account
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f8f2] px-2.5 py-1 text-[8px] font-bold text-[#667065] sm:text-[10px]">
                  Created {formatDate(member.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <StatusBadge
              status={isActive ? "Active" : "Inactive"}
            />

            <div className="flex items-center gap-2">
              <ActionButton
                icon={Eye}
                label="View"
                onClick={stop(onView)}
              />

              <ActionButton
                icon={Pencil}
                label="Edit"
                onClick={stop(onEdit)}
              />

              <ActionButton
                icon={Trash2}
                label="Delete"
                danger
                onClick={stop(onDelete)}
              />
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f8f2] text-[#92998e] transition-all group-hover:bg-[#eef5e7] group-hover:text-[#315d32]">
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 border-t border-[#edf1e9] pt-2.5 sm:gap-2 sm:pt-3 lg:hidden">
            <MobileAction
              icon={Eye}
              label="View"
              onClick={stop(onView)}
            />

            <MobileAction
              icon={Pencil}
              label="Edit"
              onClick={stop(onEdit)}
            />

            <MobileAction
              icon={Trash2}
              label="Delete"
              danger
              onClick={stop(onDelete)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const Icon =
    status === "Active" ? CheckCircle2 : XCircle;

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      className={`inline-flex max-w-full min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-black sm:min-h-7 sm:gap-1.5 sm:px-2.5 sm:text-[9px] ${
        STATUS_STYLE[status]
      }`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
      <span className="truncate">{status}</span>
    </motion.span>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  danger = false,
}) {
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

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3">
      <Icon size={16} className="text-[#315d32]" />

      <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-[#202a20]">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${
        danger
          ? "border-[#efd3d0] bg-[#fff8f7] text-[#b35a54] hover:border-[#b35a54] hover:bg-[#f8ecea]"
          : "border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function MobileAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border text-[9px] font-bold transition active:scale-[0.97] sm:h-10 sm:gap-1.5 sm:text-xs ${
        danger
          ? "border-[#efd3d0] bg-[#fff8f7] text-[#b35a54]"
          : "border-[#dceacb] bg-white text-[#667065]"
      }`}
    >
      <Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
        {label}

        {required && (
          <span className="ml-0.5 text-[#b35a54]">*</span>
        )}
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
  type = "button",
  form,
}) {
  const style = primary
    ? "bg-[#315d32] text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] hover:bg-[#274d29]"
    : danger
    ? "bg-[#b35a54] text-white shadow-[0_8px_20px_rgba(179,90,84,0.2)] hover:bg-[#9c4b46]"
    : "border border-[#dceacb] text-[#667065] hover:border-[#315d32] hover:bg-[#f7f8f2]";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      form={form}
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
        onClick={(event) => event.stopPropagation()}
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
              whileHover={{
                scale: 1.08,
                rotate: 5,
              }}
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
