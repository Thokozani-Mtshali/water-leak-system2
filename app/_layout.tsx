import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // If you want to redirect unauthenticated users from here, do it safely
    // But it's better to redirect from auth layout or a middleware logic
    // router.replace('/auth/login');
  }, []);

  return <Slot />; // MUST render this to mount nested routes
}
