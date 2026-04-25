export async function submitToIndexNow(slug: string) {
  const apiKey = process.env.INDEXNOW_API_KEY;
  
  if (!apiKey) return false;
  
  const jobUrl = `https://www.jobmeter.app/jobs/${slug}`;
  
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.jobmeter.app',
        key: apiKey,
        keyLocation: `https://www.jobmeter.app/${apiKey}.txt`,
        urlList: [jobUrl]
      })
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return false;
  }
}