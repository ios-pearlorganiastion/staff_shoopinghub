import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers3,
  Boxes,
  Tag,
  Package,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoriesApis";

import { getProducts } from "../api/productApis";
import { useToast } from "../components/ui/Toast";

/* =========================================================
   HELPERS (logic unchanged)
========================================================= */

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

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
  "h-11 w-full rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 text-xs font-semibold text-[#202a20] outline-none transition placeholder:font-normal placeholder:text-[#92998e] sm:text-sm";

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Categories() {
  const showToast = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();
      setCategories(normalizeList(response));
    } catch (err) {
      setError(err?.message || "Unable to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const response = await getProducts({ limit: 1000 });
      const products = normalizeList(response);

      const counts = {};

      products.forEach((product) => {
        const categoryId =
          product.categoryId ||
          product.category?.id ||
          product.category_id;

        if (!categoryId) return;

        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });

      setProductCounts(counts);
    } catch {
      setProductCounts({});
    }
  };

  useEffect(() => {
    loadCategories();
    loadProductCounts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCategories(), loadProductCounts()]);
    setRefreshing(false);
    showToast("Categories refreshed");
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const name = category.name || "";
      const description = category.description || "";
      const slug = category.slug || "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        slug.toLowerCase().includes(query);

      const isActive = category.isActive !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive !== false
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.isActive === false
  ).length;

  const totalProducts = Object.values(productCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError("");
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });

    setSlugTouched(true);
    setFormError("");
    setImageFile(null);
    setImagePreview(category.imageUrl || "");
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "slug") {
      setSlugTouched(true);
    }

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "name" && !slugTouched) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setFormError("Slug is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingCategory) {
        formData.append("isActive", String(form.isActive));

        await updateCategory(editingCategory.id, formData);

        showToast("Category updated successfully");
      } else {
        if (!form.isActive) {
          formData.append("isActive", "false");
        }

        await createCategory(formData);

        showToast("Category created successfully");
      }

      setModalOpen(false);

      await Promise.all([loadCategories(), loadProductCounts()]);
    } catch (err) {
      setFormError(err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setDeleteError("");

    try {
      setDeleting(true);

      await deleteCategory(selectedCategory.id);

      setDeleteModalOpen(false);
      setSelectedCategory(null);

      showToast("Category deleted successfully");

      await Promise.all([loadCategories(), loadProductCounts()]);
    } catch (err) {
      setDeleteError(err?.message || "Unable to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (category) => {
    const nextIsActive = !(category.isActive !== false);

    setCategories((prev) =>
      prev.map((item) =>
        item.id === category.id ? { ...item, isActive: nextIsActive } : item
      )
    );

    try {
      await updateCategory(category.id, {
        isActive: nextIsActive,
      });

      showToast(
        nextIsActive
          ? "Category activated successfully"
          : "Category deactivated successfully"
      );
    } catch (err) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? { ...item, isActive: category.isActive }
            : item
        )
      );

      showToast(err?.message || "Unable to update status.", "error");
    }
  };

  const openViewModal = (category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="box-border w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7f8f2] pb-5 sm:pb-8"
    >
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-3 px-2 sm:space-y-5 sm:px-3 md:px-4 lg:space-y-6 lg:px-5">
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
                <Layers3 className="h-4 w-4 sm:h-6 sm:w-6" />
              </motion.div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 sm:mb-1.5 sm:gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] sm:h-2 sm:w-2"
                  />

                  <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-[10px]">
                    Catalog management
                  </span>
                </div>

                <h1 className="text-[20px] font-black tracking-tight sm:text-3xl lg:text-[34px]">
                  Categories
                </h1>

                <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                  Manage your store categories, product grouping, images and
                  category status from one beautiful workspace.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={openAddModal}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add category
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* STATS */}
        <motion.div
          variants={pageVariants}
          className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
        >
          <StatCard
            label="Total categories"
            value={totalCategories}
            icon={Layers3}
            description="All catalog categories"
          />

          <StatCard
            label="Active"
            value={activeCategories}
            icon={CheckCircle2}
            description="Visible in store"
          />

          <StatCard
            label="Inactive"
            value={inactiveCategories}
            icon={XCircle}
            description="Hidden from store"
            danger
          />

          <StatCard
            label="Products"
            value={totalProducts}
            icon={Boxes}
            description="Across all categories"
          />
        </motion.div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#b35a54]" />
            <span className="min-w-0 break-words">{error}</span>
          </motion.div>
        )}

        {/* SEARCH + FILTERS */}
        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
              Category catalog
            </p>

            <div className="flex w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white lg:w-[360px]">
              <Search className="h-4 w-4 shrink-0 text-[#92998e]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, slug or description..."
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

        {/* LIST HEADING */}
        {!loading && (
          <motion.div
            variants={itemVariants}
            className="flex items-end justify-between px-0.5 sm:px-1"
          >
            <div>
              <h3 className="text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
                {statusFilter === "all"
                  ? "All Categories"
                  : `${statusFilter === "active" ? "Active" : "Inactive"} Categories`}
              </h3>

              <p className="mt-0.5 text-[9px] text-[#92998e] sm:text-xs">
                Showing {filteredCategories.length} of {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>
            </div>

            <div className="hidden items-center gap-1.5 text-[10px] font-bold text-[#315d32] sm:flex sm:text-xs">
              <CheckCircle2 size={15} />
              Updated
            </div>
          </motion.div>
        )}

        {/* CONTENT */}
        {loading ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-12 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-16"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              Loading categories...
            </h3>

            <p className="mt-1 text-xs text-[#92998e] sm:text-sm">
              Fetching your latest category data
            </p>
          </motion.div>
        ) : filteredCategories.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-10 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <Layers3 size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              No categories found
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
              Add category
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            className="grid w-full min-w-0 grid-cols-1 gap-2 sm:gap-3"
          >
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isActive={category.isActive !== false}
                productCount={productCounts[category.id] || 0}
                onView={() => openViewModal(category)}
                onEdit={() => openEditModal(category)}
                onDelete={() => openDeleteModal(category)}
                onToggle={() => toggleStatus(category)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <ModalShell
          eyebrow={editingCategory ? "Edit category" : "New category"}
          title={editingCategory ? editingCategory.name || "Edit category" : "Add category"}
          subtitle={
            editingCategory
              ? "Update category details and catalog settings."
              : "Create a new category for your store catalog."
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
                form="category-form"
                disabled={saving}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update category"
                  : "Create category"}
              </ModalButton>
            </>
          }
        >
          <form
            id="category-form"
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4"
          >
            {formError && (
              <div className="rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:text-sm">
                {formError}
              </div>
            )}

            <FormField label="Category name" required>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter category name"
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Slug"
              required
              hint="Auto-filled from the category name."
            >
              <input
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                placeholder="category-slug"
                className={inputClass}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Enter category description"
                rows={3}
                className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
              />
            </FormField>

            <FormField label="Category photo" hint="Supports JPG, PNG or WEBP.">
              <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {imagePreview ? (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#dceacb] bg-[#eef5e7]">
                      <img
                        src={imagePreview}
                        alt="Category"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[#dceacb] bg-white text-[#92998e] transition hover:border-[#315d32] hover:text-[#315d32]"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#202a20]">
                      Category image
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[#92998e]">
                      Add a clean category image to make your catalog easier to
                      recognize.
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 inline-flex h-8 items-center rounded-lg border border-[#dceacb] bg-white px-3 text-[10px] font-bold text-[#315d32] transition hover:border-[#315d32] hover:bg-[#eef5e7]"
                    >
                      {imagePreview ? "Change photo" : "Add photo"}
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </FormField>

            <FormField label="Status">
              <div className="grid grid-cols-2 gap-2">
                {[
                  [true, "Active"],
                  [false, "Inactive"],
                ].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, isActive: value }))
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

      {/* VIEW MODAL */}
      {viewModalOpen && selectedCategory && (
        <ModalShell
          eyebrow="Category details"
          title={selectedCategory.name}
          subtitle={selectedCategory.slug}
          badge={
            <StatusBadge
              status={selectedCategory.isActive !== false ? "Active" : "Inactive"}
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
                  openEditModal(selectedCategory);
                }}
              >
                <Pencil size={13} />
                Edit category
              </ModalButton>
            </>
          }
        >
          <div className="overflow-hidden rounded-xl border border-[#dceacb] bg-[#eef5e7]">
            <div className="flex h-44 items-center justify-center sm:h-52">
              {selectedCategory.imageUrl ? (
                <img
                  src={selectedCategory.imageUrl}
                  alt={selectedCategory.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#92998e]">
                  <ImageIcon className="h-9 w-9" />
                  <span className="text-xs font-medium">No category image</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-2.5 sm:p-3">
              <Tag size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
                Category
              </p>

              <p className="mt-1 truncate text-sm font-black text-[#202a20]">
                {selectedCategory.name}
              </p>
            </div>

            <div className="rounded-xl border border-[#dceacb] bg-[#eef5e7] p-2.5 sm:p-3">
              <Package size={16} className="text-[#315d32]" />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#315d32]">
                Products
              </p>

              <p className="mt-1 text-base font-black text-[#202a20]">
                {productCounts[selectedCategory.id] || 0}
              </p>
            </div>
          </div>

          <div className="mt-2.5 rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:mt-3 sm:p-4">
            <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
              Description
            </p>

            <p className="mt-1.5 text-[11px] leading-5 text-[#202a20] sm:text-sm sm:leading-6">
              {selectedCategory.description || "No description available."}
            </p>
          </div>
        </ModalShell>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedCategory && (
        <ModalShell
          eyebrow="Confirm action"
          title="Delete category?"
          subtitle={selectedCategory.name}
          onClose={() => !deleting && setDeleteModalOpen(false)}
          footer={
            <>
              <ModalButton
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </ModalButton>

              <ModalButton danger onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 size={14} className="animate-spin" />}
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
                    {selectedCategory.name}
                  </strong>
                  ?
                </p>
              </div>
            </div>
          </div>

          {deleteError && (
            <div className="mt-3 rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:text-sm">
              {deleteError}
            </div>
          )}
        </ModalShell>
      )}
    </motion.div>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({
  category,
  isActive,
  productCount,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) {
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
          {/* Image + content */}
          <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#dceacb] bg-[#eef5e7] sm:h-[72px] sm:w-[72px] sm:rounded-2xl">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#92998e]">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-1.5">
                <h4 className="min-w-0 flex-1 truncate text-[12px] font-black text-[#202a20] sm:text-base">
                  {category.name}
                </h4>

                <span className="shrink-0 lg:hidden">
                  <StatusBadge status={isActive ? "Active" : "Inactive"} />
                </span>
              </div>

              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <Tag size={11} className="shrink-0 text-[#315d32]" />

                <p className="truncate text-[9px] font-semibold text-[#92998e] sm:text-xs">
                  {category.slug || "No slug available"}
                </p>
              </div>

              <p className="mt-1.5 line-clamp-2 max-w-2xl text-[10px] leading-4 text-[#92998e] sm:text-xs sm:leading-5">
                {category.description || "No description available"}
              </p>

              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eef5e7] px-2.5 py-1 text-[8px] font-bold text-[#315d32] sm:text-[10px]">
                <Package className="h-3 w-3" />
                {productCount} {productCount === 1 ? "product" : "products"}
              </span>
            </div>
          </div>

          {/* Desktop status + actions */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <button
              type="button"
              onClick={stop(onToggle)}
              title="Click to toggle status"
              className="rounded-full"
            >
              <StatusBadge status={isActive ? "Active" : "Inactive"} />
            </button>

            <div className="flex items-center gap-2">
              <ActionButton icon={Eye} label="View" onClick={stop(onView)} />
              <ActionButton icon={Pencil} label="Edit" onClick={stop(onEdit)} />
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

          {/* Mobile / tablet actions */}
          <div className="grid grid-cols-4 gap-1.5 border-t border-[#edf1e9] pt-2.5 sm:gap-2 sm:pt-3 lg:hidden">
            <MobileAction icon={Eye} label="View" onClick={stop(onView)} />
            <MobileAction icon={Pencil} label="Edit" onClick={stop(onEdit)} />
            <MobileAction
              icon={isActive ? XCircle : CheckCircle2}
              label={isActive ? "Disable" : "Enable"}
              onClick={stop(onToggle)}
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

/* =========================================================
   SMALL UI PIECES
========================================================= */

function StatusBadge({ status }) {
  const Icon = status === "Active" ? CheckCircle2 : XCircle;

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

function ActionButton({ icon: Icon, label, onClick, danger = false }) {
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

function MobileAction({ icon: Icon, label, onClick, danger = false }) {
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

function FormField({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
        {label}
        {required && <span className="ml-0.5 text-[#b35a54]">*</span>}
      </label>

      {children}

      {hint && <p className="mt-1 text-[10px] text-[#92998e]">{hint}</p>}
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