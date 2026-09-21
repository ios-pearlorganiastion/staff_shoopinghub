import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers3,
  Boxes,
  Tag,
  ChevronDown,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoriesApis";
import { getProducts } from "../api/productApis";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, Select } from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";

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

export default function Categories() {
  const showToast = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
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
      setCategories(normalizeList(await getCategories()));
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const products = normalizeList(await getProducts({ limit: 1000 }));
      const counts = {};

      products.forEach((product) => {
        const categoryId = product.categoryId || product.category?.id;

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

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const name = category.name || "";
      const description = category.description || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());

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
      return setFormError("Category name is required.");
    }

    if (!form.slug.trim()) {
      return setFormError("Slug is required.");
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

      await loadCategories();
    } catch (err) {
      setFormError(err.message);
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

      await loadCategories();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (category) => {
    const nextIsActive = !(category.isActive !== false);

    setCategories((prev) =>
      prev.map((item) =>
        item.id === category.id
          ? {
              ...item,
              isActive: nextIsActive,
            }
          : item
      )
    );

    try {
      await updateCategory(category.id, {
        isActive: nextIsActive,
      });
    } catch (err) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? {
                ...item,
                isActive: category.isActive,
              }
            : item
        )
      );

      showToast(err.message, "error");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 overflow-hidden pb-8 sm:space-y-6 lg:space-y-7">
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-5 py-6 text-white shadow-lg shadow-brand-600/10 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/70" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]">
                Catalog organization
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Categories
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Organize your store catalog with categories, descriptions,
              images and product grouping from one place.
            </p>
          </div>

          <Button
            icon={Plus}
            onClick={openAddModal}
            className="h-11 w-full justify-center !border-0 !bg-white !text-brand-700 shadow-md hover:!bg-brand-50 sm:w-auto"
          >
            Add category
          </Button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <HeaderMetric
            icon={Layers3}
            label="Categories"
            value={totalCategories}
          />

          <HeaderMetric
            icon={CheckCircle2}
            label="Active"
            value={activeCategories}
          />

          <HeaderMetric
            icon={XCircle}
            label="Inactive"
            value={inactiveCategories}
          />

          <HeaderMetric
            icon={Boxes}
            label="Products"
            value={totalProducts}
          />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-line px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-extrabold text-ink sm:text-lg">
              Category catalog
            </h3>

            <p className="text-xs text-ink-faint">
              Search categories or filter them by their current status.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-line bg-paper px-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 min-w-0 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>

            <div className="relative w-full lg:w-[220px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3 pr-9 text-sm font-semibold text-ink-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="overflow-hidden rounded-[22px] border border-slate-200 p-8 sm:p-14">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>

            <p className="mt-4 text-sm font-bold text-ink">
              Loading categories...
            </p>

            <p className="mt-1 text-xs text-ink-faint">
              Fetching your latest category data
            </p>
          </div>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <EmptyState
            icon={Layers3}
            title="No categories found"
            description="Try changing your search or status filter."
            action={
              <Button icon={Plus} onClick={openAddModal}>
                Add category
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredCategories.map((category) => {
            const isActive = category.isActive !== false;
            const productCount = productCounts[category.id] || 0;

            return (
              <Card
                key={category.id}
                className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
              >
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50 sm:h-[76px] sm:w-[76px]">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-ink-faint" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="max-w-full truncate text-base font-extrabold text-ink sm:text-lg">
                            {category.name}
                          </h3>

                          <Badge tone={isActive ? "brand" : "neutral"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <p className="mt-1 truncate text-xs font-medium text-ink-soft sm:text-[13px]">
                          {category.slug || "No slug available"}
                        </p>

                        <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-ink-faint sm:text-[13px]">
                          {category.description || "No description available"}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                            {productCount}{" "}
                            {productCount === 1 ? "product" : "products"}
                          </span>

                          <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold text-ink-faint">
                            Category catalog
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 xl:flex xl:shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => {
                          setSelectedCategory(category);
                          setViewModalOpen(true);
                        }}
                        className="w-full justify-center"
                      >
                        <span>View</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEditModal(category)}
                        className="w-full justify-center"
                      >
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="dangerGhost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => {
                          setSelectedCategory(category);
                          setDeleteError("");
                          setDeleteModalOpen(true);
                        }}
                        className="w-full justify-center"
                      >
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="hidden md:block">
                      <div className="grid grid-cols-4 border-b border-line bg-brand-50/60">
                        <div className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                          Category
                        </div>

                        <div className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                          Description
                        </div>

                        <div className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                          Products
                        </div>

                        <div className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                          Status
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center">
                        <div className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                              <Tag className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-extrabold text-ink">
                                {category.name}
                              </p>

                              <p className="truncate text-[9px] text-ink-faint">
                                {category.slug}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-4">
                          <p className="line-clamp-2 text-xs leading-5 text-ink-soft">
                            {category.description || "No description"}
                          </p>
                        </div>

                        <div className="px-4 py-4 text-center">
                          <Badge tone="brand">{productCount}</Badge>
                        </div>

                        <div className="px-4 py-4 text-right">
                          <button
                            onClick={() => toggleStatus(category)}
                            className="inline-flex"
                          >
                            <Badge
                              tone={isActive ? "brand" : "rose"}
                              dot
                            >
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-line/70 md:hidden">
                      <div className="grid grid-cols-2 gap-3 p-3.5">
                        <div className="rounded-xl bg-brand-50/60 p-3">
                          <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                            Products
                          </p>

                          <p className="mt-1 text-sm font-extrabold text-ink">
                            {productCount}
                          </p>
                        </div>

                        <div className="rounded-xl bg-brand-50/60 p-3">
                          <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                            Status
                          </p>

                          <button
                            onClick={() => toggleStatus(category)}
                            className="mt-1"
                          >
                            <Badge
                              tone={isActive ? "brand" : "rose"}
                              dot
                            >
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-faint">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      <span>Category management</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => {
                        setSelectedCategory(category);
                        setViewModalOpen(true);
                      }}
                      className="w-full justify-center sm:w-auto"
                    >
                      View category details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editingCategory ? "Edit category" : "Add category"}
          description={
            editingCategory
              ? "Update category details."
              : "Create a new store category."
          }
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="category-form"
                loading={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update category"
                  : "Create category"}
              </Button>
            </>
          }
        >
          <form id="category-form" onSubmit={handleSubmit}>
            {formError && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-500">
                {formError}
              </div>
            )}

            <Field label="Category name" required>
              <Input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter category name"
              />
            </Field>

            <Field
              label="Slug"
              required
              hint="Auto-filled from the name — edit it directly if you need something different."
            >
              <Input
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                placeholder="category-slug"
              />
            </Field>

            <Field label="Description">
              <Textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Enter category description"
              />
            </Field>

            <Field
              label="Category photo"
              hint="Supports JPG, PNG or WEBP."
            >
              <div className="rounded-2xl border border-line bg-paper/50 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {imagePreview ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
                      <img
                        src={imagePreview}
                        alt="Category"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-line bg-white text-ink-soft transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink">
                      Category image
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-ink-faint">
                      Add a clean category image to make the catalog easier
                      to recognize.
                    </p>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="mt-2"
                    >
                      {imagePreview ? "Change photo" : "Add photo"}
                    </Button>
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
            </Field>

            <Field label="Status">
              <Select
                name="isActive"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.value === "active",
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </form>
        </Modal>
      )}

      {viewModalOpen && selectedCategory && (
        <Modal
          title={selectedCategory.name}
          description={selectedCategory.slug}
          onClose={() => setViewModalOpen(false)}
          width="sm"
        >
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
            <div className="flex h-44 items-center justify-center sm:h-52">
              {selectedCategory.imageUrl ? (
                <img
                  src={selectedCategory.imageUrl}
                  alt={selectedCategory.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-faint">
                  <ImageIcon className="h-9 w-9" />
                  <span className="text-xs font-medium">
                    No category image
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge
              tone={
                selectedCategory.isActive !== false
                  ? "brand"
                  : "rose"
              }
              dot
            >
              {selectedCategory.isActive !== false
                ? "Active"
                : "Inactive"}
            </Badge>

            <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold text-brand-700">
              {productCounts[selectedCategory.id] || 0} products
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {selectedCategory.description ||
                "No description available."}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-50/70 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                Category
              </p>

              <p className="mt-1 truncate text-xs font-extrabold text-ink">
                {selectedCategory.name}
              </p>
            </div>

            <div className="rounded-xl bg-brand-50/70 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                Products
              </p>

              <p className="mt-1 text-xs font-extrabold text-ink">
                {productCounts[selectedCategory.id] || 0}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {deleteModalOpen && selectedCategory && (
        <Modal
          title="Delete category?"
          onClose={() => setDeleteModalOpen(false)}
          width="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500">
                <Trash2 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-bold text-ink">
                  Delete this category?
                </p>

                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  Are you sure you want to delete{" "}
                  <strong className="font-extrabold text-ink">
                    {selectedCategory.name}
                  </strong>
                  ?
                </p>
              </div>
            </div>
          </div>

          {deleteError && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-500">
              {deleteError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function HeaderMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-brand-700/60 p-3 transition duration-300 hover:bg-brand-700/80 sm:p-3.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-white/70" />

        <p className="text-[9px] font-semibold uppercase tracking-wide text-white/65">
          {label}
        </p>
      </div>

      <p className="mt-1 text-base font-extrabold sm:text-lg">
        {value}
      </p>
    </div>
  );
}