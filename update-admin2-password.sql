-- Update password for admin2 with a verified bcrypt hash for 'admin123'
UPDATE users 
SET password = '$2b$08$.P.hrRFbfFmpPyyBHimjH.tGtjPygrd7HqPGj4RzgkrucIcGRoDWC' 
WHERE email = 'admin2@example.com';

-- Verify the update
SELECT id, username, email, password 
FROM users 
WHERE email = 'admin2@example.com'; 