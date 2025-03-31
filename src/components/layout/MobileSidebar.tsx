
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, BarChart3, ClipboardList, MessageSquare, Settings, Home 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { SheetClose } from "@/components/ui/sheet";

const MobileSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Define navigation items based on user role
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      allowedRoles: ["admin", "client"],
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
      allowedRoles: ["admin"],
    },
    {
      name: "Recommendations",
      href: "/recommendations",
      icon: ClipboardList,
      allowedRoles: ["admin", "client"],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      allowedRoles: ["admin"],
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      allowedRoles: ["admin", "client"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      allowedRoles: ["admin", "client"],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.allowedRoles.includes(user?.role || "")
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-primary">KULSTOCK COMMUNICATION</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <SheetClose asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </SheetClose>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Panel
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <SheetClose asChild>
                  <Link
                    to="/admin/users"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    User Management
                  </Link>
                </SheetClose>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default MobileSidebar;
