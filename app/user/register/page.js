import { redirect } from 'next/navigation';

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const mode = params?.mode || 'register';
  const map = { login: '/login', register: '/register', forgot: '/forgot-password' };
  redirect(map[mode] || '/register');
}
