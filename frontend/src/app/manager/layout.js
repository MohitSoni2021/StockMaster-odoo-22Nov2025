import ManagerNavbar from '@/components/ManagerNavbar';

export const metadata = {
  title: 'Inventory Manager',
  description: 'Manage inventory operations'
};

export default function ManagerLayout({ children }) {
  return (
    <>
      <ManagerNavbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </>
  );
}
