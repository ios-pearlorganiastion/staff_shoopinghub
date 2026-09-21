
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Tag,
  Package,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../api/brandApis";
import { getProducts } from "../api/productApis";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Field";
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
  isActive: true,
};

export default function Brand() {
  const showToast = useToast();

  const [brands, setBrands] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");
      setBrands(normalizeList(await getBrands()));
    } catch (err) {
      setError(err.message);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductCounts = async () => {
    try {
      const products = normalizeList(
        await getProducts({
          limit: 1000,
        })
      );

      const counts = {};

      products.forEach((product) => {
        const brandId = product.brandId || product.brand?.id;

        if (!brandId) return;

        counts[brandId] = (counts[brandId] || 0) + 1;
      });

      setProductCounts(counts);
    } catch {
      setProductCounts({});
    }
  };

  useEffect(() => {
    loadBrands();
    loadProductCounts();
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const name = brand.name || "";
      const slug = brand.slug || "";

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        slug.toLowerCase().includes(searchValue);

      const isActive = brand.isActive !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const totalBrands = brands.length;

  const activeBrands = brands.filter(
    (brand) => brand.isActive !== false
  ).length;

  const inactiveBrands = brands.filter(
    (brand) => brand.isActive === false
  ).length;

  const totalProducts = Object.values(productCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const openAddModal = () => {
    setEditingBrand(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);

    setForm({
      name: brand.name || "",
      slug: brand.slug || "",
      isActive: brand.isActive !== false,
    });

    setSlugTouched(true);
    setFormError("");
    setModalOpen(true);
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
      return setFormError("Brand name is required.");
    }

    if (!form.slug.trim()) {
      return setFormError("Slug is required.");
    }

    try {
      setSaving(true);

      if (editingBrand) {
        await updateBrand(editingBrand.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          isActive: form.isActive,
        });

        showToast("Brand updated successfully");
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
        };

        if (!form.isActive) {
          payload.isActive = false;
        }

        await createBrand(payload);

        showToast("Brand created successfully");
      }

      setModalOpen(false);

      await loadBrands();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    setDeleteError("");

    try {
      setDeleting(true);

      await deleteBrand(selectedBrand.id);

      setDeleteModalOpen(false);
      setSelectedBrand(null);

      showToast("Brand deleted successfully");

      await loadBrands();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (brand) => {
    const nextIsActive = !(brand.isActive !== false);

    setBrands((prev) =>
      prev.map((item) =>
        item.id === brand.id
          ? {
              ...item,
              isActive: nextIsActive,
            }
          : item
      )
    );

    try {
      await updateBrand(brand.id, {
        isActive: nextIsActive,
      });
    } catch (err) {
      setBrands((prev) =>
        prev.map((item) =>
          item.id === brand.id
            ? {
                ...item,
                isActive: brand.isActive,
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

              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 sm:text-[11px]">
                Catalog management
              </span>

            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Brands
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Manage your store brands, product associations and availability
              from one place.
            </p>

          </div>

          <Button
            icon={Plus}
            onClick={openAddModal}
            className="h-11 w-full justify-center !border-0 !bg-white !text-brand-700 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:!bg-brand-50 sm:w-auto"
          >
            Add brand
          </Button>

        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">

          <HeaderMetric
            label="Total brands"
            value={totalBrands}
          />

          <HeaderMetric
            label="Active"
            value={activeBrands}
          />

          <HeaderMetric
            label="Inactive"
            value={inactiveBrands}
          />

          <HeaderMetric
            label="Products"
            value={totalProducts}
          />

        </div>

      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <MiniStat
          icon={Tag}
          label="Total brands"
          value={totalBrands}
        />

        <MiniStat
          icon={CheckCircle2}
          label="Active brands"
          value={activeBrands}
        />

        <MiniStat
          icon={XCircle}
          label="Inactive"
          value={inactiveBrands}
          danger
        />

        <MiniStat
          icon={Package}
          label="Products"
          value={totalProducts}
        />

      </div>

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-line px-4 py-4 sm:px-5 sm:py-5">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Brand directory
              </h2>

              <p className="mt-1 text-xs text-ink-faint">
                Search and manage all your store brands
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-ink-faint sm:mt-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {filteredBrands.length} results
            </div>

          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">

            <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-line bg-paper px-3 transition-all duration-200 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-50">

              <Search className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                type="text"
                placeholder="Search brands or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 min-w-0 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />

            </div>

            <div className="relative w-full lg:w-[220px]">

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3 pr-9 text-sm font-semibold text-ink-soft outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
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
        <Card className="overflow-hidden rounded-[22px] border border-slate-200 p-10 sm:p-14">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
            </div>

            <p className="mt-4 text-sm font-bold text-ink">
              Loading brands...
            </p>

            <p className="mt-1 text-xs text-ink-faint">
              Fetching your latest brand catalog
            </p>

          </div>

        </Card>
      ) : filteredBrands.length === 0 ? (
        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <EmptyState
            icon={Tag}
            title="No brands found"
            description="Try changing your search or status filter."
            action={
              <Button
                icon={Plus}
                onClick={openAddModal}
              >
                Add brand
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="hidden md:block">

            <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-line bg-brand-50/50 px-5 py-4">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                      All brands
                    </p>

                    <p className="mt-1 text-[10px] text-ink-faint">
                      Manage brand information and product associations
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-brand-700 shadow-sm">
                    {filteredBrands.length} brands
                  </span>

                </div>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[760px]">

                  <thead>
                    <tr className="border-b border-line bg-paper/70">

                      <th className="px-5 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        Brand
                      </th>

                      <th className="px-5 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        Slug
                      </th>

                      <th className="px-5 py-3.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        Products
                      </th>

                      <th className="px-5 py-3.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredBrands.map((brand) => {

                      const isActive = brand.isActive !== false;
                      const productCount = productCounts[brand.id] || 0;

                      return (
                        <tr
                          key={brand.id}
                          className="group border-b border-line/60 transition-all duration-200 last:border-0 hover:bg-brand-50/30"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-100 bg-brand-50 text-brand-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-100">
                                <Tag className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-extrabold text-ink">
                                  {brand.name}
                                </p>

                                <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                                  ID: {brand.id}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span className="inline-flex max-w-[220px] truncate rounded-lg bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-soft">
                              {brand.slug}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-center">

                            <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-brand-50 px-2.5 py-1.5 text-xs font-extrabold text-brand-700">
                              {productCount}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-center">

                            <button
                              onClick={() => toggleStatus(brand)}
                              className="transition hover:scale-105"
                            >
                              <Badge
                                tone={isActive ? "brand" : "rose"}
                                dot
                              >
                                {isActive ? "Active" : "Inactive"}
                              </Badge>
                            </button>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-1">

                              <IconAction
                                icon={Eye}
                                label="View"
                                onClick={() => {
                                  setSelectedBrand(brand);
                                  setViewModalOpen(true);
                                }}
                              />

                              <IconAction
                                icon={Pencil}
                                label="Edit"
                                onClick={() => openEditModal(brand)}
                              />

                              <IconAction
                                icon={Trash2}
                                label="Delete"
                                tone="danger"
                                onClick={() => {
                                  setSelectedBrand(brand);
                                  setDeleteError("");
                                  setDeleteModalOpen(true);
                                }}
                              />

                            </div>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            </Card>

          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">

            {filteredBrands.map((brand) => {

              const isActive = brand.isActive !== false;
              const productCount = productCounts[brand.id] || 0;

              return (
                <Card
                  key={brand.id}
                  className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                >

                  <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50/40 p-4">

                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-100/50" />

                    <div className="relative flex items-start gap-3">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm transition duration-300 group-hover:scale-105">
                        <Tag className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-extrabold text-ink">
                              {brand.name}
                            </h3>

                            <p className="mt-1 truncate text-[10px] text-ink-faint">
                              {brand.slug}
                            </p>

                          </div>

                          <button
                            onClick={() => toggleStatus(brand)}
                            className="shrink-0 transition hover:scale-105"
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

                    <div className="relative mt-4 grid grid-cols-2 gap-2">

                      <div className="rounded-xl border border-white/80 bg-white/80 px-3 py-3 shadow-sm">

                        <div className="flex items-center gap-1.5">

                          <Package className="h-3.5 w-3.5 text-brand-600" />

                          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                            Products
                          </p>

                        </div>

                        <p className="mt-1 text-base font-extrabold text-ink">
                          {productCount}
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/80 bg-white/80 px-3 py-3 shadow-sm">

                        <p className="text-[9px] font-bold uppercase tracking-wide text-ink-faint">
                          Status
                        </p>

                        <p className="mt-1 text-base font-extrabold text-ink">
                          {isActive ? "Available" : "Hidden"}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center justify-between border-t border-line px-4 py-3">

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                        Brand ID
                      </p>

                      <p className="mt-0.5 max-w-[130px] truncate text-[10px] font-semibold text-ink-soft">
                        {brand.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">

                      <IconAction
                        icon={Eye}
                        label="View"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setViewModalOpen(true);
                        }}
                      />

                      <IconAction
                        icon={Pencil}
                        label="Edit"
                        onClick={() => openEditModal(brand)}
                      />

                      <IconAction
                        icon={Trash2}
                        label="Delete"
                        tone="danger"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setDeleteError("");
                          setDeleteModalOpen(true);
                        }}
                      />

                    </div>

                  </div>

                </Card>
              );
            })}

          </div>
        </>
      )}

      {modalOpen && (
        <Modal
          title={editingBrand ? "Edit brand" : "Add brand"}
          description={
            editingBrand
              ? "Update brand details."
              : "Add a new brand to your catalog."
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
                form="brand-form"
                loading={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBrand
                  ? "Update brand"
                  : "Create brand"}
              </Button>
            </>
          }
        >
          <form id="brand-form" onSubmit={handleSubmit}>

            {formError && (
              <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600">
                {formError}
              </div>
            )}

            <Field label="Brand name" required>
              <Input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter brand name"
              />
            </Field>

            <Field
              label="Slug"
              required
              hint="Auto-filled from the name — edit it directly if needed."
            >
              <Input
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                placeholder="brand-slug"
              />
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

      {viewModalOpen && selectedBrand && (
        <Modal
          title={selectedBrand.name}
          description={selectedBrand.slug}
          onClose={() => setViewModalOpen(false)}
          width="sm"
        >

          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <Tag className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-extrabold text-ink">
                  {selectedBrand.name}
                </p>

                <p className="mt-1 truncate text-xs text-ink-faint">
                  {selectedBrand.slug}
                </p>

              </div>

              <Badge
                tone={
                  selectedBrand.isActive !== false
                    ? "brand"
                    : "rose"
                }
              >
                {selectedBrand.isActive !== false
                  ? "Active"
                  : "Inactive"}
              </Badge>

            </div>

          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Package className="h-4 w-4" />
              </div>

              <p className="mt-3 text-xl font-extrabold text-ink">
                {productCounts[selectedBrand.id] || 0}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-ink-faint">
                Total products
              </p>

            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {selectedBrand.isActive !== false ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>

              <p className="mt-3 text-xl font-extrabold text-ink">
                {selectedBrand.isActive !== false
                  ? "Active"
                  : "Inactive"}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-ink-faint">
                Current status
              </p>

            </div>

          </div>

        </Modal>
      )}

      {deleteModalOpen && selectedBrand && (
        <Modal
          title="Delete brand?"
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

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                <Trash2 className="h-4 w-4" />
              </div>

              <p className="text-sm leading-6 text-ink-soft">
                Are you sure you want to delete{" "}
                <strong className="text-ink">
                  {selectedBrand.name}
                </strong>
                ? Products using this brand will keep their data, but
                lose the brand association.
              </p>

            </div>

          </div>

          {deleteError && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600">
              {deleteError}
            </div>
          )}

        </Modal>
      )}

    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-brand-700/60 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700/80 sm:p-3.5">

      <div className="flex items-center justify-between gap-2">

        <p className="text-[9px] font-semibold uppercase tracking-wide text-white/65">
          {label}
        </p>

        <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white/70" />

      </div>

      <p className="mt-1 text-base font-extrabold text-white sm:text-lg">
        {value}
      </p>

    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  danger = false,
}) {
  return (
    <Card className="group rounded-[20px] border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            danger
              ? "bg-rose-50 text-rose-500"
              : "bg-brand-50 text-brand-600"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint transition group-hover:text-brand-600" />

      </div>

      <p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </p>

      <p className="mt-1 text-lg font-extrabold text-ink sm:text-xl">
        {value}
      </p>

    </Card>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
        tone === "danger"
          ? "text-ink-faint hover:bg-rose-50 hover:text-rose-500"
          : "text-ink-faint hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

