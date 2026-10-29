import GuestGuard from 'src/guards/GuestGuard';
import Login from 'src/views/authentication/Login';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <GuestGuard>
      <Login />
    </GuestGuard>
  );
}
