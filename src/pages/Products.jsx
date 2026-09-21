
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ImageOff,
  Package,
  Layers3,
  Boxes,
  RefreshCw,
  ChevronDown,
  Tag,
} from "lucide-react";
import ProductModal from "../components/products/ProductModal";
import ProductDetailModal from "../components/products/ProductDetailModal";
import AddVariantModal from "../components/products/AddVariantModal";
import EditVariantModal from "../components/products/EditVariantModal";
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
  const [editVariantModal, setEditVariantModal] = useState(null);
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

      const response = await getProducts({
        limit: 100,
        search,
        categoryId: category,
      });

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
      return variant.stock !== undefined && variant.stock !== null
        ? Number(variant.stock)
        : null;
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
      return {
        text: inventoryLoading ? "Loading..." : "No record",
        tone: "neutral",
      };
    }

    if (stock <= 0) {
      return { text: "Out of stock", tone: "rose" };
    }

    const threshold =
      inventory?.effectiveLowStockThreshold ??
      inventory?.lowStockThreshold ??
      10;

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

  const handleEditVariant = async (productId, variantId, data) => {
    await updateProductVariant(productId, variantId, data);
    showToast("Pack size updated successfully");
    await loadProducts();
  };

  const openEditModal = async (product) => {
    try {
      setEditLoadingId(product.id);
      const response = await getProductById(product.id);
      setProductModal({
        mode: "edit",
        product: response?.data || response || product,
      });
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

    return (
      categories.find(
        (c) => String(c.id) === String(product.categoryId)
      )?.name || "Uncategorized"
    );
  };

  const brandName = (product) => {
    if (product.brand?.name) return product.brand.name;
    if (!product.brandId) return "";

    return (
      brands.find((b) => String(b.id) === String(product.brandId))?.name || ""
    );
  };

  const productImage = (product) =>
    product.imageUrl ||
    product.image ||
    product.productImage ||
    (Array.isArray(product.images) ? product.images[0] : "") ||
    "";

  const productImageCount = (product) =>
    Array.isArray(product.images)
      ? product.images.length
      : productImage(product)
      ? 1
      : 0;

  const filteredProducts = useMemo(() => products, [products]);

  const totalVariants = products.reduce(
    (sum, product) => sum + (product.variants || []).length,
    0
  );

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
                Catalog management
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[34px]">
              Products
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">
              Manage your product catalog, pack sizes, pricing and inventory
              from one place.
            </p>
          </div>

          <Button
            icon={Plus}
            onClick={() => setProductModal({ mode: "add" })}
            className="h-11 w-full justify-center !border-0 !bg-white !text-brand-700 shadow-md hover:!bg-brand-50 sm:w-auto"
          >
            Add product
          </Button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <HeaderMetric
            icon={Package}
            label="Products"
            value={products.length}
          />
          <HeaderMetric
            icon={Boxes}
            label="Pack sizes"
            value={totalVariants}
          />
          <HeaderMetric
            icon={Tag}
            label="Categories"
            value={categories.length}
          />
        </div>
      </section>

      <Card className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-line px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-extrabold text-ink sm:text-lg">
              Product catalog
            </h3>
            <p className="text-xs text-ink-faint">
              Search products or filter your catalog by category.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-line bg-paper px-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                type="text"
                placeholder="Search products or scan SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 min-w-0 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>

            <div className="relative w-full lg:w-[240px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3 pr-9 text-sm font-semibold text-ink-soft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card className="overflow-hidden rounded-[22px] border border-slate-200 p-8 sm:p-14">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
            <p className="mt-4 text-sm font-bold text-ink">
              Loading products...
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              Fetching your latest catalog data
            </p>
          </div>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="overflow-hidden rounded-[22px] border border-slate-200">
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product or adjust your search and category filter."
            action={
              <Button
                icon={Plus}
                onClick={() => setProductModal({ mode: "add" })}
              >
                Add product
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredProducts.map((product) => {
            const image = productImage(product);
            const imageCount = productImageCount(product);
            const active =
              product.isActive !== undefined
                ? product.isActive
                : product.active !== undefined
                ? product.active
                : true;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
              >
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50 sm:h-[72px] sm:w-[72px]">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-5 w-5 text-ink-faint" />
                          </div>
                        )}

                        {imageCount > 1 && (
                          <span className="absolute bottom-0 right-0 rounded-tl-lg bg-brand-700/90 px-1.5 py-1 text-[9px] font-bold text-white">
                            +{imageCount - 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="max-w-full truncate text-base font-extrabold text-ink sm:text-lg">
                            {product.name}
                          </h3>

                          <Badge tone={active ? "brand" : "neutral"}>
                            {active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <p className="mt-1 truncate text-xs text-ink-soft sm:text-[13px]">
                          {brandName(product) && `${brandName(product)} · `}
                          {categoryName(product)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-ink-faint">
                          <span className="rounded-full bg-brand-50 px-2 py-1 text-brand-700">
                            {(product.variants || []).length} pack
                            {(product.variants || []).length !== 1
                              ? "s"
                              : ""}
                          </span>
                          <span className="hidden text-ink-faint sm:inline">
                            •
                          </span>
                          <span>Product catalog</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 xl:flex xl:shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        loading={viewLoadingId === product.id}
                        onClick={() => openViewModal(product)}
                        className="w-full justify-center"
                      >
                        <span>View</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        loading={editLoadingId === product.id}
                        onClick={() => openEditModal(product)}
                        className="w-full justify-center"
                      >
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="dangerGhost"
                        size="sm"
                        icon={Trash2}
                        loading={deletingId === product.id}
                        onClick={() => setConfirmDeleteProduct(product)}
                        className="w-full justify-center"
                      >
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[700px] border-collapse">
                        <thead>
                          <tr className="bg-brand-50/60">
                            {[
                              "SKU",
                              "Pack",
                              "MRP",
                              "Price",
                              "Stock",
                              "Actions",
                            ].map((heading) => (
                              <th
                                key={heading}
                                className="border-b border-line px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-ink-faint"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {(product.variants || []).map((variant) => {
                            const stockStatus = getStockStatus(variant);
                            const variantActive =
                              variant.isActive !== undefined
                                ? variant.isActive
                                : true;

                            return (
                              <tr
                                key={variant.id}
                                className="border-b border-line/70 transition last:border-0 hover:bg-brand-50/30"
                              >
                                <td className="px-4 py-4 text-xs font-semibold text-ink">
                                  <div className="flex items-center gap-2">
                                    <span>{variant.sku}</span>
                                    {!variantActive && (
                                      <Badge tone="neutral">Inactive</Badge>
                                    )}
                                  </div>
                                </td>

                                <td className="px-4 py-4 text-xs text-ink-soft">
                                  {variant.weight} {variant.unit}
                                </td>

                                <td className="px-4 py-4 text-xs font-semibold text-ink">
                                  ₹{Number(variant.mrp).toFixed(2)}
                                </td>

                                <td className="px-4 py-4 text-xs font-extrabold text-ink">
                                  ₹
                                  {Number(
                                    variant.sellingPrice ?? variant.price
                                  ).toFixed(2)}
                                </td>

                                <td className="px-4 py-4">
                                  <Badge tone={stockStatus.tone}>
                                    {stockStatus.text}
                                  </Badge>
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      icon={Pencil}
                                      onClick={() =>
                                        setEditVariantModal({
                                          productId: product.id,
                                          variant,
                                          productName: product.name,
                                        })
                                      }
                                    >
                                      Edit
                                    </Button>

                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() =>
                                        setStockModal({
                                          productId: product.id,
                                          variant,
                                          productName: product.name,
                                        })
                                      }
                                    >
                                      + Stock
                                    </Button>

                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() =>
                                        handleVariantUpdate(
                                          product.id,
                                          variant.id,
                                          {
                                            isActive: !variantActive,
                                          }
                                        )
                                      }
                                    >
                                      {variantActive
                                        ? "Deactivate"
                                        : "Activate"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="divide-y divide-line/70 md:hidden">
                      {(product.variants || []).map((variant) => {
                        const stockStatus = getStockStatus(variant);
                        const variantActive =
                          variant.isActive !== undefined
                            ? variant.isActive
                            : true;

                        return (
                          <div
                            key={variant.id}
                            className="p-3.5 transition hover:bg-brand-50/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-extrabold text-ink">
                                  {variant.sku}
                                </p>
                                <p className="mt-1 text-[10px] text-ink-faint">
                                  {variant.weight} {variant.unit}
                                </p>
                              </div>

                              <Badge tone={variantActive ? "brand" : "neutral"}>
                                {variantActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-brand-50/60 p-3">
                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                                  MRP
                                </p>
                                <p className="mt-1 text-xs font-extrabold text-ink">
                                  ₹{Number(variant.mrp).toFixed(2)}
                                </p>
                              </div>

                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                                  Price
                                </p>
                                <p className="mt-1 text-xs font-extrabold text-brand-700">
                                  ₹
                                  {Number(
                                    variant.sellingPrice ?? variant.price
                                  ).toFixed(2)}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-ink-faint">
                                  Stock
                                </p>
                                <div className="mt-1 flex justify-end">
                                  <Badge tone={stockStatus.tone}>
                                    {stockStatus.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Pencil}
                                onClick={() =>
                                  setEditVariantModal({
                                    productId: product.id,
                                    variant,
                                    productName: product.name,
                                  })
                                }
                                className="w-full justify-center px-2"
                              >
                                Edit
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setStockModal({
                                    productId: product.id,
                                    variant,
                                    productName: product.name,
                                  })
                                }
                                className="w-full justify-center px-2"
                              >
                                + Stock
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleVariantUpdate(
                                    product.id,
                                    variant.id,
                                    {
                                      isActive: !variantActive,
                                    }
                                  )
                                }
                                className="w-full justify-center px-2"
                              >
                                {variantActive ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() =>
                        setVariantModal({
                          productId: product.id,
                          productName: product.name,
                        })
                      }
                      className="w-full justify-center sm:w-auto"
                    >
                      Add pack size
                    </Button>
                  </div>
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
          product={
            productModal.mode === "edit" ? productModal.product : null
          }
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

      {editVariantModal && (
        <EditVariantModal
          productName={editVariantModal.productName}
          variant={editVariantModal.variant}
          onClose={() => setEditVariantModal(null)}
          onSave={(data) =>
            handleEditVariant(
              editVariantModal.productId,
              editVariantModal.variant.id,
              data
            )
          }
        />
      )}

      {stockModal && (
        <ReceiveStockModal
          productName={stockModal.productName}
          variant={stockModal.variant}
          onClose={() => setStockModal(null)}
          onSave={(data) =>
            handleReceiveStock(stockModal.variant.id, data)
          }
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
          <p className="text-sm leading-6 text-ink-soft">
            This will permanently delete{" "}
            <strong className="text-ink">
              {confirmDeleteProduct.name}
            </strong>{" "}
            and its pack sizes. This can't be undone.
          </p>
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

      <p className="mt-1 text-base font-extrabold sm:text-lg">{value}</p>
    </div>
  );
}

