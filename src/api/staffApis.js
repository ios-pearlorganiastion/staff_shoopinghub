
import api from "./axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

export const createStaff = async (staffData) => {
  try {
    const response = await api.post("/staff", staffData);
    return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw new Error(getErrorMessage(error, "Failed to create staff."));
  }
};

export const getStaff = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/staff", {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw new Error(getErrorMessage(error, "Failed to load staff."));
  }
};

export const getStaffById = async (staffId) => {
  try {
    const response = await api.get(`/staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw new Error(getErrorMessage(error, "Failed to load staff details."));
  }
};

export const updateStaff = async (staffId, staffData) => {
  try {
    const response = await api.patch(`/staff/${staffId}`, staffData);
    return response.data;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw new Error(getErrorMessage(error, "Failed to update staff."));
  }
};

export const deleteStaff = async (staffId) => {
  try {
    const response = await api.delete(`/staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw new Error(getErrorMessage(error, "Failed to delete staff."));
  }
};
