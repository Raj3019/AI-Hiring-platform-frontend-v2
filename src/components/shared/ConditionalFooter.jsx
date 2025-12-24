'use client';
import { useAuthStore } from '@/lib/store';
import Footer from './Footer';

const ConditionalFooter = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return null;
  }

  return <Footer />;
};

export default ConditionalFooter;
