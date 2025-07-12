import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
