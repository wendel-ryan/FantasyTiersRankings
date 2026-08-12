import { useState } from "react";
import "../styles/Register.css";
import { Link } from "react-router-dom";
import Logo from "../assets/LogoWords.png";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import emailjs from "@emailjs/browser";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [storedCode, setStoredCode] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Must be a valid email address.");
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

    setMessage(message);
    sendConfirmCode();
  };

  function isValidEmail(email) {
    // basic structure: something@something.something
    const hasAt = /@/.test(email);
    const hasTextBeforeAt = /^[^@]+@/.test(email);
    const hasTextAfterAt = /@[^@]+\./.test(email);
    const hasDomainSuffix = /\.[A-Za-z]{2,}$/.test(email);

    return hasAt && hasTextBeforeAt && hasTextAfterAt && hasDomainSuffix;
  }

  function isValidPassword(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const longEnough = password.length >= 6;

    return hasUpper && hasLower && hasSymbol && longEnough;
  }

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendConfirmCode = async () => {
    const resetCode = generateCode();

    const params = {
      email: email,
      code: resetCode,
    };

    try {
      await emailjs.send(
        "service_c39t6it",
        "template_wbtjnca",
        params,
        "_gRFHqHLO77_tO_uO",
      );

      setMessage("E-mail confirmation code sent! Check your email.");
      setSentCode(true);
      setStoredCode(resetCode);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send reset code.");
    }
  };

  const handleConfirm = async () => {
    if (codeInput === storedCode) {
      try {
        const res = await register(email, password);
        console.log(res);
        if (res.success) {
          setMessage(res.msg);
          navigate("/login");
        }
        setMessage(res.msg);
      } catch (err) {
        setMessage(err.response?.data?.detail || "Registration failed");
      }
      setSentCode(false);
    } else {
      setMessage("Invalid code. Try again.");
    }
  };

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
      {sentCode && (
        <div className="container email-confirm-container">
          <div className="email-confirm-form">
            <h2>Enter Confirmation Code</h2>
            <p>An email code has been sent to {email}</p>
            <input
              type="text"
              placeholder="6-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />

            <button onClick={handleConfirm}>Confirm Code</button>

            {message && <p>{message}</p>}
          </div>
        </div>
      )}
      <div className="register-logo-container"></div>
    </section>
  );
}
