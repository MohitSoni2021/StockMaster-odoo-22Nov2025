import AdminNavbar from '@/components/AdminNavbar';

export const metadata = {
  title: 'Admin Panel',
  description: 'Administer users and warehouses'
};

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <main style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  );
}
