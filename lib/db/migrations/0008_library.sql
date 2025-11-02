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

-- Starter Library Inserts for public.library

INSERT INTO public.library (user_id, text, category, hashtags, is_viral_ready, is_starter) VALUES
-- Build in Public General
(NULL, 'Day 47 of building in public: Just hit my first $1K MRR! 🎉 Still can''t believe it. 6 months ago I was just learning to code. To everyone starting their journey - your breakthrough is closer than you think.', 'Small Wins', ARRAY['#buildinpublic','#indiehackers','#milestone'], true, true),
(NULL, 'Spent 3 hours debugging what turned out to be a missing semicolon. Sometimes the smallest things teach us the biggest lessons about attention to detail. What''s your most humbling coding moment?', 'Lessons Learned', ARRAY['#webdev','#coding','#buildinpublic'], false, true),
(NULL, 'Just shipped a feature that took 2 weeks to build. The user feedback? "This is exactly what I needed!" Sometimes the simplest solutions are the most powerful. What feature are you most proud of building?', 'Product Updates', ARRAY['#shipped','#feedback','#buildinpublic'], true, true),
(NULL, 'Behind the scenes: My development setup includes 3 monitors, 47 browser tabs, and exactly 1 functioning brain cell. How do you stay organized while coding?', 'Behind the Scenes', ARRAY['#devlife','#setup','#buildinpublic'], false, true),
(NULL, 'Progress update: 30 days ago I committed to learning React. Today I built my first full-stack app. The learning curve was steep but the community support made all the difference. Thank you!', 'Progress Updates', ARRAY['#react','#learning','#buildinpublic'], true, true),
(NULL, 'Small win: Fixed a bug that was bothering me for weeks. The solution? One line of code. Sometimes stepping away and coming back with fresh eyes is the best debugging technique.', 'Small Wins', ARRAY['#bugfix','#debugging','#buildinpublic'], false, true),
(NULL, 'Lesson learned: Perfectionism is the enemy of progress. My first app was far from perfect, but it taught me more than any tutorial ever could. Ship early, iterate often.', 'Lessons Learned', ARRAY['#perfectionism','#shipping','#buildinpublic'], true, true),
(NULL, 'Community building tip: Respond to every comment, even the negative ones. Turn critics into collaborators. The best feedback often comes from those who challenge your ideas.', 'Community Building', ARRAY['#community','#feedback','#buildinpublic'], true, true),
(NULL, 'Product update: Added dark mode to the app. 73% of users immediately switched to it. Sometimes the smallest features have the biggest impact on user experience.', 'Product Updates', ARRAY['#darkmode','#ux','#buildinpublic'], false, true),
(NULL, 'Behind the scenes: My coding playlist is 90% lo-fi hip hop and 10% me muttering "why isn''t this working?" What''s your go-to coding soundtrack?', 'Behind the Scenes', ARRAY['#coding','#music','#buildinpublic'], false, true),
(NULL, 'Just hit 10K followers! 🎉 The secret? Consistency over perfection. I''ve been sharing my journey daily for 6 months, and the community that''s formed around it is incredible. Thank you for being part of this!', 'Small Wins', ARRAY['#milestone','#community','#buildinpublic'], true, true),
(NULL, 'The biggest mistake I made as a founder: trying to build everything myself. Hiring my first developer changed everything. Sometimes the best code is the code you don''t write.', 'Lessons Learned', ARRAY['#founder','#hiring','#buildinpublic'], true, true),
(NULL, 'New feature alert: Real-time collaboration is now live! 🚀 Watch your team members'' cursors dance across the screen as you build together. It''s like Google Docs but for code.', 'Product Updates', ARRAY['#feature','#collaboration','#buildinpublic'], true, true),
(NULL, 'Behind the scenes: My morning routine includes coffee, code, and chaos. The coffee helps with the code, but nothing helps with the chaos. What''s your development routine?', 'Behind the Scenes', ARRAY['#routine','#devlife','#buildinpublic'], false, true),
(NULL, 'Progress update: Week 12 of my coding bootcamp. I can now build a full-stack app from scratch, but I still can''t center a div without googling it. Some things never change.', 'Progress Updates', ARRAY['#bootcamp','#progress','#buildinpublic'], true, true),

-- Agencies & Marketers
(NULL, 'If your client isn’t raving about your work, you’re not doing marketing — you’re doing busy work.', 'Agencies & Marketers', ARRAY['#marketing','#agencylife','#business'], true, true),
(NULL, 'Marketing isn’t about chasing likes. It’s about creating a message your audience can’t ignore.', 'Agencies & Marketers', ARRAY['#marketingtips','#branding'], true, true),
(NULL, 'Stop selling products. Start selling transformations.', 'Agencies & Marketers', ARRAY['#marketingstrategy','#growth'], true, true),
(NULL, 'The best campaigns are invisible — the results speak louder than the ad.', 'Agencies & Marketers', ARRAY['#ads','#marketing'], true, true),
(NULL, 'Data doesn’t replace creativity. It amplifies it.', 'Agencies & Marketers', ARRAY['#data','#marketing'], true, true),
(NULL, 'A brand isn’t what you say it is; it’s what your audience feels.', 'Agencies & Marketers', ARRAY['#branding','#agencylife'], true, true),
(NULL, 'Stop chasing trends, start setting them.', 'Agencies & Marketers', ARRAY['#marketing','#growthhacking'], true, true),
(NULL, 'Your inbox is full of opportunities, not excuses. Pick one.', 'Agencies & Marketers', ARRAY['#productivity','#marketing'], true, true),
(NULL, 'Content without strategy is just noise.', 'Agencies & Marketers', ARRAY['#contentmarketing','#strategy'], true, true),
(NULL, 'The most viral campaigns start with empathy, not ego.', 'Agencies & Marketers', ARRAY['#marketingtips','#branding'], true, true),

-- Creators
(NULL, 'Writers, podcasters, YouTubers: Your audience doesn’t care how hard it is for you, they care how useful it is for them.', 'Creators', ARRAY['#creators','#contentstrategy','#buildinpublic'], true, true),
(NULL, 'Posting daily isn’t about content, it’s about rhythm. Consistency > perfection every time.', 'Creators', ARRAY['#creators','#growth','#contentcreation'], true, true),
(NULL, 'The fastest way to grow as a creator is to help your audience grow first.', 'Creators', ARRAY['#creators','#value','#content'], true, true),
(NULL, 'Every newsletter you send is a fingerprint of your brand. Make it count.', 'Creators', ARRAY['#newsletter','#creators'], true, true),
(NULL, 'Your content should spark curiosity, not just consumption.', 'Creators', ARRAY['#contentcreation','#growth'], true, true),
(NULL, 'Creators don’t wait for inspiration; they ship consistently.', 'Creators', ARRAY['#buildinpublic','#creators'], true, true),
(NULL, 'You don’t need a perfect setup. You need a start.', 'Creators', ARRAY['#creators','#motivation'], true, true),
(NULL, 'The more you share, the more you learn what matters.', 'Creators', ARRAY['#creators','#buildinpublic'], true, true),
(NULL, 'Your first 100 followers are harder than your first 1,000.', 'Creators', ARRAY['#creators','#growth'], true, true),
(NULL, 'Make content you’d want to consume. The audience will follow.', 'Creators', ARRAY['#creators','#contenttips'], true, true),

-- SaaS Founders
(NULL, 'No one cares about your product. They care about how it makes their life easier.', 'SaaS Founders', ARRAY['#saas','#startups','#founderlife'], true, true),
(NULL, 'Raising venture money doesn’t make your startup valuable. Your users do.', 'SaaS Founders', ARRAY['#startuplife','#saas','#founders'], true, true),
(NULL, 'Build in public: break it, fix it, ship it, repeat. Your users will thank you later.', 'SaaS Founders', ARRAY['#buildinpublic','#saas'], true, true),
(NULL, 'The best SaaS products solve problems people didn’t know they had.', 'SaaS Founders', ARRAY['#saas','#startup'], true, true),
(NULL, 'Your roadmap is a guide, not a prison.', 'SaaS Founders', ARRAY['#founders','#product'], true, true),
(NULL, 'Metrics are the oxygen of a SaaS startup; ignore them at your peril.', 'SaaS Founders', ARRAY['#saas','#metrics'], true, true),
(NULL, 'If your churn is higher than your ambition, fix the churn.', 'SaaS Founders', ARRAY['#saas','#founderlife'], true, true),
(NULL, 'Every feature you ship should have a user who will thank you for it.', 'SaaS Founders', ARRAY['#product','#saas'], true, true),
(NULL, 'A product without feedback is like a compass without a needle.', 'SaaS Founders', ARRAY['#saas','#feedback'], true, true),
(NULL, 'The smartest founder isn’t the one who builds fast, it’s the one who learns faster.', 'SaaS Founders', ARRAY['#founders','#saas'], true, true),

-- Indie Hackers & Devs
(NULL, 'Wrote a feature in 2 hours, broke it in 2 minutes, debugged for 2 days. #buildinpublic', 'Indie Hackers & Devs', ARRAY['#indiehackers','#devlife','#humor'], true, true),
(NULL, 'One-person startups are the future. Zero meetings, full control, infinite learning.', 'Indie Hackers & Devs', ARRAY['#indiehackers','#buildinpublic'], true, true),
(NULL, 'Open source is the ultimate side hustle. Contribute, learn, repeat.', 'Indie Hackers & Devs', ARRAY['#opensource','#devs','#indiehackers'], true, true),
(NULL, 'Your code will fail. Your app will crash. Ship anyway.', 'Indie Hackers & Devs', ARRAY['#devlife','#indiehackers','#buildinpublic'], true, true),
(NULL, 'Every line of code is a vote for the future you want to build.', 'Indie Hackers & Devs', ARRAY['#devlife','#indiehackers'], true, true),
(NULL, 'Debugging is like archaeology: you dig, you find, sometimes you curse.', 'Indie Hackers & Devs', ARRAY['#devlife','#humor','#indiehackers'], true, true),
(NULL, 'Your first 100 users teach more than your first 100 features.', 'Indie Hackers & Devs', ARRAY['#indiehackers','#startup'], true, true),
(NULL, 'Fail fast. Learn faster. Build the future.', 'Indie Hackers & Devs', ARRAY['#buildinpublic','#devlife'], true, true),
(NULL, 'The best apps are built for one person first: you.', 'Indie Hackers & Devs', ARRAY['#indiehackers','#startup'], true, true),
(NULL, 'Ship in days, not months. Perfection kills progress.', 'Indie Hackers & Devs', ARRAY['#devlife','#buildinpublic'], true, true);
