import { NavLink, useNavigate } from "react-router-dom";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const item = ({ isActive }) => `nav-item ${isActive ? "active" : ""}`;
  return <nav className="bottom-nav"><NavLink to="/" className={item}>⌂<span>Home</span></NavLink><NavLink to="/pay/send" className={item}>＋<span>Pay</span></NavLink><button className="scan-button" onClick={() => navigate("/pay/scan")}>⌾<small>Scan</small></button><NavLink to="/history" className={item}>▤<span>History</span></NavLink><NavLink to="/more" className={item}>•••<span>More</span></NavLink></nav>;
}
