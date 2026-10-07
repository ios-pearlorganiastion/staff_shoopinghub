import api from "./axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

export const getAffiliates = async (params = {}) => {
  try {
    const {
      status,
      search,
      channel,
      page,
      limit,
      sort,
    } = params;

    const response = await api.get("/affiliates", {
      params: {
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(channel ? { channel } : {}),
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {}),
        ...(sort ? { sort } : {}),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    throw new Error(getErrorMessage(error, "Failed to load affiliates."));
  }
};

export const getAffiliateStats = async (params = {}) => {
  try {
    const response = await api.get("/affiliates/stats", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate statistics.")
    );
  }
};

export const getAffiliatePayouts = async (params = {}) => {
  try {
    const response = await api.get("/affiliates/payouts", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate payouts.")
    );
  }
};

export const updateAffiliatePayout = async (payoutId, payoutData) => {
  try {
    const response = await api.patch(
      `/affiliates/payouts/${payoutId}`,
      payoutData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating affiliate payout:", error);
    throw new Error(
      getErrorMessage(error, "Failed to update affiliate payout.")
    );
  }
};

export const getAffiliateSettings = async () => {
  try {
    const response = await api.get("/affiliates/settings");
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate settings:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate settings.")
    );
  }
};

export const updateAffiliateSettings = async (settingsData) => {
  try {
    const response = await api.patch("/affiliates/settings", settingsData);
    return response.data;
  } catch (error) {
    console.error("Error updating affiliate settings:", error);
    throw new Error(
      getErrorMessage(error, "Failed to update affiliate settings.")
    );
  }
};

export const getAffiliateReconciliation = async () => {
  try {
    const response = await api.get("/affiliates/reconciliation");
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate reconciliation:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate reconciliation.")
    );
  }
};

export const getAffiliate = async (affiliateId) => {
  try {
    const response = await api.get(`/affiliates/${affiliateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    throw new Error(getErrorMessage(error, "Failed to load affiliate."));
  }
};

export const updateAffiliateStatus = async (affiliateId, statusData) => {
  try {
    const response = await api.patch(
      `/affiliates/${affiliateId}/status`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating affiliate status:", error);
    throw new Error(
      getErrorMessage(error, "Failed to update affiliate status.")
    );
  }
};

export const getAffiliateEarnings = async (affiliateId, params = {}) => {
  try {
    const response = await api.get(
      `/affiliates/${affiliateId}/earnings`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate earnings:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate earnings.")
    );
  }
};

export const getAffiliateDetailStats = async (
  affiliateId,
  params = {}
) => {
  try {
    const response = await api.get(
      `/affiliates/${affiliateId}/stats`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching affiliate detail stats:", error);
    throw new Error(
      getErrorMessage(error, "Failed to load affiliate statistics.")
    );
  }
};

export const createAffiliateAdjustment = async (
  affiliateId,
  adjustmentData
) => {
  try {
    const response = await api.post(
      `/affiliates/${affiliateId}/adjustment`,
      adjustmentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating affiliate adjustment:", error);
    throw new Error(
      getErrorMessage(error, "Failed to create affiliate adjustment.")
    );
  }
};