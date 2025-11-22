import ManagerNavbar from '@/components/ManagerNavbar';
import ManagerSidebar from '@/components/ManagerSidebar';

export const metadata = {
  title: 'Inventory Manager',
  description: 'Manage inventory operations'
};

export default function ManagerLayout({ children }) {
  return (
    <>
  <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 w-full">
          <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
            <ManagerSidebar />
            <div>{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
