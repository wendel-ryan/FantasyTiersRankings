import { useState } from "react";
import "../styles/Register.css";
import { Link } from "react-router-dom";
import Logo from "../assets/LogoWords.png";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

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
      const res = await register(email, password);
      setMessage(res.msg);
      window.location.href = "/login";
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration failed");
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
    <section className="register-page">
      <div className="register-logo-container">
        <img className="register-logo" src={Logo}></img>
      </div>
      <div className="container register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h1>Register</h1>
          <label for="email-address">Email Address:</label>
          <input
            value={email}
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
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
          <button>Register</button>

          {message && <p className="message">{message}</p>}

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Forgot your password? <Link to="">Reset Password</Link>
          </p>
        </form>
      </div>
      <div className="register-logo-container"></div>
    </section>
  );
}
