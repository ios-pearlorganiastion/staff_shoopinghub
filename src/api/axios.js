import axios from "axios";

const api = axios.create({
  // baseURL: "http://72.62.228.103:3000",
  baseURL: "https://2np24kf8-3001.inc1.devtunnels.ms",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 40000, // Set a timeout of 10 seconds
});

api.interceptors.request.use(
  (config) => {
    const session = JSON.parse(
      localStorage.getItem("staffSession")
    );

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    /*
     * The instance-level default above ("application/json") stops axios
     * from ever auto-detecting FormData bodies, so a multipart request
     * would get sent with the wrong Content-Type (no boundary) and the
     * backend would see an empty/unparseable body.
     *
     * Whenever a request's data IS a FormData instance (product photo
     * uploads, etc.), drop the Content-Type header here so the browser
     * sets "multipart/form-data; boundary=..." itself.
     */
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === "function") {
        // AxiosHeaders instance (axios v1+)
        config.headers.delete("Content-Type");
      } else if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("staffSession");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;