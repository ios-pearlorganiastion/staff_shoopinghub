import api from "./axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

export const getBrands = async () => {
  try {
    const response = await api.get("/brands");
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
  }
};

export const getProducts = async ({ limit = 100, search = "", categoryId = "" } = {}) => {
  try {
    const params = { limit };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;

    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

/*
 * Both create and update carry images directly on the /products route as
 * multipart/form-data (name, slug, description, brandId, categoryId,
 * variants as a JSON string on create, and one or more "images" files).
 * The axios instance strips the default JSON Content-Type for any FormData
 * body, so the browser can set the correct multipart boundary.
 */

export const createProduct = async (formData) => {
  try {
    const response = await api.post("/products", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(getErrorMessage(error, "Failed to create product."));
  }
};

export const updateProduct = async (productId, formData) => {
  try {
    const response = await api.patch(`/products/${productId}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(getErrorMessage(error, "Failed to update product."));
  }
};

// Add pack size — a dedicated action, one variant at a time (AddVariantModal).
export const addProductVariant = async (productId, variantData) => {
  try {
    const response = await api.post(`/products/${productId}/variants`, variantData);
    return response.data;
  } catch (error) {
    console.error("Error adding variant:", error);
    throw new Error(getErrorMessage(error, "Failed to add pack size."));
  }
};

// Edit a pack size's own fields (EditVariantModal), or a single-field patch
// like the Activate/Deactivate toggle. Never called as a side effect of
// saving the parent product — only ever for an explicit variant action.
export const updateProductVariant = async (productId, variantId, variantData) => {
  try {
    const response = await api.patch(`/products/${productId}/variants/${variantId}`, variantData);
    return response.data;
  } catch (error) {
    console.error("Error updating variant:", error);
    throw new Error(getErrorMessage(error, "Failed to update pack size."));
  }
};

export const getVariantInventory = async (variantId) => {
  try {
    const response = await api.get(`/inventory/${variantId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
  }
};

export const receiveStock = async (variantId, stockData) => {
  try {
    const response = await api.post(`/inventory/${variantId}/receive`, stockData);
    return response.data;
  } catch (error) {
    console.error("Error receiving stock:", error);
    throw new Error(getErrorMessage(error, "Failed to add stock."));
  }
};

export const bulkImportProducts = async (categoryId, brandId, file) => {
  try {
    const formData = new FormData();
    formData.append("categoryId", categoryId);
    if (brandId) formData.append("brandId", brandId);
    formData.append("file", file);

    const response = await api.post("/products/bulk-import", formData);
    return response.data;
  } catch (error) {
    console.error("Error bulk importing products:", error);
    throw new Error(getErrorMessage(error, "Failed to bulk import products."));
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(getErrorMessage(error, "Failed to delete product."));
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error(getErrorMessage(error, "Failed to load product."));
  }
};