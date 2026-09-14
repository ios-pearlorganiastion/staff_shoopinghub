import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Upload } from "lucide-react";
import {
  createProduct,
  updateProduct,
  updateProductVariant,
  receiveStock,
  uploadProductImages,
  bulkImportProducts,
} from "../../api/productApis";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, Input, Select, Textarea } from "../ui/Field";

let tempImageId = 0;
const nextTempId = () => `temp-${Date.now()}-${tempImageId++}`;

const slugify = (value) =>
  value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const UNIT_OPTIONS = ["G", "KG", "ML", "L", "PCS"];

export default function ProductModal({ categories, brands, product, onClose, onSuccess }) {
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const [mode, setMode] = useState("single"); // "single" | "bulk" — bulk only shown when adding

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brandId: "",
    categoryId: "",
    sku: "",
    weight: "",
    unit: "G",
    mrp: "",
    sellingPrice: "",
    stock: 0,
    isActive: true,
  });

  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkBrandId, setBulkBrandId] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        brandId: product.brandId || "",
        categoryId: product.categoryId || product.category?.id || "",
        sku: "",
        weight: "",
        unit: "G",
        mrp: "",
        sellingPrice: "",
        stock: 0,
        isActive: product.isActive !== undefined ? product.isActive : true,
      });

      setVariants(
        (product.variants || []).map((variant) => ({
          id: variant.id,
          sku: variant.sku || "",
          weight: variant.weight != null ? String(variant.weight) : "",
          unit: variant.unit || "G",
          mrp: variant.mrp != null ? String(variant.mrp) : "",
          sellingPrice: variant.sellingPrice != null ? String(variant.sellingPrice) : "",
          isActive: variant.isActive !== undefined ? variant.isActive : true,
          isAvailable: variant.isAvailable !== undefined ? variant.isAvailable : true,
        }))
      );

      setSlugTouched(true);

      const existingImages =
        Array.isArray(product.images) && product.images.length
          ? product.images
          : [product.imageUrl || product.image || product.productImage || ""].filter(Boolean);

      setImages(
        existingImages.map((url) => ({ id: url, url, previewUrl: url, file: null, isExisting: true }))
      );
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        brandId: "",
        categoryId: categories?.[0]?.id || "",
        sku: "",
        weight: "",
        unit: "G",
        mrp: "",
        sellingPrice: "",
        stock: 0,
        isActive: true,
      });

      setVariants([]);
      setImages([]);
      setMode("single");
      setSlugTouched(false);
      setBulkCategoryId(categories?.[0]?.id || "");
      setBulkBrandId("");
      setBulkFile(null);
      setBulkResult(null);
      setBulkError("");
    }

    setError("");
  }, [product, categories]);

  const update = (key, value) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });

  const updateSlug = (value) => {
    setSlugTouched(true);
    update("slug", value);
  };

  const updateVariant = (variantId, key, value) =>
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [key]: value } : v))
    );

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setError("");

    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: nextTempId(),
        url: "",
        previewUrl: URL.createObjectURL(file),
        file,
        isExisting: false,
      })),
    ]);
  };

  const removeImage = (imageId) =>
    setImages((prev) => prev.filter((image) => image.id !== imageId));

  const makePrimary = (imageId) =>
    setImages((prev) => {
      const index = prev.findIndex((image) => image.id === imageId);
      if (index <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });

  const validateEditVariants = () => {
    for (const variant of variants) {
      if (!variant.sku?.trim()) return `SKU is required for variant ${variant.id}.`;
      if (variant.weight === "" || Number(variant.weight) < 0)
        return `Weight is required for SKU ${variant.sku}.`;
      if (variant.mrp === "" || Number(variant.mrp) < 0)
        return `MRP is required for SKU ${variant.sku}.`;
      if (variant.sellingPrice === "" || Number(variant.sellingPrice) < 0)
        return `Selling price is required for SKU ${variant.sku}.`;
      if (!variant.unit) return `Unit is required for SKU ${variant.sku}.`;
    }
    return "";
  };

  // Existing (already-saved) photos are left alone; only not-yet-uploaded
  // ones get sent, via POST /uploads/product-images (productId + files[]).
  const uploadPendingImages = async (productId) => {
    const pending = images.filter((image) => !image.isExisting && image.file);
    if (!pending.length) return;
    await uploadProductImages(productId, pending.map((image) => image.file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.categoryId) return setError("Please select a category.");

    try {
      setLoading(true);

      if (isEdit) {
        const productFormData = new FormData();
        productFormData.append("name", form.name.trim());
        if (form.slug.trim()) productFormData.append("slug", form.slug.trim());
        productFormData.append("description", form.description.trim());
        if (form.brandId) productFormData.append("brandId", form.brandId);
        productFormData.append("categoryId", form.categoryId);
        productFormData.append("isActive", String(form.isActive));

        await updateProduct(product.id, productFormData);
        await uploadPendingImages(product.id);

        const variantError = validateEditVariants();
        if (variantError) {
          setError(variantError);
          setLoading(false);
          return;
        }

        for (const variant of variants) {
          await updateProductVariant(product.id, variant.id, {
            sku: variant.sku.trim(),
            weight: Number(variant.weight),
            unit: variant.unit,
            mrp: Number(variant.mrp),
            sellingPrice: Number(variant.sellingPrice),
            isActive: variant.isActive,
            isAvailable: variant.isAvailable,
          });
        }

        onSuccess("Product and pack sizes updated");
        onClose();
        return;
      }

      if (!form.sku.trim()) {
        setError("SKU is required.");
        setLoading(false);
        return;
      }
      if (form.weight === "" || Number(form.weight) < 0) {
        setError("Weight is required.");
        setLoading(false);
        return;
      }
      if (form.mrp === "" || Number(form.mrp) < 0) {
        setError("MRP is required.");
        setLoading(false);
        return;
      }
      if (form.sellingPrice === "" || Number(form.sellingPrice) < 0) {
        setError("Selling price is required.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (form.slug.trim()) formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());
      if (form.brandId) formData.append("brandId", form.brandId);
      formData.append("categoryId", form.categoryId);
      formData.append(
        "variants",
        JSON.stringify([
          {
            sku: form.sku.trim(),
            weight: Number(form.weight),
            unit: form.unit,
            mrp: Number(form.mrp),
            sellingPrice: Number(form.sellingPrice),
          },
        ])
      );

      const response = await createProduct(formData);
      const createdProduct = response?.data || response;
      const variantId = createdProduct?.variants?.[0]?.id;

      if (createdProduct?.id) await uploadPendingImages(createdProduct.id);

      const initialStock = Number(form.stock) || 0;

      if (initialStock > 0 && variantId) {
        try {
          await receiveStock(variantId, {
            quantity: initialStock,
            reason: "Initial stock on product creation",
            performedBy: localStorage.getItem("staffName") || "Staff",
          });
          onSuccess("Product created successfully");
        } catch (stockError) {
          onSuccess(`Product created, but stock could not be added. ${stockError?.message || "Unknown error"}`);
        }
      } else {
        onSuccess("Product created successfully");
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Something went wrong while saving the product.");
    } finally {
      setLoading(false);
    }
  };

  const submitBulkImport = async (e) => {
    e.preventDefault();
    setBulkError("");
    setBulkResult(null);

    if (!bulkCategoryId) return setBulkError("Please select a category for this batch.");
    if (!bulkFile) return setBulkError("Please choose a CSV file to import.");

    try {
      setBulkLoading(true);

      const response = await bulkImportProducts(bulkCategoryId, bulkBrandId, bulkFile);
      const data = response?.data || response || {};

      setBulkResult({
        created: data.created ?? data.successCount ?? data.imported ?? null,
        failed: data.failed ?? data.failedCount ?? data.errors?.length ?? null,
        errors: data.errors || data.failures || [],
      });

      onSuccess("Bulk import completed");
    } catch (err) {
      setBulkError(err?.message || "Failed to bulk import products.");
    } finally {
      setBulkLoading(false);
    }
  };

  const footer = mode === "bulk" && !isEdit ? (
    <>
      <Button type="button" variant="secondary" onClick={onClose} disabled={bulkLoading}>
        Cancel
      </Button>
      <Button type="submit" form="bulk-import-form" loading={bulkLoading}>
        {bulkLoading ? "Importing..." : "Import products"}
      </Button>
    </>
  ) : (
    <>
      <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button type="submit" form="product-form" loading={loading}>
        {loading ? "Saving..." : isEdit ? "Update product" : "Save product"}
      </Button>
    </>
  );

  return (
    <Modal
      title={isEdit ? "Edit product" : mode === "bulk" ? "Bulk import products" : "Add product"}
      onClose={onClose}
      width="lg"
      footer={footer}
    >
      {!isEdit && (
        <div className="flex gap-2 mb-5">
          <Button
            type="button"
            size="sm"
            variant={mode === "single" ? "primary" : "secondary"}
            onClick={() => setMode("single")}
          >
            Single product
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "bulk" ? "primary" : "secondary"}
            icon={Upload}
            onClick={() => setMode("bulk")}
          >
            Bulk import (CSV)
          </Button>
        </div>
      )}

      {mode === "bulk" && !isEdit ? (
        <form id="bulk-import-form" onSubmit={submitBulkImport}>
          {bulkError && (
            <div className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-lg text-sm mb-4">{bulkError}</div>
          )}

          {bulkResult && (
            <div className="bg-brand-50 text-brand-700 px-3 py-2.5 rounded-lg text-sm mb-4">
              Import finished.
              {bulkResult.created !== null && ` ${bulkResult.created} created.`}
              {bulkResult.failed ? ` ${bulkResult.failed} failed.` : ""}
              {bulkResult.errors?.length > 0 && (
                <ul className="list-disc pl-5 mt-2 text-amber-700">
                  {bulkResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{typeof err === "string" ? err : err.message || JSON.stringify(err)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-xs text-ink-soft mb-4">
            Every row in the CSV is created under the category (and brand, if chosen)
            selected below. Expected columns: Name, Description, SKU, MRP, SellingPrice,
            Unit, Weight, InitialStock, ImageUrl.
          </p>

          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Category" required>
              <Select required value={bulkCategoryId} onChange={(e) => setBulkCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Brand">
              <Select value={bulkBrandId} onChange={(e) => setBulkBrandId(e.target.value)}>
                <option value="">No brand</option>
                {(brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="CSV file">
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => csvInputRef.current?.click()}>
                Choose CSV
              </Button>
              <span className="text-sm text-ink-soft">{bulkFile ? bulkFile.name : "No file chosen"}</span>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  setBulkFile(e.target.files?.[0] || null);
                  e.target.value = "";
                  setBulkError("");
                  setBulkResult(null);
                }}
                className="hidden"
              />
            </div>
          </Field>
        </form>
      ) : (
        <form id="product-form" onSubmit={submit}>
          {error && (
            <div className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-lg text-sm mb-4">{error}</div>
          )}

          <p className="text-xs uppercase tracking-wide text-ink-faint font-bold mb-3">
            Product information
          </p>

          <Field label="Product name" required>
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter product name" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Slug" hint="Automatically generated from the product name.">
              <Input value={form.slug} onChange={(e) => updateSlug(e.target.value)} placeholder="product-slug" />
            </Field>

            <Field label="Brand">
              <Select value={form.brandId} onChange={(e) => update("brandId", e.target.value)}>
                <option value="">No brand</option>
                {(brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Category" required>
            <Select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Enter product description" />
          </Field>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm font-semibold text-ink -mt-2 mb-4">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="w-4 h-4 accent-brand-600" />
              Product active
            </label>
          )}

          <div className="h-px bg-line my-5" />

          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase tracking-wide text-ink-faint font-bold">Product photos</p>
            <span className="text-xs text-ink-soft">{images.length} photo{images.length !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-ink-soft mb-3">New photos upload automatically right after you save.</p>

          <div className="flex flex-wrap gap-3 mb-1">
            {images.map((image, index) => (
              <div key={image.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line bg-paper group">
                <img src={image.previewUrl} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover" />

                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-600 text-white text-[9px] font-bold text-center py-0.5">
                    Primary
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label="Remove photo"
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/70 text-white text-xs flex items-center justify-center hover:bg-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(image.id)}
                    className="absolute bottom-0 left-0 right-0 bg-ink/60 text-white text-[9px] font-semibold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Make primary
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-line text-ink-soft text-xs font-semibold flex flex-col items-center justify-center gap-1 hover:border-brand-500 hover:text-brand-700"
            >
              <ImagePlus className="w-5 h-5" />
              Add photo
            </button>

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesChange} className="hidden" />
          </div>

          {isEdit && (
            <>
              <div className="h-px bg-line my-5" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-ink-faint font-bold">Pack sizes / variants</p>
                <span className="text-xs text-ink-soft">{variants.length} variant{variants.length !== 1 ? "s" : ""}</span>
              </div>

              {variants.length === 0 ? (
                <div className="border border-dashed border-line rounded-lg p-5 text-center text-sm text-ink-soft">
                  No variants found.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border border-line rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-ink">Pack size #{index + 1}</p>
                        <span className="text-[11px] text-ink-faint">ID: {variant.id}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-x-3">
                        <Field label="SKU" required>
                          <Input required value={variant.sku} onChange={(e) => updateVariant(variant.id, "sku", e.target.value)} />
                        </Field>
                        <Field label="Weight / qty" required>
                          <Input required type="number" step="0.001" min="0" value={variant.weight} onChange={(e) => updateVariant(variant.id, "weight", e.target.value)} />
                        </Field>
                        <Field label="Unit">
                          <Select value={variant.unit} onChange={(e) => updateVariant(variant.id, "unit", e.target.value)}>
                            {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </Select>
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3">
                        <Field label="MRP (₹)" required>
                          <Input required type="number" step="0.01" min="0" value={variant.mrp} onChange={(e) => updateVariant(variant.id, "mrp", e.target.value)} />
                        </Field>
                        <Field label="Selling price (₹)" required>
                          <Input required type="number" step="0.01" min="0" value={variant.sellingPrice} onChange={(e) => updateVariant(variant.id, "sellingPrice", e.target.value)} />
                        </Field>
                      </div>

                      <div className="flex flex-wrap gap-5 mt-1">
                        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <input type="checkbox" checked={variant.isActive} onChange={(e) => updateVariant(variant.id, "isActive", e.target.checked)} className="w-4 h-4 accent-brand-600" />
                          Variant active
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <input type="checkbox" checked={variant.isAvailable} onChange={(e) => updateVariant(variant.id, "isAvailable", e.target.checked)} className="w-4 h-4 accent-brand-600" />
                          Available for sale
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!isEdit && (
            <>
              <div className="h-px bg-line my-5" />
              <p className="text-xs uppercase tracking-wide text-ink-faint font-bold mb-3">Pack size</p>

              <div className="grid grid-cols-3 gap-x-3">
                <Field label="SKU" required>
                  <Input required value={form.sku} onChange={(e) => update("sku", e.target.value)} />
                </Field>
                <Field label="Weight / qty" required>
                  <Input required type="number" step="0.001" min="0" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
                </Field>
                <Field label="Unit">
                  <Select value={form.unit} onChange={(e) => update("unit", e.target.value)}>
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-x-3">
                <Field label="MRP (₹)" required>
                  <Input required type="number" step="0.01" min="0" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} />
                </Field>
                <Field label="Selling price (₹)" required>
                  <Input required type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
                </Field>
              </div>

              <Field label="Initial stock (units)">
                <Input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
              </Field>
            </>
          )}
        </form>
      )}
    </Modal>
  );
}