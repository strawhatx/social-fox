-- Update Google Sheets integration to include userinfo scopes
UPDATE integrations 
SET config_data = config_data || '{"scopes": ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]}'
WHERE name = 'Google Sheets' AND is_active = true;

-- Update Gmail integration to include userinfo scopes
UPDATE integrations 
SET config_data = config_data || '{"scopes": ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]}'
WHERE name = 'Gmail' AND is_active = true;