import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/LogoWords.png";
import "../styles/ConfirmCode.css";

export default function ConfirmCode() {
  const [codeInput, setCodeInput] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const storedCode = localStorage.getItem("reset_code");

  const handleConfirm = () => {
    if (codeInput === storedCode) {
      setMessage("Code verified!");
      navigate("/new-password");
    } else {
      setMessage("Invalid code. Try again.");
    }
  };

  return (
    <section className="confirm-page">
      <div className="confirm-logo-container">
        <img className="confirm-logo" src={Logo}></img>
      </div>
      <div className="container confirm-container">
        <div className="confirm-form">
          <h2>Enter Reset Code</h2>

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
      <div className="confirm-logo-container"></div>
    </section>
  );
}
