import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAndRefreshToken } from "../services/api";

export default function ProtectedRoute() {
  const [allowed, setAllowed] = useState(null);
  console.log("protect");

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setAllowed(false);
          return;
        }
        console.log("check");
        const ok = await checkAndRefreshToken();
        console.log("refresh result:", ok);
        setAllowed(ok);
      } catch (err) {
        console.error("verify error:", err);
        setAllowed(false);
      }
    };
    verify();
  }, []);

  if (allowed === null) return <div>Loading...</div>;
  return allowed ? <Outlet /> : <Navigate to="/login" replace />;
}
