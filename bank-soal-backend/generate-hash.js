const bcrypt = require('bcryptjs');

// Generate hash for 'admin123'
const password = 'admin123';
const salt = bcrypt.genSaltSync(8);
const hash = bcrypt.hashSync(password, salt);

console.log('Generated hash for admin123:');
console.log(hash);

// Verify the hash
const isValid = bcrypt.compareSync(password, hash);
console.log('\nVerification test:', isValid);

// Generate SQL update statement
console.log('\nSQL Update Statement:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin2@example.com';`); 