import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Rankings from "./pages/Rankings";
import CreateTiers from "./pages/CreateTiers";
import UserTiers from "./pages/UserTiers";
import Register from "./pages/Register";
import EmailConfirm from "./pages/EmailConfirm";
import NewPassword from "./pages/NewPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-confirm" element={<EmailConfirm />} />
          <Route path="/new-password" element={<NewPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/user-tiers" element={<UserTiers />} />
          <Route path="/create-tiers" element={<CreateTiers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
