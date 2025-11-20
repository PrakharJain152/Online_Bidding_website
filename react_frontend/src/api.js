import axios from "axios";

const API = axios.create({
  baseURL: "/",           // proxy sends this to http://localhost:3000
  withCredentials: true,  // send session cookies automatically
});

// ------------------------------
// AUTH
// ------------------------------
export const loginUser = (email, password) =>
  API.post("/login", { email, password });

export const signupUser = (name, email, password) =>
  API.post("/signup", { name, email, password });

export const logoutUser = () => API.get("/logout");

export const adminLogin = (email, password) =>
  API.post("/admin-login", { email, password });

// ------------------------------
// PRODUCTS
// ------------------------------
export const getProducts = () => API.get("/api/products");

export const getProductById = (id) => API.get(`/api/products/${id}`);

// ------------------------------
// BIDS
// ------------------------------
export const placeBid = (product_id, bid_amount) =>
  API.post("/api/bid", { product_id, bid_amount });

// ------------------------------
// USER DASHBOARD
// ------------------------------
export const getUserDashboard = () => API.get("/api/user/dashboard");

// ------------------------------
// ADMIN
// ------------------------------
export const adminAddProduct = (formData) =>
  API.post("/api/admin/add-product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminEditProduct = (id, formData) =>
  API.post(`/api/admin/edit/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminDeleteProduct = (id) =>
  API.post(`/api/admin/delete/${id}`);
