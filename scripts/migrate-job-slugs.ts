import { createClient } from '@supabase/supabase-js';
import { generateUniqueSlug } from '../lib/utils/slugGenerator';

async function migrateJobSlugs() {
  // Use service role key for migrations (more permissions)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key
  );

  console.log('Starting job slug migration...');

  try {
    // Get all jobs that don't have slugs yet
    const { data: jobsWithoutSlugs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, company')
      .or('slug.is.null,slug.eq.') // Jobs with null or empty slugs
      .limit(500); // Process in smaller batches

    if (fetchError) {
      console.error('Error fetching jobs without slugs:', fetchError);
      return;
    }

    if (!jobsWithoutSlugs || jobsWithoutSlugs.length === 0) {
      console.log('No jobs found that need slug migration.');
      return;
    }

    console.log(`Found ${jobsWithoutSlugs.length} jobs to migrate`);

    // Process jobs in batches to avoid rate limits
    const batchSize = 10;
    let processed = 0;
    let errors = 0;

    for (let i = 0; i < jobsWithoutSlugs.length; i += batchSize) {
      const batch = jobsWithoutSlugs.slice(i, i + batchSize);
      
      const promises = batch.map(async (job) => {
        try {
          const companyName = typeof job.company === 'string'
            ? job.company
            : job.company?.name || 'company';
            
          const slug = await generateUniqueSlug(job.title || 'Untitled Job', companyName, job.id);
          
          const { error: updateError } = await supabase
            .from('jobs')
            .update({ slug })
            .eq('id', job.id);
            
          if (updateError) {
            console.error(`Error updating job ${job.id}:`, updateError);
            errors++;
          } else {
            console.log(`✅ Updated job ${job.id} with slug: ${slug}`);
            processed++;
          }
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          errors++;
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`Progress: ${Math.min(i + batchSize, jobsWithoutSlugs.length)}/${jobsWithoutSlugs.length} jobs processed`);
    }

    console.log(`\nMigration completed!`);
    console.log(`✅ Successfully processed: ${processed} jobs`);
    console.log(`❌ Errors: ${errors} jobs`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateJobSlugs()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });