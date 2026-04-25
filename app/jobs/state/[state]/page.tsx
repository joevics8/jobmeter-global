import { redirect } from 'next/navigation';

const STATE_MAP: Record<string, string> = {
  abia: 'nigeria', adamawa: 'nigeria', 'akwa-ibom': 'nigeria',
  anambra: 'nigeria', bauchi: 'nigeria', bayelsa: 'nigeria',
  benue: 'nigeria', borno: 'nigeria', 'cross-river': 'nigeria',
  delta: 'nigeria', ebonyi: 'nigeria', edo: 'nigeria',
  ekiti: 'nigeria', enugu: 'nigeria', gombe: 'nigeria',
  imo: 'nigeria', jigawa: 'nigeria', kaduna: 'nigeria',
  kano: 'nigeria', katsina: 'nigeria', kebbi: 'nigeria',
  kogi: 'nigeria', kwara: 'nigeria', lagos: 'nigeria',
  nasarawa: 'nigeria', niger: 'nigeria', ogun: 'nigeria',
  ondo: 'nigeria', osun: 'nigeria', oyo: 'nigeria',
  plateau: 'nigeria', rivers: 'nigeria', sokoto: 'nigeria',
  taraba: 'nigeria', yobe: 'nigeria', zamfara: 'nigeria',
  abuja: 'nigeria', fct: 'nigeria',
};

export default function OldStateRedirect({ params }: { params: { state: string } }) {
  const slug = params.state.toLowerCase();
  const country = STATE_MAP[slug] || 'nigeria';
  redirect(`/jobs/Location/${country}/${slug}`);
}