const bcrypt = require('bcryptjs');

// Generate a new hash for 'admin123'
const password = 'admin123';
const hash = bcrypt.hashSync(password, 8);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('Verification:', bcrypt.compareSync(password, hash)); 