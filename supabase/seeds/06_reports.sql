-- Seed: reports
-- Purpose: Create reports from professionals to structures
-- Note: Professionals and structures must exist first

-- Reports from various professionals to various structures
INSERT INTO public.reports (title, content, author_id, recipient_id) VALUES 
-- Reports from John Doe (010)
('Weekly Activity Report - Week 1', 'This week, I focused on creative activities with the children. We organized painting sessions, storytelling, and outdoor games. All children showed great engagement and progress in their social skills.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', '08fb0a72-ee9b-4771-bf24-7fe19c869af9'),
('Monthly Progress Report', 'Monthly summary: Children have made significant progress in language development and motor skills. Special attention was given to individual needs and personalized activities.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', '08fb0a72-ee9b-4771-bf24-7fe19c869af9'),

-- Reports from Marie Martin (011)
('Special Needs Care Report', 'Report on specialized care provided to children with special needs. Implemented new behavioral management techniques with positive results. Parents are satisfied with the progress.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', '08fb0a72-ee9b-4771-bf24-7fe19c869af9'),
('Therapeutic Activities Summary', 'Summary of therapeutic activities conducted this month. Children responded well to the new activities. Continued monitoring and adjustment of approaches as needed.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', '08fb0a72-ee9b-4771-bf24-7fe19c869afa'),

-- Reports from Pierre Dupont (012)
('Sports Activities Report', 'Organized various sports activities including soccer, basketball, and outdoor games. Children showed great enthusiasm and improved physical coordination. Group activities helped develop teamwork skills.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', '08fb0a72-ee9b-4771-bf24-7fe19c869afa'),
('Outdoor Education Program Update', 'Update on the outdoor education program. Conducted nature walks, gardening activities, and environmental awareness sessions. Children demonstrated increased interest in nature and environmental protection.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', '08fb0a72-ee9b-4771-bf24-7fe19c869afb'),

-- Reports from Sophie Bernard (013)
('Language Development Progress', 'Focused on multilingual activities this month. Children showed great interest in learning new words in different languages. Reading sessions were particularly successful.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', '08fb0a72-ee9b-4771-bf24-7fe19c869afb'),
('Reading Skills Assessment', 'Conducted reading assessments with all children. Most children showed improvement in reading comprehension and vocabulary. Individual support plans created for those needing extra help.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', '08fb0a72-ee9b-4771-bf24-7fe19c869afc'),

-- Reports from Thomas Leroy (014)
('Arts and Crafts Activities Report', 'Organized creative workshops including painting, drawing, and sculpture. Children expressed great creativity and enjoyed the hands-on activities. Artwork displayed in the center.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', '08fb0a72-ee9b-4771-bf24-7fe19c869afc'),
('Creative Projects Summary', 'Completed several creative projects this month including a group mural and individual art portfolios. Children developed fine motor skills and artistic expression.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', '08fb0a72-ee9b-4771-bf24-7fe19c869afd'),

-- Reports from Lucie Moreau (015)
('Nutrition Education Activities', 'Conducted cooking workshops and nutrition education sessions. Children learned about healthy eating habits and participated in preparing simple, healthy snacks. Positive feedback from parents.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', '08fb0a72-ee9b-4771-bf24-7fe19c869afd'),
('Healthy Habits Program', 'Implemented a healthy habits program focusing on nutrition, hygiene, and physical activity. Children showed increased awareness of healthy lifestyle choices.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', '08fb0a72-ee9b-4771-bf24-7fe19c869afe'),

-- Reports from Antoine Petit (016)
('Music and Movement Activities', 'Organized music sessions and movement activities. Children enjoyed singing, dancing, and playing simple instruments. Music therapy techniques helped some children with emotional regulation.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', '08fb0a72-ee9b-4771-bf24-7fe19c869afe'),
('Rhythm and Coordination Development', 'Focused on rhythm and coordination activities. Children improved their motor skills and sense of rhythm through various musical games and exercises.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', '08fb0a72-ee9b-4771-bf24-7fe19c869aff'),

-- Reports from Camille Laurent (017)
('Infant and Toddler Care Report', 'Provided specialized care for infants and toddlers. Focused on sensory activities and early motor development. Parents appreciated the detailed daily reports.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', '08fb0a72-ee9b-4771-bf24-7fe19c869aff'),
('Early Development Milestones', 'Tracked and supported early development milestones for all children in my care. Individualized activities helped each child progress at their own pace.', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', '08fb0a72-ee9b-4771-bf24-7fe19c869b00'),

-- Reports from Julien Simon (018)
('Science Education Activities', 'Conducted science experiments and nature exploration activities. Children showed great curiosity and asked many questions. Hands-on learning approach was very effective.', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', '08fb0a72-ee9b-4771-bf24-7fe19c869b00'),
('Environmental Awareness Program', 'Organized activities to raise environmental awareness. Children learned about recycling, conservation, and caring for nature through practical activities.', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', '08fb0a72-ee9b-4771-bf24-7fe19c869b01'),

-- Reports from Emilie Michel (019)
('Social Skills Development', 'Focused on developing social skills and emotional intelligence. Organized group activities that promoted cooperation, empathy, and conflict resolution. Positive changes observed in children interactions.', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', '08fb0a72-ee9b-4771-bf24-7fe19c869b01'),
('Emotional Intelligence Activities', 'Implemented activities to develop emotional awareness and regulation. Children learned to identify and express their emotions in healthy ways.', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', '08fb0a72-ee9b-4771-bf24-7fe19c869b02'),

-- Reports from Nicolas Garcia (01a)
('Digital Literacy Program', 'Introduced age-appropriate technology activities. Balanced screen time with physical activities. Children learned basic digital skills while maintaining active play.', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', '08fb0a72-ee9b-4771-bf24-7fe19c869b02'),
('Technology Integration Report', 'Successfully integrated educational technology into daily activities. Used tablets for learning games and interactive stories. Monitored screen time carefully.', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', '08fb0a72-ee9b-4771-bf24-7fe19c869af9');
