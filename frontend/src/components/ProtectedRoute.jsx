import { Navigate } from "react-router-dom";
import { checkAndRefreshToken } from "../services/api";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const ok = await checkAndRefreshToken();
      setAllowed(ok);
    };
    verify();
  }, []);

  if (allowed === null) return <div>Loading...</div>; // optional spinner
  return allowed ? children : <Navigate to="/login" replace />;
}
