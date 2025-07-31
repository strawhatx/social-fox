-- Update existing integrations with correct provider values
UPDATE public.integrations 
SET provider = 'google_sheets' 
WHERE name = 'Google Sheets';

UPDATE public.integrations 
SET provider = 'gmail' 
WHERE name = 'Gmail';