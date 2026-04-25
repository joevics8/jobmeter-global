import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
import Link from 'next/link';
import { MapPin, Briefcase } from 'lucide-react';
import AdUnit from '@/components/ads/AdUnit';

export const metadata: Metadata = {
  title: 'Browse Jobs by State in Nigeria | JobMeter',
  description: 'Find job opportunities across all 36 states in Nigeria and Abuja. Browse jobs by location and discover your next career move.',
  keywords: [
    'jobs by state',
    'nigeria jobs by location',
    'state jobs',
    'regional jobs nigeria',
    'jobs by location',
  ],
  openGraph: {
    title: 'Browse Jobs by State in Nigeria | JobMeter',
    description: 'Find job opportunities across all states in Nigeria',
    type: 'website',
  },
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja'
];

interface StateJobCount {
  state: string;
  count: number;
}

async function getJobCountsByState(): Promise<StateJobCount[]> {
  try {
    const supabase = getSupabase();

    // Fetch counts using the new state[] column — one query per state is too slow,
    // so fetch all active jobs' state arrays and count in JS
    const { data: allJobs, error } = await supabase
      .from('jobs')
      .select('state')
      .eq('status', 'active')
      .not('state', 'is', null);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NIGERIAN_STATES.map(state => ({ state, count: 0 }));
    }

    // Count jobs for each state using the text[] column
    const counts = NIGERIAN_STATES.map((stateName) => {
      const count = (allJobs || []).filter((job) => {
        const stateArr: string[] = job.state || [];
        return stateArr.some(s => s.toLowerCase() === stateName.toLowerCase());
      }).length;
      return { state: stateName, count };
    });

    return counts.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getJobCountsByState:', error);
    return NIGERIAN_STATES.map(state => ({ state, count: 0 }));
  }
}

export const revalidate = false;

export default async function AllStatesPage() {
  const stateCounts = await getJobCountsByState();
  const totalJobs = stateCounts.reduce((sum, state) => sum + state.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white" style={{ backgroundColor: '#2563EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} />
            <h1 className="text-4xl font-bold">Browse Jobs by Location</h1>
          </div>
          <p className="text-lg text-white max-w-3xl">
            Find job opportunities across all 36 states in Nigeria and the Federal Capital Territory. 
            {totalJobs > 0 && ` ${totalJobs.toLocaleString()}+ jobs available nationwide.`}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">States</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Popular States */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Active Job Markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateCounts.slice(0, 6).map((state) => (
              <Link
                key={state.state}
                href={`/jobs/Location/nigeria/${state.state.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <MapPin size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {state.state}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {state.count} {state.count === 1 ? 'job' : 'jobs'}
                    </p>
                  </div>
                  <Briefcase size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All States Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All States</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stateCounts.map((state) => (
                <Link
                  key={state.state}
                  href={`/jobs/Location/nigeria/${state.state.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-gray-900 group-hover:text-blue-600 font-medium">
                    {state.state}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({state.count})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-12 bg-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find Jobs in Your State?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Set up job alerts to get notified when new opportunities are posted in your preferred location.
          </p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Browse All Jobs
          </Link>
        </div>
      </div>

      <AdUnit slot="9751041788" format="auto" />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100" style={{ height: '50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', overflow: 'hidden' }}>
          <AdUnit slot="3349195672" format="auto" style={{ display: 'block', width: '100%', height: '50px', maxHeight: '50px', overflow: 'hidden' }} />
        </div>
      </div>
    </div>
  );
}