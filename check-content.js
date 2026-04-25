import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkContentCounts() {
  console.log('🔍 Checking content counts...\n');

  // Check companies
  const { count: companyCount, data: companies } = await supabase
    .from('companies')
    .select('slug, is_published, updated_at', { count: 'exact' })
    .eq('is_published', true);

  console.log(`📊 Published companies: ${companyCount}`);
  if (companies && companies.length > 0) {
    console.log('Sample companies:', companies.slice(0, 3).map(c => c.slug));
  }

  // Check posts
  const { count: postCount, data: posts } = await supabase
    .from('posts')
    .select('slug, is_published, updated_at', { count: 'exact' })
    .eq('is_published', true);

  console.log(`📊 Published posts: ${postCount}`);
  if (posts && posts.length > 0) {
    console.log('Sample posts:', posts.slice(0, 3).map(p => p.slug));
  }

  // Check total (including unpublished)
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total companies (including unpublished): ${totalCompanies}`);
  console.log(`📊 Total posts (including unpublished): ${totalPosts}`);

  // Check jobs count for context
  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log(`📊 Active jobs: ${jobCount}`);
}

checkContentCounts().catch(console.error);