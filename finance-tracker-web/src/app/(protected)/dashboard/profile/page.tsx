'use client';
import { useAuthUser } from '@/components/shared';

export default function ProfilePage() {
  const { data: userData, isLoading } = useAuthUser();
  return <div>{isLoading ? <div>Loading...</div> : userData?.email}</div>;
}
