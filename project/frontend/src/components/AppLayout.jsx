import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

export default function AppLayout() {
  return <div className="app-frame"><div className="app-content"><Outlet /></div><BottomNavigation /></div>;
}
