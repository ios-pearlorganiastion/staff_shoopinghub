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
import { Card, StatCard } from "../components/ui/Card";
import { Field, Input, Textarea, Select } from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";

const slugify = (value) =>
  value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const EMPTY_FORM = { name: "", slug: "", description: "", isActive: true };

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

  // /categories doesn't return a product count, so derive it from the
  // products list — best-effort: if it fails, categories still load fine
  // and just show 0 products.
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
  const activeCategories = categories.filter((c) => c.isActive !== false).length;
  const inactiveCategories = categories.filter((c) => c.isActive === false).length;
  const totalProducts = Object.values(productCounts).reduce((sum, c) => sum + c, 0);

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
    setSlugTouched(true); // existing categories already have a slug — don't auto-overwrite it
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
    if (name === "slug") setSlugTouched(true);

    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) return setFormError("Category name is required.");
    if (!form.slug.trim()) return setFormError("Slug is required.");

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());
      if (imageFile) formData.append("image", imageFile);

      if (editingCategory) {
        formData.append("isActive", String(form.isActive));
        await updateCategory(editingCategory.id, formData);
        showToast("Category updated successfully");
      } else {
        if (!form.isActive) formData.append("isActive", "false"); // only sent when it deviates from the backend default
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
      prev.map((item) => (item.id === category.id ? { ...item, isActive: nextIsActive } : item))
    );

    try {
      await updateCategory(category.id, { isActive: nextIsActive });
    } catch (err) {
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? { ...item, isActive: category.isActive } : item))
      );
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">Categories</h2>
          <p className="text-sm text-ink-soft mt-1">Manage your store categories and organize products.</p>
        </div>

        <Button icon={Plus} onClick={openAddModal}>Add category</Button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total categories" value={totalCategories} icon={Package} tone="brand" />
        <StatCard label="Active" value={activeCategories} icon={CheckCircle2} tone="brand" />
        <StatCard label="Inactive" value={inactiveCategories} icon={XCircle} tone="rose" />
        <StatCard label="Total products" value={totalProducts} icon={Package} tone="sky" />
      </div>

      <Card className="p-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center h-11 px-3 rounded-lg bg-paper border border-line focus-within:bg-white focus-within:border-brand-500">
            <Search className="w-4 h-4 text-ink-faint" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ml-2 bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-lg border border-line bg-white text-sm font-medium text-ink-soft outline-none focus:border-brand-500"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card className="p-14 text-center text-sm text-ink-soft">Loading categories...</Card>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <EmptyState icon={Package} title="No categories found" description="Try changing your search or filter." />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-paper/70">
                    {["Category", "Description", "Products", "Status", "Actions"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-ink-faint ${
                          i === 2 ? "text-center" : i === 3 ? "text-center" : i === 4 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => {
                    const isActive = category.isActive !== false;
                    const productCount = productCounts[category.id] || 0;

                    return (
                      <tr key={category.id} className="border-b border-line/70 last:border-0 hover:bg-paper/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0 overflow-hidden">
                              {category.imageUrl ? (
                                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-ink-faint" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-ink">{category.name}</p>
                              <p className="text-xs text-ink-faint mt-0.5">{category.slug}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-ink-soft max-w-[280px] truncate">
                            {category.description || "No description"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <Badge tone="brand">{productCount}</Badge>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button onClick={() => toggleStatus(category)}>
                            <Badge tone={isActive ? "brand" : "rose"} dot>
                              {isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end items-center gap-1">
                            <IconAction icon={Eye} label="View" onClick={() => { setSelectedCategory(category); setViewModalOpen(true); }} />
                            <IconAction icon={Pencil} label="Edit" onClick={() => openEditModal(category)} />
                            <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => { setSelectedCategory(category); setDeleteError(""); setDeleteModalOpen(true); }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredCategories.map((category) => {
              const isActive = category.isActive !== false;
              const productCount = productCounts[category.id] || 0;

              return (
                <Card key={category.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-paper border border-line shrink-0 flex items-center justify-center overflow-hidden">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-ink-faint" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-ink">{category.name}</h3>
                          <p className="text-xs text-ink-faint mt-1">{category.description}</p>
                        </div>

                        <button onClick={() => toggleStatus(category)}>
                          <Badge tone={isActive ? "brand" : "rose"} dot>{isActive ? "active" : "inactive"}</Badge>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-ink-soft">
                          <span className="font-bold text-ink">{productCount}</span> products
                        </span>

                        <div className="flex items-center gap-1">
                          <IconAction icon={Eye} label="View" onClick={() => { setSelectedCategory(category); setViewModalOpen(true); }} />
                          <IconAction icon={Pencil} label="Edit" onClick={() => openEditModal(category)} />
                          <IconAction icon={Trash2} label="Delete" tone="danger" onClick={() => { setSelectedCategory(category); setDeleteError(""); setDeleteModalOpen(true); }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <Modal
          title={editingCategory ? "Edit category" : "Add category"}
          description={editingCategory ? "Update category details." : "Create a new store category."}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="category-form" loading={saving}>
                {saving ? "Saving..." : editingCategory ? "Update category" : "Create category"}
              </Button>
            </>
          }
        >
          <form id="category-form" onSubmit={handleSubmit}>
            {formError && (
              <div className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-lg text-sm font-medium mb-4">{formError}</div>
            )}

            <Field label="Category name" required>
              <Input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter category name" />
            </Field>

            <Field label="Slug" required hint="Auto-filled from the name — edit it directly if you need something different.">
              <Input name="slug" value={form.slug} onChange={handleFormChange} placeholder="category-slug" />
            </Field>

            <Field label="Description">
              <Textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter category description" />
            </Field>

            <Field label="Category photo">
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-line bg-paper shrink-0">
                    <img src={imagePreview} alt="Category" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-line text-ink-soft flex items-center justify-center hover:border-brand-500 hover:text-brand-700 shrink-0"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                )}

                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? "Change photo" : "Add photo"}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </Field>

            <Field label="Status">
              <Select
                name="isActive"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "active" }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </form>
        </Modal>
      )}

      {/* View modal */}
      {viewModalOpen && selectedCategory && (
        <Modal title={selectedCategory.name} description={selectedCategory.slug} onClose={() => setViewModalOpen(false)} width="sm">
          <div className="w-full h-36 rounded-lg bg-paper border border-line overflow-hidden flex items-center justify-center mb-4">
            {selectedCategory.imageUrl ? (
              <img src={selectedCategory.imageUrl} alt={selectedCategory.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-ink-faint" />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <Badge tone={selectedCategory.isActive !== false ? "brand" : "rose"}>
              {selectedCategory.isActive !== false ? "active" : "inactive"}
            </Badge>
          </div>

          <p className="text-sm text-ink-soft">{selectedCategory.description || "No description available."}</p>

          <div className="mt-5 p-4 rounded-lg bg-paper flex items-center justify-between">
            <span className="text-sm text-ink-soft">Total products</span>
            <span className="text-lg font-extrabold text-ink">{productCounts[selectedCategory.id] || 0}</span>
          </div>
        </Modal>
      )}

      {/* Delete modal */}
      {deleteModalOpen && selectedCategory && (
        <Modal
          title="Delete category?"
          onClose={() => setDeleteModalOpen(false)}
          width="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
            </>
          }
        >
          <p className="text-sm text-ink-soft">
            Are you sure you want to delete <strong className="text-ink">{selectedCategory.name}</strong>?
          </p>

          {deleteError && (
            <div className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-lg text-sm font-medium mt-4">{deleteError}</div>
          )}
        </Modal>
      )}
    </div>
  );
}

function IconAction({ icon: Icon, label, onClick, tone = "default" }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-ink-faint transition ${
        tone === "danger" ? "hover:bg-rose-50 hover:text-rose-500" : "hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}