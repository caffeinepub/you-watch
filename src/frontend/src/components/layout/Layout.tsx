import { Outlet } from "@tanstack/react-router";
import BottomNav from "./BottomNav";
import TopNav from "./TopNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
