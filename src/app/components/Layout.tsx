import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard, FileText, Package, Calendar, BookOpen,
  TrendingUp, Bell, ChevronDown, Menu, X, LogOut,
  Settings, User, ShieldCheck
} from 'lucide-react';

type UserRole = 'initiator' | 'manager' | 'director';

interface UserProfile {
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  avatar: string;
}

const users: Record<UserRole, UserProfile> = {
  initiator: { name: 'Иванова М.С.', role: 'initiator', roleLabel: 'Инициатор', department: 'Департамент ИТ', avatar: 'ИМ' },
  manager: { name: 'Петров А.К.', role: 'manager', roleLabel: 'Менеджер закупок', department: 'Отдел закупок', avatar: 'ПА' },
  director: { name: 'Соколов В.Г.', role: 'director', roleLabel: 'Руководитель', department: 'Дирекция', avatar: 'СВ' },
};

const navItems = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/requests', label: 'Заявки', icon: FileText },
  { to: '/lots', label: 'Лоты', icon: Package },
  { to: '/calendar', label: 'Календарь', icon: Calendar },
  { to: '/budget', label: 'Бюджет', icon: TrendingUp },
  { to: '/references', label: 'Справочники', icon: BookOpen },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const [notifications] = useState(4);
  const location = useLocation();
  const user = users[currentRole];

  const pageTitle = navItems.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'ИС Закупки-Бюджет';

  const roleColors: Record<UserRole, string> = {
    initiator: 'bg-blue-100 text-blue-700',
    manager: 'bg-purple-100 text-purple-700',
    director: 'bg-amber-100 text-amber-700',
  };
  const roleIcons: Record<UserRole, React.ReactNode> = {
    initiator: <User className="w-3 h-3" />,
    manager: <Settings className="w-3 h-3" />,
    director: <ShieldCheck className="w-3 h-3" />,
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'} bg-[#0F2554] text-white flex-shrink-0 z-20`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[64px]">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-semibold text-sm leading-tight whitespace-nowrap">ИС «Закупки</div>
              <div className="text-blue-300 text-xs whitespace-nowrap">Бюджет»</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group ${isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Role switcher (demo) */}
        {sidebarOpen && (
          <div className="px-3 pb-4 border-t border-white/10 pt-4">
            <div className="text-xs text-white/40 mb-2 px-1">Демо: переключить роль</div>
            {(Object.keys(users) as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs mb-1 transition-all ${currentRole === role ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                {users[role].roleLabel}
              </button>
            ))}
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center p-3 text-white/40 hover:text-white hover:bg-white/10 transition-all border-t border-white/10"
        >
          <Menu className="w-4 h-4" />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-gray-800 font-semibold">{pageTitle}</h1>
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
              <span>ИС «Закупки-Бюджет»</span>
              <span>/</span>
              <span className="text-[#1B3F8B]">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-[#1B3F8B] hover:bg-blue-50 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#1B3F8B] flex items-center justify-center text-white text-xs font-semibold">
                  {user.avatar}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-800 leading-tight">{user.name}</div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${roleColors[user.role]}`}>
                      {roleIcons[user.role]}
                      {user.roleLabel}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.department}</div>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 text-gray-400" /> Профиль
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4 text-gray-400" /> Настройки
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ currentRole, user }} />
        </main>
      </div>

      {/* Click outside overlay for profile */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
