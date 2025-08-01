-- Add GitHub integration
INSERT INTO public.integrations (name, provider, type, icon, description, config_data) VALUES
('GitHub', 'github', 'oauth', 'github-icon', 'Connect to GitHub for repository insights and commit tracking', '{
  "scopes": [
    "read:user",
    "repo"
  ],
  "auth_url": "https://github.com/login/oauth/authorize",
  "token_url": "https://github.com/login/oauth/access_token",
  "redirect_url": "http://localhost:3000/github/callback",
  "required_parameters": [],
  "code_challenge_required": false
}'::jsonb);

-- Add Twitter/X integration
INSERT INTO public.integrations (name, provider, type, icon, description, config_data) VALUES
('Twitter', 'twitter', 'oauth', 'twitter-icon', 'Connect to Twitter/X for posting updates and threads', '{
  "scopes": [
    "tweet.read",
    "tweet.write",
    "users.read"
  ],
  "auth_url": "https://twitter.com/i/oauth2/authorize",
  "token_url": "https://api.twitter.com/2/oauth2/token",
  "redirect_url": "http://localhost:3000/twitter/callback",
  "required_parameters": ["code_challenge", "code_challenge_method"],
  "code_challenge_required": true
}'::jsonb);

-- Add LinkedIn integration
INSERT INTO public.integrations (name, provider, type, icon, description, config_data) VALUES
('LinkedIn', 'linkedin_oidc', 'oauth', 'linkedin-icon', 'Connect to LinkedIn for professional updates and articles', '{
  "scopes": [
    "openid",
    "profile",
    "w_member_social"
  ],
  "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
  "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
  "redirect_url": "http://localhost:3000/linkedin/callback",
  "required_parameters": [],
  "code_challenge_required": false
}'::jsonb);