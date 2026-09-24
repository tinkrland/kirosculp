import { Outlet } from "react-router-dom";
import Header from "./Header";
import GrainOverlay from "./GrainOverlay";

export default function AppLayout() {
  return (
    <div className="min-h-screen grid-bg">
      <GrainOverlay />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}