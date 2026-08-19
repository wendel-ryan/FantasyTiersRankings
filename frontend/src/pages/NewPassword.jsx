import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/auth";
import Logo from "../assets/LogoWords.png";
import "../styles/NewPassword.css";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  localStorage.removeItem("reset_code");

  const email = localStorage.getItem("reset_email");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password != confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isValidPassword(password)) {
      setMessage(
        "Password must be 6+ characters, include uppercase, lowercase, and a symbol.",
      );
      return;
    }

    try {
      const email = localStorage.getItem("reset_email");

      const res = await resetPassword(email, password);

      setMessage(res.msg);
      localStorage.removeItem("reset_email");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.detail || err.message || "Something went wrong",
      );
    }
  };

  function isValidPassword(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const longEnough = password.length >= 6;

    return hasUpper && hasLower && hasSymbol && longEnough;
  }

  return (
    <section className="new-password-page">
      <div className="new-password-logo-container">
        <img className="new-password-logo" src={Logo}></img>
      </div>
      <div className="container new-password-container">
        <form onSubmit={handleSubmit} className="new-password-form">
          <h1>New Password</h1>
          <label for="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label for="password">Confirm Password:</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button>Submit</button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
      <div className="new-password-logo-container"></div>
    </section>
  );
}
