-- Create library table for storing tweet templates
CREATE TABLE IF NOT EXISTS public.library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for starter library templates
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    is_viral_ready BOOLEAN DEFAULT false,
    is_starter BOOLEAN DEFAULT false, -- TRUE for starter library templates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_library_user_id ON public.library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_category ON public.library(category);
CREATE INDEX IF NOT EXISTS idx_library_created_at ON public.library(created_at);
CREATE INDEX IF NOT EXISTS idx_library_is_starter ON public.library(is_starter);

-- Add starter library templates (shared templates available to all users)
INSERT INTO public.library (user_id, text, category, hashtags, is_viral_ready, is_starter) VALUES
(NULL, 'Day 47 of building in public: Just hit my first $1K MRR! 🎉 Still can''t believe it. 6 months ago I was just learning to code. To everyone starting their journey - your breakthrough is closer than you think.', 'Small Wins', ARRAY['#buildinpublic', '#indiehackers', '#milestone'], true, true),
(NULL, 'Spent 3 hours debugging what turned out to be a missing semicolon. Sometimes the smallest things teach us the biggest lessons about attention to detail. What''s your most humbling coding moment?', 'Lessons Learned', ARRAY['#webdev', '#coding', '#buildinpublic'], false, true),
(NULL, 'Just shipped a feature that took 2 weeks to build. The user feedback? "This is exactly what I needed!" Sometimes the simplest solutions are the most powerful. What feature are you most proud of building?', 'Product Updates', ARRAY['#shipped', '#feedback', '#buildinpublic'], true, true),
(NULL, 'Behind the scenes: My development setup includes 3 monitors, 47 browser tabs, and exactly 1 functioning brain cell. How do you stay organized while coding?', 'Behind the Scenes', ARRAY['#devlife', '#setup', '#buildinpublic'], false, true),
(NULL, 'Progress update: 30 days ago I committed to learning React. Today I built my first full-stack app. The learning curve was steep but the community support made all the difference. Thank you!', 'Progress Updates', ARRAY['#react', '#learning', '#buildinpublic'], true, true),
(NULL, 'Small win: Fixed a bug that was bothering me for weeks. The solution? One line of code. Sometimes stepping away and coming back with fresh eyes is the best debugging technique.', 'Small Wins', ARRAY['#bugfix', '#debugging', '#buildinpublic'], false, true),
(NULL, 'Lesson learned: Perfectionism is the enemy of progress. My first app was far from perfect, but it taught me more than any tutorial ever could. Ship early, iterate often.', 'Lessons Learned', ARRAY['#perfectionism', '#shipping', '#buildinpublic'], true, true),
(NULL, 'Community building tip: Respond to every comment, even the negative ones. Turn critics into collaborators. The best feedback often comes from those who challenge your ideas.', 'Community Building', ARRAY['#community', '#feedback', '#buildinpublic'], true, true),
(NULL, 'Product update: Added dark mode to the app. 73% of users immediately switched to it. Sometimes the smallest features have the biggest impact on user experience.', 'Product Updates', ARRAY['#darkmode', '#ux', '#buildinpublic'], false, true),
(NULL, 'Behind the scenes: My coding playlist is 90% lo-fi hip hop and 10% me muttering "why isn''t this working?" What''s your go-to coding soundtrack?', 'Behind the Scenes', ARRAY['#coding', '#music', '#buildinpublic'], false, true),
(NULL, 'Just hit 10K followers! 🎉 The secret? Consistency over perfection. I''ve been sharing my journey daily for 6 months, and the community that''s formed around it is incredible. Thank you for being part of this!', 'Small Wins', ARRAY['#milestone', '#community', '#buildinpublic'], true, true),
(NULL, 'The biggest mistake I made as a founder: trying to build everything myself. Hiring my first developer changed everything. Sometimes the best code is the code you don''t write.', 'Lessons Learned', ARRAY['#founder', '#hiring', '#buildinpublic'], true, true),
(NULL, 'New feature alert: Real-time collaboration is now live! 🚀 Watch your team members'' cursors dance across the screen as you build together. It''s like Google Docs but for code.', 'Product Updates', ARRAY['#feature', '#collaboration', '#buildinpublic'], true, true),
(NULL, 'Behind the scenes: My morning routine includes coffee, code, and chaos. The coffee helps with the code, but nothing helps with the chaos. What''s your development routine?', 'Behind the Scenes', ARRAY['#routine', '#devlife', '#buildinpublic'], false, true),
(NULL, 'Progress update: Week 12 of my coding bootcamp. I can now build a full-stack app from scratch, but I still can''t center a div without googling it. Some things never change.', 'Progress Updates', ARRAY['#bootcamp', '#progress', '#buildinpublic'], true, true);
