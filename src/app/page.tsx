import { redirect } from 'next/navigation';

export default function HomePage() {
  // Directly redirect root URL to Admin Studio dashboard
  redirect('/admin');
}
