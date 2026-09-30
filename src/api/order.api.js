const API_BASE_URL = "https://api.cdshoppinghub.com";

const normalizeToken = (value) => {
  if (!value) return null;

  const token = String(value)
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (
    !token ||
    token === "null" ||
    token === "undefined"
  ) {
    return null;
  }

  return token;
};

const extractToken = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const stringValue = value.trim();

    if (
      !stringValue ||
      stringValue === "null" ||
      stringValue === "undefined"
    ) {
      return null;
    }

    if (/^Bearer\s+/i.test(stringValue)) {
      return normalizeToken(stringValue);
    }

    try {
      const parsed = JSON.parse(stringValue);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return extractToken(parsed);
      }
    } catch {}

    return normalizeToken(stringValue);
  }

  if (typeof value !== "object") {
    return null;
  }

  const token =
    value.accessToken ||
    value.access_token ||
    value.token ||
    value.staffToken ||
    value.staff_token;

  if (token) {
    return normalizeToken(token);
  }

  const nestedValues = [
    value.data,
    value.staff,
    value.user,
    value.admin,
    value.auth,
    value.session,
    value.result,
  ];

  for (const nested of nestedValues) {
    const nestedToken = extractToken(nested);

    if (nestedToken) {
      return nestedToken;
    }
  }

  return null;
};

const getAuthToken = () => {
  const keys = [
    "staffToken",
    "accessToken",
    "authToken",
    "token",
    "staffSession",
    "staff_token",
    "access_token",
    "session",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    const token = extractToken(value);

    if (token) {
      return token;
    }
  }

  return null;
};

const clearAuthTokens = () => {
  localStorage.removeItem("staffToken");
  localStorage.removeItem("staff_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("staffSession");
  localStorage.removeItem("session");
};

const request = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Staff authentication token not found. Please login again."
    );
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      ...options,
      headers,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data?.success === false) {
    if (response.status === 401) {
      clearAuthTokens();

      throw new Error(
        "Staff login required. Please login again."
      );
    }

    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PACKED",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export const getOrders = async ({
  page = 1,
  limit = 20,
  status = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (status) {
    params.set("status", status);
  }

  return request(
    `/orders?${params.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getAllOrders = async (
  page = 1,
  limit = 20
) => {
  return getOrders({
    page,
    limit,
    status: "",
  });
};

export const getOrdersByStatus = async (
  status,
  page = 1,
  limit = 20
) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(
      `Invalid order status: ${status}`
    );
  }

  return getOrders({
    page,
    limit,
    status,
  });
};

export default {
  getOrders,
  getAllOrders,
  getOrdersByStatus,
  ORDER_STATUSES,
};