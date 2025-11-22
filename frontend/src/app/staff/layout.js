import StaffNavbar from '@/components/StaffNavbar';

export const metadata = {
  title: 'Staff Dashboard',
  description: 'Staff operations and tasks'
};

export default function StaffLayout({ children }) {
  return (
    <>
      <StaffNavbar />
      <main style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  );
}
