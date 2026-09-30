import api from "./axios";

const normalizeToken = (value) => {
  if (!value) return null;

  const token = String(value)
    .replace(/^Bearer\s+/i, "")
    .trim();

  return token || null;
};

export const staffLogin = async (credentials) => {
  const response = await api.post(
    "/auth/staff/login",
    credentials
  );

  const result = response.data;

  const token = normalizeToken(
    result?.data?.accessToken ||
      result?.data?.token ||
      result?.data?.access_token ||
      result?.accessToken ||
      result?.token ||
      result?.access_token
  );

  if (!token) {
    throw new Error(
      result?.message ||
        "Login successful but staff access token was not received."
    );
  }

  const staff =
    result?.data?.staff ||
    result?.staff ||
    null;

  localStorage.setItem("staffToken", token);
  localStorage.setItem("accessToken", token);
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);

  localStorage.setItem(
    "staffSession",
    JSON.stringify({
      accessToken: token,
      staff,
    })
  );

  return result;
};

export default {
  staffLogin,
};