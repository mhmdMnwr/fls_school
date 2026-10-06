import { Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ParentLayout() {
  const navigate = useNavigate();

  const studentJson = localStorage.getItem('fls_parent_student');
  const student = studentJson ? JSON.parse(studentJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('fls_parent_token');
    localStorage.removeItem('fls_parent_student');
    navigate('/parent', { replace: true });
  };

  return (
    <div className="min-h-screen bg-page-bg text-body flex flex-col overflow-x-hidden w-full max-w-full">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#312E81] to-[#4338CA] text-white shadow-md w-full max-w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-1 border border-white/20">
              <img
                src="/images/fls-logo.png"
                alt="FLS School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-black text-base leading-tight tracking-tight text-white">FLS School</div>
              <div className="text-xs text-white/85 font-bold">Espace Parent</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {student && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-white/80" />
                <span>{student.firstName} {student.lastName}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/90 hover:text-white hover:bg-white/15 gap-1.5 text-xs rounded-xl h-9 px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-6 min-w-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-line-soft py-4 text-center text-xs text-muted">
        FLS School &copy; {new Date().getFullYear()} &middot; Espace Parent Sécurisé
      </footer>
    </div>
  );
}
