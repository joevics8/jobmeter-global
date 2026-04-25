-- KPMG Objective Questions
INSERT INTO objective_questions (company, exam_year, section, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation, difficulty, question_type) VALUES
('KPMG', 2024, 'Numerical Reasoning', 'If a company''s revenue increased from $500,000 to $750,000 in one year, what is the percentage increase?', '25%', '50%', '75%', '100%', NULL, 'B', 'The increase is $250,000. Percentage increase = (250,000/500,000) × 100 = 50%', 'easy', 'aptitude'),
('KPMG', 2024, 'Numerical Reasoning', 'A shop sells a product for $120 after a 20% discount. What was the original price?', '$100', '$140', '$144', '$150', NULL, 'C', 'Let original price be x. After 20% discount: 0.8x = 120, so x = 150', 'medium', 'aptitude'),
('KPMG', 2024, 'Verbal Reasoning', 'Choose the word that is most similar in meaning to "Pragmatic":', 'Idealistic', 'Practical', 'Theoretical', 'Abstract', NULL, 'B', 'Pragmatic means dealing with things sensibly and realistically', 'easy', 'aptitude'),
('KPMG', 2024, 'Logical Reasoning', 'If all Roses are flowers and some flowers fade quickly, which statement is definitely true?', 'All Roses fade quickly', 'Some Roses fade quickly', 'No Roses fade quickly', 'Cannot be determined', NULL, 'D', 'The information does not provide enough to determine which roses fade', 'medium', 'aptitude'),
('KPMG', 2024, 'Numerical Reasoning', 'A business made a profit of $80,000 which was 10% of their revenue. What was their revenue?', '$800,000', '$720,000', '$880,000', '$800', NULL, 'A', 'Revenue = Profit ÷ (Profit Margin) = 80,000 ÷ 0.10 = 800,000', 'medium', 'aptitude'),
('KPMG', 2024, 'Verbal Reasoning', 'Complete the sequence: A, C, E, G, ?', 'H', 'I', 'J', 'K', NULL, 'B', 'The sequence skips one letter each time. After G comes I', 'easy', 'aptitude'),
('KPMG', 2024, 'Abstract Reasoning', 'Which shape comes next in the sequence: Triangle, Square, Pentagon, Hexagon?', 'Circle', 'Heptagon', 'Octagon', 'Diamond', NULL, 'B', 'The shapes increase their number of sides by 1 each time', 'easy', 'aptitude'),
('KPMG', 2024, 'Numerical Reasoning', 'Three workers can complete a task in 6 days. How long would it take 6 workers to complete the same task?', '3 days', '4 days', '2 days', '12 days', NULL, 'A', 'Work is inversely proportional to workers. (3×6)/6 = 3 days', 'medium', 'aptitude');

-- KPMG Theory Questions
INSERT INTO theory_questions (company, exam_year, section, question_text, grading_prompt, difficulty) VALUES
('KPMG', 2024, 'Audit', 'Explain the role of an auditor in ensuring financial statement accuracy. What are the key steps in conducting an audit?', 'Evaluate the user''s understanding of audit procedures, independence, and professional skepticism. Consider clarity, depth, and accuracy of the explanation.', 'medium'),
('KPMG', 2024, 'Financial Analysis', 'A company has a debt-to-equity ratio of 2:1. Discuss the implications of this capital structure and its impact on financial risk.', 'Assess the user''s understanding of leverage, financial risk, cost of capital, and the relationship between debt and equity. Look for mention of interest coverage, bankruptcy risk, and shareholder returns.', 'medium'),
('KPMG', 2024, 'Business Strategy', 'Describe the difference between horizontal and vertical integration. When would a company choose one over the other?', 'Evaluate the understanding of merger strategies, market control, synergies, and risk factors. Look for examples and strategic reasoning.', 'medium'),
('KPMG', 2024, 'Ethics', 'What is corporate governance and why is it important for businesses? Give examples of good governance practices.', 'Assess understanding of board structure, accountability, transparency, and stakeholder interests. Look for real-world examples.', 'easy'),
('KPMG', 2024, 'Risk Management', 'Explain the process of enterprise risk management (ERM) and its benefits for organizations.', 'Evaluate understanding of risk identification, assessment, mitigation strategies, and the ERM framework. Look for mention of COSO or ISO 31000.', 'hard');

-- KPMG Quiz Password
INSERT INTO quiz_passwords (company, password) VALUES ('KPMG', 'KPMG2024');
