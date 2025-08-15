import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col ml-56 min-h-screen">
        
        <AdminHeader />

        
        <main className="flex-1 px-2 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
