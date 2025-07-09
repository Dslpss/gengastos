import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CreditCard,
  Tag,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Transações", href: "/transactions", icon: CreditCard },
    { name: "Categorias", href: "/categories", icon: Tag },
    { name: "Orçamentos", href: "/budgets", icon: Target },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block sidebar-mobile" : "hidden"
        } fixed inset-0 z-50 md:relative md:inset-0 md:z-0 md:block md:w-64 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-2xl sidebar-enter`}
      >
        <div className="flex flex-col h-full sidebar-container">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-700/50 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover-glow">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">GenGastos</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 hover-glow"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 sidebar-item hover-glow ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                      : "text-blue-100 hover:text-white hover:bg-blue-700/50 hover:scale-105"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {isActive && <div className="sidebar-active-indicator"></div>}
                  <Icon
                    className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-blue-700/50 p-4 mt-auto">
            <div className="space-y-2">
              {/* User info */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-800/50 transition-all duration-200 glass-effect">
                <div className="user-avatar w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email?.split("@")[0] || "Usuário"}
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="logout-btn w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 hover:scale-105 hover-glow group"
                title="Sair da conta"
              >
                <LogOut className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">GenGastos</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
