import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Rankings from "./pages/Rankings";
import Tiers from "./pages/Tiers";
import CreateTiers from "./pages/CreateTiers";
import UserTiers from "./pages/UserTiers";
import Register from "./pages/Register";
import PasswordReset from "./pages/PasswordReset";
import ConfirmCode from "./pages/ConfirmCode";
import NewPassword from "./pages/NewPassword";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/rankings"
          element={
            <ProtectedRoute>
              <Rankings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tiers"
          element={
            <ProtectedRoute>
              <Tiers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-tiers"
          element={
            <ProtectedRoute>
              <CreateTiers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-tiers"
          element={
            <ProtectedRoute>
              <UserTiers />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/confirm-code" element={<ConfirmCode />} />
        <Route path="/new-password" element={<NewPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
