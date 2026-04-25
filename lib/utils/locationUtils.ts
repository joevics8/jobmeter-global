export function isValidCity(city: string | null | undefined, state: string): boolean {
  if (!city) return false;
  return city.toLowerCase() !== state.toLowerCase();
}

export function createTownSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export interface TownJobCount {
  city: string;
  count: number;
  slug: string;
}

export function extractTownsFromJobs(jobs: any[], state: string): { townCounts: TownJobCount[], stateOnlyJobs: any[] } {
  const townsMap = new Map<string, number>();
  const stateOnlyJobs: any[] = [];

  jobs.forEach(job => {
    const city = job.location?.city;
    
    if (city && isValidCity(city, state)) {
      townsMap.set(city, (townsMap.get(city) || 0) + 1);
    } else {
      stateOnlyJobs.push(job);
    }
  });

  const townCounts = Array.from(townsMap.entries())
    .map(([city, count]) => ({
      city,
      count,
      slug: createTownSlug(city)
    }))
    .sort((a, b) => b.count - a.count);

  return { townCounts, stateOnlyJobs };
}