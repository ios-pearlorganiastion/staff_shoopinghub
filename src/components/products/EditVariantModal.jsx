import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, Input, Select } from "../ui/Field";

const UNIT_OPTIONS = ["G", "KG", "ML", "L", "PCS"];

export default function EditVariantModal({ productName, variant, onClose, onSave }) {
  const [form, setForm] = useState({
    sku: variant.sku || "",
    weight: variant.weight != null ? String(variant.weight) : "",
    unit: variant.unit || "G",
    mrp: variant.mrp != null ? String(variant.mrp) : "",
    sellingPrice: variant.sellingPrice != null ? String(variant.sellingPrice) : "",
    isActive: variant.isActive !== undefined ? variant.isActive : true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.sku.trim()) return setError("SKU is required.");
    if (form.weight === "" || Number(form.weight) < 0) return setError("Weight is required.");
    if (form.mrp === "" || Number(form.mrp) < 0) return setError("MRP is required.");
    if (form.sellingPrice === "" || Number(form.sellingPrice) < 0)
      return setError("Selling price is required.");

    try {
      setLoading(true);

      await onSave({
        sku: form.sku.trim(),
        weight: Number(form.weight),
        unit: form.unit,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        isActive: form.isActive,
      });

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update pack size.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit pack size"
      description={productName}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="edit-variant-form" loading={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <form id="edit-variant-form" onSubmit={submit}>
        {error && (
          <div className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-lg text-sm mb-4">{error}</div>
        )}

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

        <label className="flex items-center gap-2 text-sm font-semibold text-ink mt-1">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="w-4 h-4 accent-brand-600" />
          Variant active
        </label>
      </form>
    </Modal>
  );
}