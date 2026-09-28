import { Children, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ImageOff,
  Package,
  Boxes,
  RefreshCw,
  Tag,
  X,
  ImagePlus,
  Upload,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  PackagePlus,
  Power,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

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
  createProduct,
  updateProduct,
  bulkImportProducts,
} from "../api/productApis";

/* =========================================================
   HELPERS
========================================================= */

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

const UNIT_OPTIONS = ["G", "KG", "ML", "L", "PCS"];

let tempImageId = 0;
const nextTempId = () => `temp-${Date.now()}-${tempImageId++}`;

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

const variantPrice = (variant) => variant?.sellingPrice ?? variant?.price ?? 0;

/* =========================================================
   STYLE TOKENS
========================================================= */

const TONE_STYLE = {
  brand: "bg-[#eef5e7] text-[#315d32]",
  rose: "bg-[#f8ecea] text-[#b35a54]",
  amber: "bg-[#f7f2df] text-[#a07824]",
  neutral: "bg-[#f1f3ee] text-[#667065]",
};

const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 text-xs font-semibold text-[#202a20] outline-none transition placeholder:font-normal placeholder:text-[#92998e] sm:text-sm";

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

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Products() {
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setError(err?.message || "Failed to load categories");
    }
  };

  const loadBrands = async () => {
    try {
      setBrands(normalizeList(await getBrands()));
    } catch (err) {
      setError(err?.message || "Failed to load brands");
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
      setError(err?.message || "Failed to load products");
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
    showToast("Products refreshed");
  };

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
      showToast(err?.message || "Failed to update pack size", "error");
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
      showToast(err?.message || "Failed to load product details", "error");
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
      showToast(err?.message || "Failed to load product details", "error");
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
      showToast(err?.message || "Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const categoryName = (product) => {
    if (product.category?.name) return product.category.name;
    if (product.categoryName) return product.categoryName;

    return (
      categories.find((c) => String(c.id) === String(product.categoryId))
        ?.name || "Uncategorized"
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

  const totalVariants = products.reduce(
    (sum, product) => sum + (product.variants || []).length,
    0
  );

  const attentionCount = products.reduce(
    (sum, product) =>
      sum +
      (product.variants || []).filter((variant) => {
        const tone = getStockStatus(variant).tone;
        return tone === "rose" || tone === "amber";
      }).length,
    0
  );

  const selectedCategoryName =
    categories.find((c) => String(c.id) === String(category))?.name || "";

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
                <Package className="h-4 w-4 sm:h-6 sm:w-6" />
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
                  Products
                </h1>

                <p className="mt-1 max-w-xl text-[9px] leading-4 text-white/70 sm:mt-1.5 sm:text-sm sm:leading-5">
                  Manage your product catalog, pack sizes, pricing and
                  inventory from one beautiful workspace.
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
                onClick={() => setProductModal({ mode: "add" })}
                className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[9px] font-bold text-[#315d32] shadow-lg transition-all sm:min-h-10 sm:w-auto sm:text-xs"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add product
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
            label="Products"
            value={products.length}
            icon={Package}
            description="In your catalog"
          />

          <StatCard
            label="Pack sizes"
            value={totalVariants}
            icon={Boxes}
            description="Across all products"
          />

          <StatCard
            label="Categories"
            value={categories.length}
            icon={Tag}
            description="Product groups"
          />

          <StatCard
            label="Needs attention"
            value={attentionCount}
            icon={AlertTriangle}
            description="Low or out of stock"
            danger
          />
        </motion.div>

        {/* SEARCH + FILTER */}
        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:rounded-[24px]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf1e9] px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
              Product catalog
            </p>

            <div className="flex w-full items-center rounded-xl border border-[#dceacb] bg-[#f7f8f2] px-3 transition focus-within:border-[#315d32] focus-within:bg-white lg:w-[380px]">
              <Search className="h-4 w-4 shrink-0 text-[#92998e]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or scan SKU..."
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
            {[{ id: "", name: "All categories" }, ...categories].map((cat) => {
              const active = String(category) === String(cat.id);

              return (
                <motion.button
                  key={cat.id || "all"}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCategory(cat.id)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[8px] font-bold transition-all sm:px-3.5 sm:text-xs ${
                    active
                      ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                      : "border border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
                  }`}
                >
                  {cat.name}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

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

        {/* LIST HEADING */}
        {!loading && (
          <motion.div
            variants={itemVariants}
            className="flex items-end justify-between px-0.5 sm:px-1"
          >
            <div>
              <h3 className="text-[13px] font-black tracking-tight text-[#202a20] sm:text-base">
                {selectedCategoryName || "All Products"}
              </h3>

              <p className="mt-0.5 text-[9px] text-[#92998e] sm:text-xs">
                Showing {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
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
              Loading products...
            </h3>

            <p className="mt-1 text-xs text-[#92998e] sm:text-sm">
              Fetching your latest catalog data
            </p>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="rounded-[18px] border border-[#dceacb] bg-white px-4 py-10 text-center shadow-[0_8px_30px_rgba(49,93,50,0.06)] sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
              <Package size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20] sm:text-lg">
              No products yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#92998e] sm:text-sm sm:leading-6">
              Add your first product or adjust your search and category filter.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setProductModal({ mode: "add" })}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#315d32] px-5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(49,93,50,0.2)] transition hover:bg-[#274d29]"
            >
              <Plus size={14} />
              Add product
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            className="grid w-full min-w-0 grid-cols-1 gap-2.5 sm:gap-4"
          >
            {products.map((product) => {
              const image = productImage(product);
              const imageCount = productImageCount(product);
              const variants = product.variants || [];

              const active =
                product.isActive !== undefined
                  ? product.isActive
                  : product.active !== undefined
                  ? product.active
                  : true;

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="group relative w-full min-w-0 overflow-hidden rounded-[16px] border border-[#dceacb] bg-white shadow-[0_8px_30px_rgba(49,93,50,0.05)] transition-all duration-300 hover:border-[#b8df7d] hover:shadow-[0_18px_45px_rgba(49,93,50,0.12)] sm:rounded-[22px]"
                >
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#315d32] opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="w-full min-w-0 p-3 sm:p-4 lg:p-5">
                    {/* Header */}
                    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
                      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3.5">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#dceacb] bg-[#eef5e7] sm:h-[76px] sm:w-[76px] sm:rounded-2xl">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#92998e]">
                              <ImageOff className="h-5 w-5" />
                            </div>
                          )}

                          {imageCount > 1 && (
                            <span className="absolute bottom-0 right-0 rounded-tl-lg bg-[#315d32]/90 px-1.5 py-0.5 text-[8px] font-bold text-white sm:text-[9px]">
                              +{imageCount - 1}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <h4 className="min-w-0 flex-1 truncate text-[12px] font-black text-[#202a20] sm:text-base">
                              {product.name}
                            </h4>

                            <StatusBadge tone={active ? "brand" : "neutral"}>
                              {active ? "Active" : "Inactive"}
                            </StatusBadge>
                          </div>

                          <p className="mt-1 truncate text-[10px] font-semibold text-[#92998e] sm:text-xs">
                            {brandName(product) && `${brandName(product)} · `}
                            {categoryName(product)}
                          </p>

                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eef5e7] px-2.5 py-1 text-[8px] font-bold text-[#315d32] sm:text-[10px]">
                            <Boxes className="h-3 w-3" />
                            {variants.length}{" "}
                            {variants.length === 1 ? "pack size" : "pack sizes"}
                          </span>
                        </div>
                      </div>

                      <div className="grid shrink-0 grid-cols-3 gap-1.5 border-t border-[#edf1e9] pt-2.5 sm:gap-2 sm:pt-3 lg:flex lg:items-center lg:border-0 lg:pt-0">
                        <ActionButton
                          icon={Eye}
                          label="View"
                          loading={viewLoadingId === product.id}
                          onClick={() => openViewModal(product)}
                        />

                        <ActionButton
                          icon={Pencil}
                          label="Edit"
                          loading={editLoadingId === product.id}
                          onClick={() => openEditModal(product)}
                        />

                        <ActionButton
                          icon={Trash2}
                          label="Delete"
                          danger
                          loading={deletingId === product.id}
                          onClick={() => setConfirmDeleteProduct(product)}
                        />
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="mt-3 overflow-hidden rounded-xl border border-[#edf1e9] bg-[#f7f8f2] sm:mt-4 sm:rounded-2xl">
                      <div className="flex items-center justify-between gap-2 border-b border-[#edf1e9] px-3 py-2.5 sm:px-4 sm:py-3">
                        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#92998e] sm:text-[9px]">
                          Pack sizes
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setVariantModal({
                              productId: product.id,
                              productName: product.name,
                            })
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dceacb] bg-white px-2.5 text-[9px] font-bold text-[#315d32] transition hover:border-[#315d32] hover:bg-[#eef5e7] sm:text-[11px]"
                        >
                          <Plus size={12} />
                          Add pack size
                        </button>
                      </div>

                      {variants.length === 0 ? (
                        <p className="px-4 py-6 text-center text-[11px] font-semibold text-[#92998e] sm:text-xs">
                          No pack sizes yet.
                        </p>
                      ) : (
                        <>
                          {/* Desktop table */}
                          <div className="hidden overflow-x-auto bg-white md:block">
                            <table className="w-full min-w-[720px] border-collapse">
                              <thead>
                                <tr>
                                  {[
                                    "SKU",
                                    "Pack",
                                    "MRP",
                                    "Price",
                                    "Stock",
                                    "Actions",
                                  ].map((heading, index) => (
                                    <th
                                      key={heading}
                                      className={`border-b border-[#edf1e9] px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-[#92998e] ${
                                        index === 5 ? "text-right" : "text-left"
                                      }`}
                                    >
                                      {heading}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {variants.map((variant) => {
                                  const stockStatus = getStockStatus(variant);
                                  const variantActive =
                                    variant.isActive !== undefined
                                      ? variant.isActive
                                      : true;

                                  return (
                                    <tr
                                      key={variant.id}
                                      className="border-b border-[#edf1e9] transition-colors last:border-0 hover:bg-[#f7f8f2]"
                                    >
                                      <td className="px-4 py-3.5 text-xs font-bold text-[#202a20]">
                                        <div className="flex items-center gap-2">
                                          <span>{variant.sku}</span>

                                          {!variantActive && (
                                            <StatusBadge tone="neutral">
                                              Inactive
                                            </StatusBadge>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3.5 text-xs text-[#667065]">
                                        {variant.weight} {variant.unit}
                                      </td>

                                      <td className="px-4 py-3.5 text-xs font-semibold text-[#667065]">
                                        {money(variant.mrp)}
                                      </td>

                                      <td className="px-4 py-3.5 text-xs font-black text-[#315d32]">
                                        {money(variantPrice(variant))}
                                      </td>

                                      <td className="px-4 py-3.5">
                                        <StatusBadge tone={stockStatus.tone}>
                                          {stockStatus.text}
                                        </StatusBadge>
                                      </td>

                                      <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <MiniAction
                                            icon={Pencil}
                                            label="Edit"
                                            onClick={() =>
                                              setEditVariantModal({
                                                productId: product.id,
                                                variant,
                                                productName: product.name,
                                              })
                                            }
                                          />

                                          <MiniAction
                                            icon={PackagePlus}
                                            label="Stock"
                                            onClick={() =>
                                              setStockModal({
                                                productId: product.id,
                                                variant,
                                                productName: product.name,
                                              })
                                            }
                                          />

                                          <MiniAction
                                            icon={Power}
                                            label={
                                              variantActive
                                                ? "Deactivate"
                                                : "Activate"
                                            }
                                            onClick={() =>
                                              handleVariantUpdate(
                                                product.id,
                                                variant.id,
                                                { isActive: !variantActive }
                                              )
                                            }
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile cards */}
                          <div className="space-y-2 p-2 md:hidden">
                            {variants.map((variant) => {
                              const stockStatus = getStockStatus(variant);
                              const variantActive =
                                variant.isActive !== undefined
                                  ? variant.isActive
                                  : true;

                              return (
                                <div
                                  key={variant.id}
                                  className="rounded-xl border border-[#edf1e9] bg-white p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-black text-[#202a20]">
                                        {variant.sku}
                                      </p>

                                      <p className="mt-0.5 text-[10px] text-[#92998e]">
                                        {variant.weight} {variant.unit}
                                      </p>
                                    </div>

                                    <StatusBadge
                                      tone={variantActive ? "brand" : "neutral"}
                                    >
                                      {variantActive ? "Active" : "Inactive"}
                                    </StatusBadge>
                                  </div>

                                  <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-lg bg-[#f7f8f2] p-2.5">
                                    <div className="min-w-0">
                                      <p className="text-[7px] font-bold uppercase tracking-wider text-[#92998e]">
                                        MRP
                                      </p>

                                      <p className="mt-1 truncate text-[11px] font-black text-[#202a20]">
                                        {money(variant.mrp)}
                                      </p>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[7px] font-bold uppercase tracking-wider text-[#92998e]">
                                        Price
                                      </p>

                                      <p className="mt-1 truncate text-[11px] font-black text-[#315d32]">
                                        {money(variantPrice(variant))}
                                      </p>
                                    </div>

                                    <div className="flex min-w-0 flex-col items-end">
                                      <p className="text-[7px] font-bold uppercase tracking-wider text-[#92998e]">
                                        Stock
                                      </p>

                                      <div className="mt-1">
                                        <StatusBadge tone={stockStatus.tone}>
                                          {stockStatus.text}
                                        </StatusBadge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                                    <MobileAction
                                      icon={Pencil}
                                      label="Edit"
                                      onClick={() =>
                                        setEditVariantModal({
                                          productId: product.id,
                                          variant,
                                          productName: product.name,
                                        })
                                      }
                                    />

                                    <MobileAction
                                      icon={PackagePlus}
                                      label="Stock"
                                      onClick={() =>
                                        setStockModal({
                                          productId: product.id,
                                          variant,
                                          productName: product.name,
                                        })
                                      }
                                    />

                                    <MobileAction
                                      icon={Power}
                                      label={variantActive ? "Disable" : "Enable"}
                                      onClick={() =>
                                        handleVariantUpdate(
                                          product.id,
                                          variant.id,
                                          { isActive: !variantActive }
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* MODALS */}
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
          currentStock={getStock(stockModal.variant)}
          onClose={() => setStockModal(null)}
          onSave={(data) => handleReceiveStock(stockModal.variant.id, data)}
        />
      )}

      {confirmDeleteProduct && (
        <ModalShell
          eyebrow="Confirm action"
          title="Delete product?"
          subtitle={confirmDeleteProduct.name}
          size="sm"
          onClose={() =>
            deletingId !== confirmDeleteProduct.id &&
            setConfirmDeleteProduct(null)
          }
          footer={
            <>
              <ModalButton
                onClick={() => setConfirmDeleteProduct(null)}
                disabled={deletingId === confirmDeleteProduct.id}
              >
                Cancel
              </ModalButton>

              <ModalButton
                danger
                disabled={deletingId === confirmDeleteProduct.id}
                onClick={() => handleDeleteProduct(confirmDeleteProduct)}
              >
                {deletingId === confirmDeleteProduct.id && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {deletingId === confirmDeleteProduct.id
                  ? "Deleting..."
                  : "Delete"}
              </ModalButton>
            </>
          }
        >
          <div className="rounded-xl border border-[#efd3d0] bg-[#f8ecea] p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#b35a54]">
                <Trash2 className="h-4 w-4" />
              </div>

              <p className="min-w-0 text-xs leading-5 text-[#667065] sm:text-sm sm:leading-6">
                This will permanently delete{" "}
                <strong className="break-words text-[#202a20]">
                  {confirmDeleteProduct.name}
                </strong>{" "}
                and its pack sizes. This can't be undone.
              </p>
            </div>
          </div>
        </ModalShell>
      )}
    </motion.div>
  );
}

/* =========================================================
   PRODUCT MODAL (add / edit / bulk import)
========================================================= */

function ProductModal({ categories = [], brands = [], product, onClose, onSuccess }) {
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const [mode, setMode] = useState("single"); // "single" | "bulk"

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

      setSlugTouched(true);

      const existingImages =
        Array.isArray(product.images) && product.images.length
          ? product.images
          : [product.imageUrl || product.image || product.productImage || ""].filter(
              Boolean
            );

      setImages(
        existingImages.map((url) => ({
          id: url,
          url,
          previewUrl: url,
          file: null,
          isExisting: true,
        }))
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

  // Existing (already-saved) photos are left alone; only not-yet-uploaded
  // ones are appended to the product FormData under the "images" field.
  const appendNewImages = (formData) => {
    images
      .filter((image) => !image.isExisting && image.file)
      .forEach((image) => formData.append("images", image.file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.categoryId) return setError("Please select a category.");

    try {
      setLoading(true);

      if (isEdit) {
        // Product fields only. Pack sizes are edited separately from the
        // per-variant Edit button on the Products list.
        const productFormData = new FormData();
        productFormData.append("name", form.name.trim());
        if (form.slug.trim()) productFormData.append("slug", form.slug.trim());
        productFormData.append("description", form.description.trim());
        if (form.brandId) productFormData.append("brandId", form.brandId);
        productFormData.append("categoryId", form.categoryId);
        productFormData.append("isActive", String(form.isActive));
        appendNewImages(productFormData);

        await updateProduct(product.id, productFormData);

        onSuccess("Product updated successfully");
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
      appendNewImages(formData);

      const response = await createProduct(formData);
      const createdProduct = response?.data || response;
      const variantId = createdProduct?.variants?.[0]?.id;

      const initialStock = Number(form.stock) || 0;

      if (initialStock > 0 && variantId) {
        try {
          await receiveStockApi(variantId, {
            quantity: initialStock,
            reason: "Initial stock on product creation",
            performedBy: localStorage.getItem("staffName") || "Staff",
          });
          onSuccess("Product created successfully");
        } catch (stockError) {
          onSuccess(
            `Product created, but stock could not be added. ${
              stockError?.message || "Unknown error"
            }`
          );
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

    if (!bulkCategoryId)
      return setBulkError("Please select a category for this batch.");
    if (!bulkFile) return setBulkError("Please choose a file to import.");

    try {
      setBulkLoading(true);

      const response = await bulkImportProducts(
        bulkCategoryId,
        bulkBrandId,
        bulkFile
      );
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

  const isBulk = mode === "bulk" && !isEdit;

  const footer = isBulk ? (
    <>
      <ModalButton onClick={onClose} disabled={bulkLoading}>
        Cancel
      </ModalButton>

      <ModalButton
        primary
        type="submit"
        form="bulk-import-form"
        disabled={bulkLoading}
      >
        {bulkLoading && <Loader2 size={14} className="animate-spin" />}
        {bulkLoading ? "Importing..." : "Import products"}
      </ModalButton>
    </>
  ) : (
    <>
      <ModalButton onClick={onClose} disabled={loading}>
        Cancel
      </ModalButton>

      <ModalButton primary type="submit" form="product-form" disabled={loading}>
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Saving..." : isEdit ? "Update product" : "Save product"}
      </ModalButton>
    </>
  );

  return (
    <ModalShell
      eyebrow={isEdit ? "Edit product" : isBulk ? "Bulk import" : "New product"}
      title={
        isEdit
          ? product.name || "Edit product"
          : isBulk
          ? "Bulk import products"
          : "Add product"
      }
      subtitle={
        isEdit
          ? "Update your product information and catalog details."
          : isBulk
          ? "Upload a CSV or Excel file to create many products at once."
          : "Create a product with pricing, pack size and inventory."
      }
      size="lg"
      onClose={() => !(loading || bulkLoading) && onClose()}
      footer={footer}
    >
      {!isEdit && (
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f7f8f2] p-1 sm:mb-5">
          {[
            ["single", "Single product", Package],
            ["bulk", "Bulk import", Upload],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-bold transition sm:text-xs ${
                mode === value
                  ? "bg-[#315d32] text-white shadow-[0_6px_18px_rgba(49,93,50,0.18)]"
                  : "text-[#667065] hover:bg-white"
              }`}
            >
              <Icon size={14} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}

      {isBulk ? (
        <form id="bulk-import-form" onSubmit={submitBulkImport} className="space-y-3.5 sm:space-y-4">
          {bulkError && <ErrorBox>{bulkError}</ErrorBox>}

          {bulkResult && (
            <div className="rounded-xl border border-[#dceacb] bg-[#eef5e7] px-3 py-2.5 text-[11px] font-semibold text-[#315d32] sm:text-sm">
              Import finished.
              {bulkResult.created !== null && ` ${bulkResult.created} created.`}
              {bulkResult.failed ? ` ${bulkResult.failed} failed.` : ""}

              {bulkResult.errors?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-[#a07824]">
                  {bulkResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i} className="break-words">
                      {typeof err === "string"
                        ? err
                        : err.message || JSON.stringify(err)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:p-4">
            <p className="text-[11px] font-black text-[#202a20] sm:text-xs">
              Expected columns
            </p>

            <p className="mt-1.5 text-[10px] leading-5 text-[#92998e] sm:text-[11px]">
              Name, Description, SKU, MRP, SellingPrice, Unit, Weight,
              InitialStock, ImageUrl. Every row is created under the category
              (and brand, if chosen) selected below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Category" required>
              <Select
                required
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Brand">
              <Select
                value={bulkBrandId}
                onChange={(e) => setBulkBrandId(e.target.value)}
              >
                <option value="">No brand</option>
                {(brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Import file" hint="Supports CSV or Excel (.xlsx / .xls) files.">
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="flex w-full min-w-0 items-center gap-3 rounded-xl border-2 border-dashed border-[#dceacb] bg-[#f7f8f2] p-3.5 text-left transition hover:border-[#315d32] hover:bg-[#eef5e7]/60 sm:p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315d32] shadow-sm">
                <Upload size={17} />
              </span>

              <span className="min-w-0">
                <span className="block truncate text-xs font-black text-[#202a20]">
                  {bulkFile ? bulkFile.name : "Choose file"}
                </span>

                <span className="mt-0.5 block text-[10px] text-[#92998e]">
                  {bulkFile ? "Tap to change file" : "CSV, XLSX or XLS"}
                </span>
              </span>
            </button>

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => {
                setBulkFile(e.target.files?.[0] || null);
                e.target.value = "";
                setBulkError("");
                setBulkResult(null);
              }}
              className="hidden"
            />
          </FormField>
        </form>
      ) : (
        <form id="product-form" onSubmit={submit} className="space-y-4 sm:space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

          <SectionTitle>Product information</SectionTitle>

          <FormField label="Product name" required>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter product name"
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
            <FormField label="Slug" hint="Automatically generated from the product name.">
              <input
                value={form.slug}
                onChange={(e) => updateSlug(e.target.value)}
                placeholder="product-slug"
                className={inputClass}
              />
            </FormField>

            <FormField label="Brand">
              <Select
                value={form.brandId}
                onChange={(e) => update("brandId", e.target.value)}
              >
                <option value="">No brand</option>
                {(brands || []).map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Category" required>
            <Select
              required
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Enter product description"
              rows={4}
              className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
            />
          </FormField>

          {isEdit && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:p-3.5">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="h-4 w-4 accent-[#315d32]"
              />

              <div>
                <p className="text-xs font-black text-[#202a20]">
                  Product active
                </p>

                <p className="text-[10px] text-[#92998e]">
                  Active products can be displayed in the catalog.
                </p>
              </div>
            </label>
          )}

          {/* Photos */}
          <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:rounded-2xl sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <SectionTitle>Product photos</SectionTitle>

                <p className="mt-1 text-[10px] text-[#92998e]">
                  New photos upload automatically after you save. JPG, PNG or
                  WEBP.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#315d32]">
                {images.length} photo{images.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group/img relative aspect-square overflow-hidden rounded-xl border border-[#dceacb] bg-white"
                >
                  <img
                    src={image.previewUrl}
                    alt={`Product photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#315d32] py-0.5 text-center text-[9px] font-bold text-white">
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#202a20]/70 text-white transition hover:bg-[#b35a54]"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(image.id)}
                      className="absolute bottom-0 left-0 right-0 bg-[#202a20]/70 py-0.5 text-center text-[9px] font-semibold text-white transition-opacity sm:opacity-0 sm:group-hover/img:opacity-100"
                    >
                      Make primary
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#dceacb] bg-white text-[10px] font-bold text-[#92998e] transition hover:border-[#315d32] hover:text-[#315d32]"
              >
                <ImagePlus className="h-5 w-5" />
                Add photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </div>
          </div>

          {isEdit && (
            <p className="rounded-xl bg-[#f7f8f2] px-3 py-2.5 text-[10px] leading-4 text-[#92998e] sm:text-xs">
              To edit pack sizes (SKU, price, weight, stock), close this and use
              the Edit button on the pack size itself.
            </p>
          )}

          {!isEdit && (
            <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:rounded-2xl sm:p-4">
              <div className="mb-3">
                <SectionTitle>Pack size</SectionTitle>

                <p className="mt-1 text-[10px] text-[#92998e]">
                  Add the initial selling unit and pricing.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
                <FormField label="SKU" required>
                  <input
                    required
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    placeholder="SKU001"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Weight / qty" required>
                  <input
                    required
                    type="number"
                    step="0.001"
                    min="0"
                    value={form.weight}
                    onChange={(e) => update("weight", e.target.value)}
                    placeholder="1"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Unit">
                  <Select
                    value={form.unit}
                    onChange={(e) => update("unit", e.target.value)}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="MRP (₹)" required>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.mrp}
                    onChange={(e) => update("mrp", e.target.value)}
                    placeholder="50"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Selling price (₹)" required>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) => update("sellingPrice", e.target.value)}
                    placeholder="40"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Initial stock (units)">
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          )}
        </form>
      )}
    </ModalShell>
  );
}

/* =========================================================
   PRODUCT DETAIL MODAL
========================================================= */

function ProductDetailModal({ product, getStockStatus, onClose, onEdit }) {
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.imageUrl || product.image || product.productImage || ""].filter(
          Boolean
        );

  const variants = product.variants || [];

  const active =
    product.isActive !== undefined
      ? product.isActive
      : product.active !== undefined
      ? product.active
      : true;

  const mainImage = images[activeImage] || images[0] || "";

  return (
    <ModalShell
      eyebrow="Product details"
      title={product.name}
      subtitle={[product.brand?.name, product.category?.name || "Uncategorized"]
        .filter(Boolean)
        .join(" · ")}
      badge={
        <StatusBadge tone={active ? "brand" : "neutral"} onDark>
          {active ? "Active" : "Inactive"}
        </StatusBadge>
      }
      size="lg"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>Close</ModalButton>

          <ModalButton primary onClick={onEdit}>
            <Pencil size={13} />
            Edit product
          </ModalButton>
        </>
      }
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Gallery */}
        <div className="overflow-hidden rounded-xl border border-[#dceacb] bg-[#f7f8f2] sm:rounded-2xl">
          <div className="flex h-52 items-center justify-center sm:h-64">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#92998e]">
                <ImageOff className="h-9 w-9" />
                <span className="text-xs font-medium">No photo available</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-[#dceacb] bg-white p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    index === activeImage
                      ? "border-[#315d32]"
                      : "border-[#dceacb] opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:p-4">
          <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
            Description
          </p>

          <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-5 text-[#202a20] sm:text-sm sm:leading-6">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <MetaRow label="Slug" value={product.slug || "—"} />
          <MetaRow label="Product ID" value={product.id} />
          <MetaRow label="Created" value={formatDate(product.createdAt)} />
          <MetaRow label="Last updated" value={formatDate(product.updatedAt)} />
        </div>

        {/* Variants */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#667065]">
              Pack sizes / variants
            </p>

            <span className="rounded-full bg-[#eef5e7] px-2.5 py-1 text-[9px] font-bold text-[#315d32]">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
          </div>

          {variants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dceacb] p-6 text-center text-xs font-semibold text-[#92998e]">
              No pack sizes available.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-xl border border-[#dceacb] md:block">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="bg-[#f7f8f2]">
                      {["SKU", "Pack", "MRP", "Price", "Stock", "Status"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="border-b border-[#edf1e9] px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-[#92998e]"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {variants.map((variant) => {
                      const stockStatus = getStockStatus
                        ? getStockStatus(variant)
                        : { text: "—", tone: "neutral" };

                      const variantActive =
                        variant.isActive !== undefined ? variant.isActive : true;
                      const variantAvailable =
                        variant.isAvailable !== undefined
                          ? variant.isAvailable
                          : true;

                      return (
                        <tr
                          key={variant.id}
                          className="border-b border-[#edf1e9] last:border-0"
                        >
                          <td className="px-3 py-3 text-xs font-bold text-[#202a20]">
                            {variant.sku}
                          </td>

                          <td className="px-3 py-3 text-xs text-[#667065]">
                            {variant.weight} {variant.unit}
                          </td>

                          <td className="px-3 py-3 text-xs text-[#667065]">
                            {money(variant.mrp)}
                          </td>

                          <td className="px-3 py-3 text-xs font-black text-[#315d32]">
                            {money(variantPrice(variant))}
                          </td>

                          <td className="px-3 py-3">
                            <StatusBadge tone={stockStatus.tone}>
                              {stockStatus.text}
                            </StatusBadge>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <StatusBadge tone={variantActive ? "brand" : "neutral"}>
                                {variantActive ? "Active" : "Inactive"}
                              </StatusBadge>

                              <StatusBadge tone={variantAvailable ? "brand" : "amber"}>
                                {variantAvailable ? "For sale" : "Not for sale"}
                              </StatusBadge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 md:hidden">
                {variants.map((variant) => {
                  const stockStatus = getStockStatus
                    ? getStockStatus(variant)
                    : { text: "—", tone: "neutral" };

                  const variantActive =
                    variant.isActive !== undefined ? variant.isActive : true;
                  const variantAvailable =
                    variant.isAvailable !== undefined
                      ? variant.isAvailable
                      : true;

                  return (
                    <div
                      key={variant.id}
                      className="rounded-xl border border-[#dceacb] bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-[#202a20]">
                            {variant.sku}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#92998e]">
                            {variant.weight} {variant.unit}
                          </p>
                        </div>

                        <StatusBadge tone={stockStatus.tone}>
                          {stockStatus.text}
                        </StatusBadge>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <MetaRow label="MRP" value={money(variant.mrp)} />
                        <MetaRow label="Price" value={money(variantPrice(variant))} />
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <StatusBadge tone={variantActive ? "brand" : "neutral"}>
                          {variantActive ? "Active" : "Inactive"}
                        </StatusBadge>

                        <StatusBadge tone={variantAvailable ? "brand" : "amber"}>
                          {variantAvailable ? "For sale" : "Not for sale"}
                        </StatusBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   ADD VARIANT MODAL
========================================================= */

function AddVariantModal({ productName, onClose, onSave }) {
  const [form, setForm] = useState({
    sku: "",
    weight: "",
    unit: "G",
    mrp: "",
    sellingPrice: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.sku.trim()) return setError("SKU is required.");
    if (form.weight === "" || Number(form.weight) < 0)
      return setError("Weight is required.");
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
      });

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to add pack size.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      eyebrow="New pack size"
      title="Add pack size"
      subtitle={productName}
      onClose={() => !loading && onClose()}
      footer={
        <>
          <ModalButton onClick={onClose} disabled={loading}>
            Cancel
          </ModalButton>

          <ModalButton primary type="submit" form="add-variant-form" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Adding..." : "Add pack size"}
          </ModalButton>
        </>
      }
    >
      <form id="add-variant-form" onSubmit={submit} className="space-y-3.5 sm:space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}

        <VariantFields form={form} update={update} />
      </form>
    </ModalShell>
  );
}

/* =========================================================
   EDIT VARIANT MODAL
========================================================= */

function EditVariantModal({ productName, variant, onClose, onSave }) {
  const [form, setForm] = useState({
    sku: variant.sku || "",
    weight: variant.weight != null ? String(variant.weight) : "",
    unit: variant.unit || "G",
    mrp: variant.mrp != null ? String(variant.mrp) : "",
    sellingPrice:
      variant.sellingPrice != null
        ? String(variant.sellingPrice)
        : variant.price != null
        ? String(variant.price)
        : "",
    isActive: variant.isActive !== undefined ? variant.isActive : true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.sku.trim()) return setError("SKU is required.");
    if (form.weight === "" || Number(form.weight) < 0)
      return setError("Weight is required.");
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
    <ModalShell
      eyebrow="Edit pack size"
      title={variant.sku || "Edit pack size"}
      subtitle={productName}
      onClose={() => !loading && onClose()}
      footer={
        <>
          <ModalButton onClick={onClose} disabled={loading}>
            Cancel
          </ModalButton>

          <ModalButton primary type="submit" form="edit-variant-form" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Saving..." : "Save changes"}
          </ModalButton>
        </>
      }
    >
      <form id="edit-variant-form" onSubmit={submit} className="space-y-3.5 sm:space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}

        <VariantFields form={form} update={update} />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-3 sm:p-3.5">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 accent-[#315d32]"
          />

          <div>
            <p className="text-xs font-black text-[#202a20]">Variant active</p>

            <p className="text-[10px] text-[#92998e]">
              Active pack sizes can be sold.
            </p>
          </div>
        </label>
      </form>
    </ModalShell>
  );
}

function VariantFields({ form, update }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
        <FormField label="SKU" required>
          <input
            required
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            placeholder="SKU001"
            className={inputClass}
          />
        </FormField>

        <FormField label="Weight / qty" required>
          <input
            required
            type="number"
            step="0.001"
            min="0"
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="1"
            className={inputClass}
          />
        </FormField>

        <FormField label="Unit">
          <Select value={form.unit} onChange={(e) => update("unit", e.target.value)}>
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        <FormField label="MRP (₹)" required>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.mrp}
            onChange={(e) => update("mrp", e.target.value)}
            placeholder="50"
            className={inputClass}
          />
        </FormField>

        <FormField label="Selling price (₹)" required>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.sellingPrice}
            onChange={(e) => update("sellingPrice", e.target.value)}
            placeholder="40"
            className={inputClass}
          />
        </FormField>
      </div>
    </>
  );
}

/* =========================================================
   RECEIVE STOCK MODAL
========================================================= */

function ReceiveStockModal({ productName, variant, currentStock, onClose, onSave }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!quantity || Number(quantity) <= 0)
      return setError("Please enter a valid quantity.");
    if (!reason.trim()) return setError("Please enter a reason or note.");

    try {
      setLoading(true);

      await onSave({
        quantity: Number(quantity),
        reason: reason.trim(),
        performedBy: localStorage.getItem("staffName") || "Staff",
      });

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to add stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      eyebrow="Inventory"
      title="Receive stock"
      subtitle={`${productName} · ${variant.sku}`}
      size="sm"
      onClose={() => !loading && onClose()}
      footer={
        <>
          <ModalButton onClick={onClose} disabled={loading}>
            Cancel
          </ModalButton>

          <ModalButton primary type="submit" form="receive-stock-form" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Adding..." : "Add stock"}
          </ModalButton>
        </>
      }
    >
      <form id="receive-stock-form" onSubmit={submit} className="space-y-3.5 sm:space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <MetaRow label="SKU" value={variant.sku || "—"} />
          <MetaRow
            label="Current stock"
            value={currentStock === null || currentStock === undefined ? "—" : currentStock}
          />
        </div>

        <FormField label="Quantity received" required>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className={inputClass}
          />
        </FormField>

        <FormField label="Reason / note" required>
          <input
            required
            placeholder="e.g. Weekly restock from distributor"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
          />
        </FormField>
      </form>
    </ModalShell>
  );
}

/* =========================================================
   SHARED UI PIECES
========================================================= */

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

function StatusBadge({ tone = "neutral", children, onDark = false }) {
  return (
    <span
      className={`inline-flex max-w-full min-h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-black sm:min-h-7 sm:px-2.5 sm:text-[9px] ${
        onDark ? "bg-white text-[#315d32]" : TONE_STYLE[tone]
      }`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false, loading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-[10px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs ${
        danger
          ? "border-[#efd3d0] bg-[#fff8f7] text-[#b35a54] hover:border-[#b35a54] hover:bg-[#f8ecea]"
          : "border-[#dceacb] bg-white text-[#667065] hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}

function MiniAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dceacb] bg-white px-2.5 text-[10px] font-bold text-[#667065] transition hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32]"
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </button>
  );
}

function MobileAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg border border-[#dceacb] bg-white text-[9px] font-bold text-[#667065] transition active:scale-[0.97]"
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#dceacb] bg-[#f7f8f2] p-2.5 sm:p-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-[#92998e]">
        {label}
      </p>

      <p className="mt-1 break-words text-[11px] font-bold text-[#202a20] sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wider text-[#315d32]">
      {children}
    </p>
  );
}

function ErrorBox({ children }) {
  return (
    <div className="rounded-xl border border-[#efd3d0] bg-[#f8ecea] px-3 py-2.5 text-[11px] font-semibold text-[#b35a54] sm:text-sm">
      {children}
    </div>
  );
}

function FormField({ label, required, hint, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#667065]">
        {label}
        {required && <span className="ml-0.5 text-[#b35a54]">*</span>}
      </label>

      {children}

      {hint && <p className="mt-1 text-[10px] text-[#92998e]">{hint}</p>}
    </div>
  );
}

function Select({ children, value, onChange, required, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const options = Children.toArray(children)
    .filter((child) => child && child.props)
    .map((child) => ({
      value: String(child.props.value ?? ""),
      label: child.props.children,
    }));

  const current = String(value ?? "");
  const selected = options.find((o) => o.value === current) || options[0];

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (option) => {
    setOpen(false);
    onChange?.({ target: { value: option.value } });
  };

  return (
    <div ref={wrapRef} className="relative w-full min-w-0">
      {required && (
        <input
          tabIndex={-1}
          required
          value={current}
          onChange={() => {}}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`${inputClass} flex items-center pr-9 text-left hover:border-[#315d32] disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="truncate">{selected?.label}</span>
      </button>

      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92998e] transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#dceacb] bg-white p-1 shadow-[0_18px_45px_rgba(49,93,50,0.16)]">
          {options.map((option) => {
            const isSelected = option.value === current;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition sm:text-sm ${
                  isSelected
                    ? "bg-[#eef5e7] text-[#315d32]"
                    : "text-[#202a20] hover:bg-[#eef5e7] hover:text-[#315d32]"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
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

const MODAL_SIZE = {
  sm: "max-w-[440px]",
  md: "max-w-[540px]",
  lg: "max-w-[720px]",
};

function ModalShell({
  eyebrow,
  title,
  subtitle,
  badge,
  size = "md",
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
        className={`flex max-h-[96vh] w-full flex-col overflow-hidden rounded-[18px] border border-[#dceacb] bg-white shadow-[0_25px_80px_rgba(49,93,50,0.2)] sm:max-h-[90vh] sm:rounded-[26px] ${MODAL_SIZE[size]}`}
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