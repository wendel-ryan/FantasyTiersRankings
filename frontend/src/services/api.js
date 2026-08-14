import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://104.207.141.124",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("access_token");

  if (token) {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    // If token expires in < 2 minutes, refresh it
    if (decoded.exp - now < 120) {
      try {
        const res = await axios.post(
          "http://104.207.141.124/refresh",
          {},
          { withCredentials: true },
        );
        console.log(res);
        token = res.data.access_token;
        localStorage.setItem("access_token", token);
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const checkAndRefreshToken = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  const decoded = jwtDecode(token);
  const now = Date.now() / 1000;

  // If expired, try to refresh
  if (decoded.exp < now) {
    try {
      const res = await axios.post(
        "https://104.207.141.124/refresh",
        {},
        { withCredentials: true },
      );
      localStorage.setItem("access_token", res.data.access_token);
      return true;
    } catch (err) {
      console.error("Refresh failed:", err);
      // Refresh token expired or invalid
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return false;
    }
  }

  return true; // still valid
};

export const fetchRankings = () => api.get("/rankings");
export const fetchPlayers = () => api.get("/players");

export const getRanks = (format, source) =>
  api.post("/rankings/", { format: format, source: source });
export const getTiers = () => api.get("/tiers/");
export const saveTiers = (tiers) =>
  api.post("/tiers/load-tiers", { tiers: tiers });
