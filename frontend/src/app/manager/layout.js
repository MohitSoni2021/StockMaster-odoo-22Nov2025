import ManagerNavbar from '@/components/ManagerNavbar';

export const metadata = {
  title: 'Inventory Manager',
  description: 'Manage inventory operations'
};

export default function ManagerLayout({ children }) {
  return (
    <>
      <ManagerNavbar />
      <main style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  );
}
