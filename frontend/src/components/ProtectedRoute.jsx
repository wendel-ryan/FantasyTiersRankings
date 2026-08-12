import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAndRefreshToken } from "../services/api";

export default function ProtectedRoute() {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAllowed(false);
        return;
      }
      const ok = await checkAndRefreshToken();
      setAllowed(ok);
    };
    verify();
  }, []);

  if (allowed === null) return <div>Loading...</div>;
  return allowed ? <Outlet /> : <Navigate to="/login" replace />;
}
