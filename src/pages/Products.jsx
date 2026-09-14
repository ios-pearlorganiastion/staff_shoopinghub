import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye, ImageOff, Package } from "lucide-react";
import ProductModal from "../components/products/ProductModal";
import ProductDetailModal from "../components/products/ProductDetailModa";
import AddVariantModal from "../components/products/AddVariantModal";
import ReceiveStockModal from "../components/products/ReceiveStockModal";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast"; 
import {
  getCategories,
  getBrands,
  getProducts,
  getProductById,
  addProductVariant,
  updateProductVariant,
  getVariantInventory,
  receiveStock as receiveStockApi,
  deleteProduct,
} from "../api/productApis";

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const normalizeProducts = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
};

export default function Products() {
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productModal, setProductModal] = useState(null);
  const [viewModalProduct, setViewModalProduct] = useState(null);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [variantModal, setVariantModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [inventoryByVariant, setInventoryByVariant] = useState({});
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const loadCategories = async () => {
    try {
      setCategories(normalizeList(await getCategories()));
    } catch (err) {
      setError(err.message);
    }
  };

  const loadBrands = async () => {
    try {
      setBrands(normalizeList(await getBrands()));
    } catch (err) {
      setError(err.message);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({ limit: 100, search, categoryId: category });
      setProducts(normalizeProducts(response));
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (productList) => {
    const variants = productList.flatMap((product) => product.variants || []);

    if (!variants.length) {
      setInventoryByVariant({});
      return;
    }

    try {
      setInventoryLoading(true);

      const results = await Promise.all(
        variants.map(async (variant) => {
          try {
            const response = await getVariantInventory(variant.id);
            return [variant.id, response?.data || response];
          } catch {
            return [variant.id, null];
          }
        })
      );

      setInventoryByVariant(Object.fromEntries(results));
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 400);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    loadInventory(products);
  }, [products]);

  const getStock = (variant) => {
    const inventory = inventoryByVariant[variant.id];

    if (!inventory) {
      return variant.stock !== undefined && variant.stock !== null ? Number(variant.stock) : null;
    }

    if (inventory.available !== undefined) return Number(inventory.available);
    if (inventory.stock !== undefined) return Number(inventory.stock);
    if (inventory.quantity !== undefined) return Number(inventory.quantity);

    return 0;
  };

  const getStockStatus = (variant) => {
    const inventory = inventoryByVariant[variant.id];
    const stock = getStock(variant);

    if (inventory && inventory.isSellable === false) {
      return { text: "Not sellable", tone: "rose" };
    }

    if (stock === null) {
      return { text: inventoryLoading ? "Loading..." : "No record", tone: "neutral" };
    }

    if (stock <= 0) {
      return { text: "Out of stock", tone: "rose" };
    }

    const threshold = inventory?.effectiveLowStockThreshold ?? inventory?.lowStockThreshold ?? 10;

    if (stock <= threshold) {
      return { text: `${stock} units`, tone: "amber" };
    }

    return { text: `${stock} units`, tone: "brand" };
  };

  const handleProductSuccess = async (message) => {
    setProductModal(null);
    showToast(message);
    await loadProducts();
  };

  const handleAddVariant = async (productId, variantData) => {
    await addProductVariant(productId, variantData);
    showToast("Pack size added successfully");
    await loadProducts();
  };

  const handleReceiveStock = async (variantId, stockData) => {
    await receiveStockApi(variantId, stockData);
    showToast("Stock added successfully");
    await loadProducts();
  };

  const handleVariantUpdate = async (productId, variantId, data) => {
    try {
      await updateProductVariant(productId, variantId, data);
      showToast("Pack size updated successfully");
      await loadProducts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Edit/View always re-fetch GET /products/:id so the modal never shows
  // stale photos/variants from the bulk list response.
  const openEditModal = async (product) => {
    try {
      setEditLoadingId(product.id);
      const response = await getProductById(product.id);
      setProductModal({ mode: "edit", product: response?.data || response || product });
    } catch (err) {
      showToast(err.message || "Failed to load product details", "error");
    } finally {
      setEditLoadingId(null);
    }
  };

  const openViewModal = async (product) => {
    try {
      setViewLoadingId(product.id);
      const response = await getProductById(product.id);
      setViewModalProduct(response?.data || response || product);
    } catch (err) {
      showToast(err.message || "Failed to load product details", "error");
    } finally {
      setViewLoadingId(null);
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      setDeletingId(product.id);
      const response = await deleteProduct(product.id);
      showToast(response?.data?.message || "Product deleted successfully");
      setConfirmDeleteProduct(null);
      await loadProducts();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const categoryName = (product) => {
    if (product.category?.name) return product.category.name;
    if (product.categoryName) return product.categoryName;
    return categories.find((c) => String(c.id) === String(product.categoryId))?.name || "Uncategorized";
  };

  const brandName = (product) => {
    if (product.brand?.name) return product.brand.name;
    if (!product.brandId) return "";
    return brands.find((b) => String(b.id) === String(product.brandId))?.name || "";
  };

  const productImage = (product) =>
    product.imageUrl ||
    product.image ||
    product.productImage ||
    (Array.isArray(product.images) ? product.images[0] : "") ||
    "";

  const productImageCount = (product) =>
    Array.isArray(product.images) ? product.images.length : productImage(product) ? 1 : 0;

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink">Products</h2>
          <p className="text-sm text-ink-soft mt-1">Manage your catalog, pack sizes and stock.</p>
        </div>

        <Button icon={Plus} onClick={() => setProductModal({ mode: "add" })}>
          Add product
        </Button>
      </div>

      <Card className="p-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center h-11 px-3 rounded-lg bg-paper border border-line focus-within:bg-white focus-within:border-brand-500">
            <Search className="w-4 h-4 text-ink-faint shrink-0" />
            <input
              type="text"
              placeholder="Search products or scan SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ml-2 bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 px-3 rounded-lg border border-line bg-white text-sm font-medium text-ink-soft outline-none focus:border-brand-500 md:w-[220px]"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {error && (
        <div className="bg-rose-50 text-rose-500 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>
      )}

      {loading ? (
        <Card className="p-14 text-center text-sm text-ink-soft">Loading products...</Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product or adjust your search and category filter."
            action={<Button icon={Plus} onClick={() => setProductModal({ mode: "add" })}>Add product</Button>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProducts.map((product) => {
            const image = productImage(product);
            const imageCount = productImageCount(product);
            const active = product.isActive !== undefined ? product.isActive : product.active !== undefined ? product.active : true;

            return (
              <Card key={product.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex gap-3 min-w-0">
                    <div className="relative w-14 h-14 shrink-0 rounded-lg bg-paper border border-line flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img src={image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff className="w-4 h-4 text-ink-faint" />
                      )}

                      {imageCount > 1 && (
                        <span className="absolute bottom-0 right-0 bg-ink/75 text-white text-[9px] font-bold px-1 rounded-tl-md">
                          +{imageCount - 1}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-base text-ink truncate">{product.name}</div>
                      <div className="text-ink-soft text-[13px] mt-0.5 truncate">
                        {brandName(product) && `${brandName(product)} · `}
                        {categoryName(product)} · {(product.variants || []).length} pack size
                        {(product.variants || []).length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={active ? "brand" : "neutral"}>{active ? "Active" : "Inactive"}</Badge>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      loading={viewLoadingId === product.id}
                      onClick={() => openViewModal(product)}
                    >
                      View
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Pencil}
                      loading={editLoadingId === product.id}
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="dangerGhost"
                      size="sm"
                      icon={Trash2}
                      loading={deletingId === product.id}
                      onClick={() => setConfirmDeleteProduct(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[560px]">
                    <thead>
                      <tr>
                        {["SKU", "Pack", "MRP", "Price", "Stock", ""].map((heading) => (
                          <th key={heading} className="text-left text-[11px] uppercase tracking-wide text-ink-faint p-2 border-b border-line">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(product.variants || []).map((variant) => {
                        const stockStatus = getStockStatus(variant);
                        const variantActive = variant.isActive !== undefined ? variant.isActive : true;

                        return (
                          <tr key={variant.id}>
                            <td className="p-2 border-b border-line text-sm">
                              <div className="flex items-center gap-2">
                                <span>{variant.sku}</span>
                                {!variantActive && <Badge tone="neutral">Inactive</Badge>}
                              </div>
                            </td>
                            <td className="p-2 border-b border-line text-sm">{variant.weight} {variant.unit}</td>
                            <td className="p-2 border-b border-line text-sm">₹{Number(variant.mrp).toFixed(2)}</td>
                            <td className="p-2 border-b border-line text-sm font-semibold">
                              ₹{Number(variant.sellingPrice ?? variant.price).toFixed(2)}
                            </td>
                            <td className="p-2 border-b border-line text-sm">
                              <Badge tone={stockStatus.tone}>{stockStatus.text}</Badge>
                            </td>
                            <td className="p-2 border-b border-line">
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setStockModal({ productId: product.id, variant, productName: product.name })}
                                >
                                  + Stock
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleVariantUpdate(product.id, variant.id, { isActive: !variantActive })}
                                >
                                  {variantActive ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setVariantModal({ productId: product.id, productName: product.name })}
                  >
                    Add pack size
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {productModal && (
        <ProductModal
          categories={categories}
          brands={brands}
          product={productModal.mode === "edit" ? productModal.product : null}
          onClose={() => setProductModal(null)}
          onSuccess={handleProductSuccess}
        />
      )}

      {viewModalProduct && (
        <ProductDetailModal
          product={viewModalProduct}
          getStockStatus={getStockStatus}
          onClose={() => setViewModalProduct(null)}
          onEdit={() => {
            const product = viewModalProduct;
            setViewModalProduct(null);
            openEditModal(product);
          }}
        />
      )}

      {variantModal && (
        <AddVariantModal
          productName={variantModal.productName}
          onClose={() => setVariantModal(null)}
          onSave={(data) => handleAddVariant(variantModal.productId, data)}
        />
      )}

      {stockModal && (
        <ReceiveStockModal
          productName={stockModal.productName}
          variant={stockModal.variant}
          onClose={() => setStockModal(null)}
          onSave={(data) => handleReceiveStock(stockModal.variant.id, data)}
        />
      )}

      {confirmDeleteProduct && (
        <Modal
          title="Delete product?"
          onClose={() => setConfirmDeleteProduct(null)}
          width="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setConfirmDeleteProduct(null)}
                disabled={deletingId === confirmDeleteProduct.id}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deletingId === confirmDeleteProduct.id}
                onClick={() => handleDeleteProduct(confirmDeleteProduct)}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-soft">
            This will permanently delete <strong className="text-ink">{confirmDeleteProduct.name}</strong> and
            its pack sizes. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}