// test-hash.js
const bcrypt = require('bcrypt');

const password = 'admin123';
const hashFromDatabase = '$2b$10$PvLWU4/ngoH9guyhp1fOYOZAlHQ7Gb5eqVbRm7/hHotmfwrXWW/BS';

console.log('Testing password verification...');
console.log('Password:', password);
console.log('Hash:', hashFromDatabase);

bcrypt.compare(password, hashFromDatabase).then(result => {
  console.log('\n=== RESULT ===');
  console.log('Hash verification result:', result);
  
  if (result) {
    console.log('✅ SUCCESS: Hash cocok! Login seharusnya berhasil.');
  } else {
    console.log('❌ FAILED: Hash tidak cocok, perlu generate hash baru.');
    
    // Generate hash baru
    bcrypt.hash(password, 10).then(newHash => {
      console.log('\n=== NEW HASH ===');
      console.log('Hash baru untuk device ini:', newHash);
      console.log('\nUpdate database dengan query ini:');
      console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'admin@unpar.ac.id';`);
    });
  }
}).catch(error => {
  console.log('❌ ERROR:', error.message);
});