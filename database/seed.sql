-- Create the default Ekub used by the initial draw workflow.
-- This is safe to run repeatedly and requires an existing ADMIN user.
INSERT INTO ekubs (name, description, contribution_amount, status, created_by)
SELECT
		'Digital Ekub',
		'Default savings group for Digital Ekub draws',
		1000.00,
		'ACTIVE',
		id
FROM users
WHERE role = 'ADMIN'
	AND NOT EXISTS (
			SELECT 1
			FROM ekubs
			WHERE name = 'Digital Ekub'
	)
ORDER BY id
LIMIT 1;
