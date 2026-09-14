-- Add role column to fieldpress_accounts
ALTER TABLE fieldpress_accounts 
ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'correspondent';

-- Set vibir@fieldpress.studio as super_admin
UPDATE fieldpress_accounts 
SET role = 'super_admin' 
WHERE LOWER(email) = 'vibir@fieldpress.studio';
