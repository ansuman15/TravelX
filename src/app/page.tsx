import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to agency dashboard by default
  // In production, this would check auth and redirect appropriately
  redirect('/agency');
}
