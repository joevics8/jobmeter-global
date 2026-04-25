import { redirect } from 'next/navigation';

export default function UKJobPage({ params }: { params: { slug: string } }) {
  redirect(`/jobs/united-kingdom/${params.slug}`);
}
