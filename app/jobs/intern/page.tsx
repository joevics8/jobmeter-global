import { redirect } from 'next/navigation';

export default function InternJobsPage() {
  redirect('/jobs?role_category=intern');
}