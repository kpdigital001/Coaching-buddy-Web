import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {rightAction && <div className="flex items-center gap-2.5">{rightAction}</div>}
    </div>
  );
};

export default Header;
