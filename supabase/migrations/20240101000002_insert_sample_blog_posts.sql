-- Insert sample blog posts for testing
-- Note: Replace author_id with an actual user ID from your auth.users table, or use NULL for now
-- Using dollar-quoting to handle quotes in content

INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  category,
  tags,
  meta_title,
  meta_description,
  published_at,
  author_id,
  is_published,
  seo_keywords
) VALUES (
  '10 Essential Tips for Acing Your Next Job Interview',
  '10-essential-tips-job-interview',
  'Learn proven strategies to prepare for interviews, answer questions confidently, and make a lasting impression on hiring managers.',
  $content1$
<h2>Introduction</h2>
<p>Job interviews can be nerve-wracking, but with the right preparation, you can approach them with confidence. In this comprehensive guide, we'll share 10 essential tips that will help you ace your next job interview.</p>

<h2>1. Research the Company Thoroughly</h2>
<p>Before your interview, spend time researching the company's mission, values, recent news, and the specific role you're applying for. This knowledge will help you ask informed questions and demonstrate genuine interest.</p>

<h2>2. Prepare STAR Method Answers</h2>
<p>The STAR method (Situation, Task, Action, Result) is a powerful framework for answering behavioral interview questions. Prepare 3-5 stories from your past experiences that showcase your skills and achievements.</p>

<h2>3. Practice Common Interview Questions</h2>
<p>While you can't predict every question, practicing common ones like "Tell me about yourself" and "Why do you want this job?" will help you deliver confident, structured responses.</p>

<h2>4. Dress Professionally</h2>
<p>First impressions matter. Dress appropriately for the company culture - when in doubt, it's better to be slightly overdressed than underdressed.</p>

<h2>5. Arrive Early</h2>
<p>Plan to arrive 10-15 minutes early. This shows punctuality and gives you time to compose yourself before the interview begins.</p>

<h2>6. Bring Necessary Documents</h2>
<p>Bring multiple copies of your resume, a list of references, portfolio samples (if applicable), and any questions you want to ask the interviewer.</p>

<h2>7. Ask Thoughtful Questions</h2>
<p>Prepare 3-5 questions that show your interest in the role and company. Good questions demonstrate that you've done your research and are thinking critically about the position.</p>

<h2>8. Listen Carefully</h2>
<p>Active listening is crucial. Pay attention to what the interviewer is saying, and don't interrupt. Take notes if appropriate, and use their words in your responses to show alignment.</p>

<h2>9. Follow Up After the Interview</h2>
<p>Send a thank-you email within 24 hours of your interview. Personalize it by mentioning specific points from your conversation to reinforce your interest and help them remember you.</p>

<h2>10. Stay Positive and Confident</h2>
<p>Maintain a positive attitude throughout the interview. Confidence (not arrogance) shows that you believe in your abilities and are ready to contribute to the team.</p>

<h2>Conclusion</h2>
<p>Remember, interviews are a two-way street - you're also evaluating if this role and company are the right fit for you. With proper preparation and these tips, you'll be well-equipped to make a great impression.</p>
$content1$,
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
  'Interview Tips',
  ARRAY['interview', 'job search', 'career advice', 'professional development'],
  '10 Essential Tips for Acing Your Next Job Interview | JobMeter',
  'Learn proven strategies to prepare for job interviews, answer questions confidently, and make a lasting impression on hiring managers. Expert interview tips and advice.',
  NOW(),
  NULL,
  true,
  ARRAY['job interview tips', 'interview preparation', 'interview questions', 'job interview advice', 'interview skills']
),
(
  'How to Optimize Your CV for ATS Systems',
  'optimize-cv-ats-systems',
  'Discover how to format your CV to pass Applicant Tracking Systems (ATS) and increase your chances of landing interviews.',
  $content2$
<h2>Understanding ATS Systems</h2>
<p>Applicant Tracking Systems (ATS) are software tools used by employers to screen and manage job applications. Most companies use ATS to filter resumes before they reach human recruiters.</p>

<h2>Why ATS Optimization Matters</h2>
<p>Studies show that up to 75% of resumes never make it past ATS screening. Optimizing your CV for ATS can significantly increase your chances of getting noticed by hiring managers.</p>

<h2>Key Strategies for ATS-Friendly CVs</h2>

<h3>1. Use Standard Section Headings</h3>
<p>Use clear, standard section headings like "Work Experience", "Education", "Skills", and "Contact Information". Avoid creative or unusual headings that ATS might not recognize.</p>

<h3>2. Include Relevant Keywords</h3>
<p>Carefully review the job description and incorporate relevant keywords naturally throughout your CV. Focus on skills, qualifications, and industry terms mentioned in the posting.</p>

<h3>3. Keep Formatting Simple</h3>
<p>Use a clean, simple format with standard fonts (Arial, Calibri, or Times New Roman). Avoid tables, graphics, headers, footers, and complex formatting that can confuse ATS systems.</p>

<h3>4. Use Standard File Formats</h3>
<p>Save your CV as a PDF or Word document (.docx). Some older ATS systems may have trouble reading PDFs, so check the job posting for preferred formats.</p>

<h3>5. Optimize Your Skills Section</h3>
<p>Create a dedicated skills section and list relevant hard skills. Match the terminology used in the job description - if they use "JavaScript", don't write "JS".</p>

<h2>Common ATS Mistakes to Avoid</h2>
<ul>
  <li>Using images, logos, or graphics in your CV</li>
  <li>Including text in headers or footers (ATS often ignores these areas)</li>
  <li>Using creative fonts or unusual formatting</li>
  <li>Missing contact information or placing it in unexpected locations</li>
  <li>Submitting a CV that doesn't match the job requirements</li>
</ul>

<h2>Testing Your ATS-Optimized CV</h2>
<p>Before submitting, test your CV by copying and pasting it into a plain text editor. If it's readable and well-structured in plain text, it will likely pass through ATS systems successfully.</p>

<h2>Conclusion</h2>
<p>Optimizing your CV for ATS is essential in today's job market. By following these guidelines, you'll increase your chances of getting past the initial screening and reaching the hands of hiring managers.</p>
$content2$,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
  'CV & Resume',
  ARRAY['CV optimization', 'ATS', 'resume tips', 'job application'],
  'How to Optimize Your CV for ATS Systems | JobMeter',
  'Learn how to format your CV to pass Applicant Tracking Systems and increase your chances of landing interviews. ATS optimization tips and strategies.',
  NOW() - INTERVAL '1 day',
  NULL,
  true,
  ARRAY['ATS optimization', 'CV formatting', 'resume tips', 'ATS-friendly CV', 'job application']
),
(
  '5 Career Development Strategies for Professional Growth',
  'career-development-strategies',
  'Explore proven strategies to advance your career, develop new skills, and achieve your professional goals.',
  $content3$
<h2>Introduction</h2>
<p>Career development is an ongoing process that requires intentional planning and continuous learning. Whether you're just starting out or looking to advance, these strategies will help you grow professionally.</p>

<h2>1. Set Clear Career Goals</h2>
<p>Define both short-term and long-term career objectives. Break them down into actionable steps and regularly review your progress. Having clear goals provides direction and motivation.</p>

<h2>2. Invest in Continuous Learning</h2>
<p>The professional landscape is constantly evolving. Stay relevant by:
<ul>
  <li>Taking online courses and certifications</li>
  <li>Attending industry conferences and workshops</li>
  <li>Reading industry publications and books</li>
  <li>Learning new technologies and tools</li>
</ul>
</p>

<h2>3. Build Your Professional Network</h2>
<p>Networking is crucial for career growth. Attend industry events, join professional associations, connect on LinkedIn, and maintain relationships with colleagues and mentors.</p>

<h2>4. Seek Feedback and Mentorship</h2>
<p>Regular feedback helps you understand your strengths and areas for improvement. Find a mentor who can provide guidance, share experiences, and help you navigate career challenges.</p>

<h2>5. Take on Challenging Projects</h2>
<p>Volunteer for projects that push you outside your comfort zone. These experiences help you develop new skills, demonstrate initiative, and showcase your capabilities to decision-makers.</p>

<h2>Conclusion</h2>
<p>Career development is a journey, not a destination. By implementing these strategies consistently, you'll build the skills, network, and experience needed to achieve your professional aspirations.</p>
$content3$,
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop',
  'Career Development',
  ARRAY['career growth', 'professional development', 'career planning', 'skills development'],
  '5 Career Development Strategies for Professional Growth | JobMeter',
  'Discover proven strategies to advance your career, develop new skills, and achieve your professional goals. Expert career development advice.',
  NOW() - INTERVAL '2 days',
  NULL,
  true,
  ARRAY['career development', 'professional growth', 'career planning', 'career advancement', 'professional skills']
);
