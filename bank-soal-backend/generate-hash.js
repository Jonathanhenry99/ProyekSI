const bcrypt = require('bcryptjs');

// Generate hash for admin123
const password = 'admin123';
const saltRounds = 8;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Hash length:', hash.length);
    
    // Verify the hash
    const isValid = bcrypt.compareSync(password, hash);
    console.log('\nVerification test:', isValid);

    // Generate SQL update statement
    console.log('\nSQL Update Statement:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin1@example.com';`);
    
    // Generate SQL insert statement for jonathan
    console.log('\nSQL Insert Statement for Jonathan:');
    console.log(`INSERT INTO users (username, email, password, full_name, role, is_active) VALUES ('jonathan', 'jonathan@example.com', '${hash}', 'Jonathan Doe', 'ROLE_USER', TRUE);`);
}); 