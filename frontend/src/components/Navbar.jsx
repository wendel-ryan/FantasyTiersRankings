import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";
import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // remove JWT
    navigate("/login"); // redirect to login
  };

  return (
    <nav className="navbar">
      <div className="navbar-even">
        <img className="nav-logo" src={Logo} />
      </div>
      <ul className="nav-items">
        <li className="nav-item">Rankings</li>
        <li className="nav-item">Home</li>
        <li className="nav-item">Tiers</li>
      </ul>
      <div className="navbar-even">
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
