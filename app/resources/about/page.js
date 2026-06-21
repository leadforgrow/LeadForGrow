import { redirect } from 'next/navigation';

/** Legacy URL — canonical About page is /about */
export default function ResourcesAboutRedirect() {
  redirect('/about');
}
