import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.js';

interface HeaderProps {
  title?: string;
  back?: { to: string; label: string };
  actions?: React.ReactNode;
}

export function Header({ title, back, actions }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-3 bg-white border-b border-gray-200">
      {back && (
        <Link
          to={back.to}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {back.label}
        </Link>
      )}
      {back && title && <span className="text-gray-300">/</span>}
      {!back && (
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Dolphboard</span>
        </Link>
      )}
      {title && <span className="font-medium text-gray-900 text-sm truncate">{title}</span>}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        {user && (
          <div className="flex items-center gap-2 ml-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name[0].toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
