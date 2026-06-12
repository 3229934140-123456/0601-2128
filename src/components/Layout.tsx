import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Calendar, Ticket, User, LogOut, LayoutDashboard, Settings, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from './ui/Badge';
import { mockApi } from '@/mock';
import { cn } from '@/lib/utils';

export const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const unreadCount = mockApi.getNotifications().filter(n => !n.read && n.userId === user?.id).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isAdmin
    ? [
        { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
        { path: '/admin/activities', label: '活动管理', icon: Calendar },
        { path: '/admin/registrations', label: '报名审核', icon: User },
        { path: '/admin/checkin', label: '签到核销', icon: Ticket },
        { path: '/admin/waitlist', label: '候补管理', icon: Settings },
        { path: '/admin/statistics', label: '数据统计', icon: BarChart3 },
      ]
    : [
        { path: '/activities', label: '活动列表', icon: Calendar },
        { path: '/my-tickets', label: '我的票券', icon: Ticket },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#165DFF] to-[#0E42D2] rounded-xl flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-lg">文</span>
                </div>
                <span className="font-serif font-semibold text-xl text-gray-900">
                  数字文化馆
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#165DFF] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {!isAdmin && (
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="danger"
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              )}
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isAdmin ? '管理员' : '市民'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#165DFF] to-[#0E42D2] flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/login')}>登录</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2026 数字文化馆票务系统 · 传承文化，服务市民</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function BarChart3(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12" y="8" width="3" height="10" />
      <rect x="17" y="5" width="3" height="13" />
    </svg>
  );
}

export default Layout;
