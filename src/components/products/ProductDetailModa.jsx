import { useState } from "react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function ProductDetailModal({ product, getStockStatus, onClose, onEdit }) {
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.imageUrl || product.image || product.productImage || ""].filter(Boolean);

  const active =
    product.isActive !== undefined
      ? product.isActive
      : product.active !== undefined
      ? product.active
      : true;

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const mainImage = images[activeImage] || images[0] || "";

  return (
    <Modal
      title={product.name}
      description={[product.brand?.name, product.category?.name || "Uncategorized"].filter(Boolean).join(" · ")}
      onClose={onClose}
      width="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit product</Button>
        </>
      }
    >
      <div className="flex items-start justify-between gap-3 -mt-1 mb-4">
        <div />
        <Badge tone={active ? "brand" : "neutral"}>{active ? "Active" : "Inactive"}</Badge>
      </div>

      {/* Gallery */}
      <div className="w-full h-64 rounded-lg bg-paper border border-line overflow-hidden flex items-center justify-center">
        {mainImage ? (
          <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-sm text-ink-soft">No photo available</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2.5 flex-wrap">
          {images.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${index === activeImage ? "border-brand-600" : "border-line"}`}
            >
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="h-px bg-line my-5" />

      <p className="text-xs uppercase tracking-wide text-ink-faint font-bold mb-2">Description</p>
      <p className="text-sm text-ink mb-4 whitespace-pre-wrap">
        {product.description || "No description provided."}
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div><span className="text-ink-soft">Slug: </span>{product.slug || "—"}</div>
        <div><span className="text-ink-soft">Product ID: </span>{product.id}</div>
        <div><span className="text-ink-soft">Created: </span>{formatDate(product.createdAt)}</div>
        <div><span className="text-ink-soft">Last updated: </span>{formatDate(product.updatedAt)}</div>
      </div>

      <div className="h-px bg-line my-5" />

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink-faint font-bold">Pack sizes / variants</p>
        <span className="text-xs text-ink-soft">
          {(product.variants || []).length} variant{(product.variants || []).length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr>
              {["SKU", "Pack", "MRP", "Price", "Stock", "Status"].map((heading) => (
                <th key={heading} className="text-left text-[11px] uppercase tracking-wide text-ink-faint p-2 border-b border-line">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(product.variants || []).map((variant) => {
              const stockStatus = getStockStatus
                ? getStockStatus(variant)
                : { text: "—", tone: "neutral" };

              const variantActive = variant.isActive !== undefined ? variant.isActive : true;
              const variantAvailable = variant.isAvailable !== undefined ? variant.isAvailable : true;

              return (
                <tr key={variant.id}>
                  <td className="p-2 border-b border-line text-sm">{variant.sku}</td>
                  <td className="p-2 border-b border-line text-sm">{variant.weight} {variant.unit}</td>
                  <td className="p-2 border-b border-line text-sm">₹{Number(variant.mrp).toFixed(2)}</td>
                  <td className="p-2 border-b border-line text-sm font-semibold">
                    ₹{Number(variant.sellingPrice ?? variant.price).toFixed(2)}
                  </td>
                  <td className="p-2 border-b border-line text-sm">
                    <Badge tone={stockStatus.tone}>{stockStatus.text}</Badge>
                  </td>
                  <td className="p-2 border-b border-line text-sm">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge tone={variantActive ? "brand" : "neutral"}>{variantActive ? "Active" : "Inactive"}</Badge>
                      <Badge tone={variantAvailable ? "brand" : "amber"}>{variantAvailable ? "For sale" : "Not for sale"}</Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}