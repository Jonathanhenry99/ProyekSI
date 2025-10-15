const axios = require('axios');

// GANTI dengan email yang ada di database!
const credentials = {
  email: 'Husnul@unpar.ac.id',  // ← GANTI INI!
  password: 'husnul123'       // ← GANTI INI!
};

console.log('🔐 Attempting login with:', credentials.email);

axios.post('http://localhost:8080/api/auth/signin', credentials)
  .then(response => {
    console.log('✅ Login Success!\n');
    console.log('User:', response.data.username);
    console.log('Email:', response.data.email);
    console.log('\n📋 Access Token:\n');
    console.log(response.data.accessToken);
    console.log('\n');
    
    // Auto test recycle bin dengan token baru
    console.log('🧪 Testing recycle bin endpoint...\n');
    return axios.get('http://localhost:8080/api/questionsets/recycle-bin/all', {
      headers: {
        'x-access-token': response.data.accessToken,
        'Content-Type': 'application/json'
      }
    });
  })
  .then(response => {
    console.log('✅ Recycle Bin Test Success!\n');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📊 Items in recycle bin:', response.data.count || 0);
  })
  .catch(error => {
    if (error.response) {
      console.error('\n❌ Error:', error.response.data);
      console.error('Status:', error.response.status);
      
      // Detailed error untuk debug
      if (error.response.status === 500) {
        console.error('\n⚠️ SERVER ERROR (500) - Backend Issue!');
        console.error('Error message:', error.response.data.error);
        console.error('\nCheck server console for full error details!');
        
        const errorMsg = error.response.data.error || '';
        if (errorMsg.includes('column') || errorMsg.includes('does not exist')) {
          console.error('\n💡 LIKELY CAUSE: Database column missing');
          console.error('   FIX: Run migration SQL');
          console.error('   ALTER TABLE question_sets ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;');
        } else if (errorMsg.includes('association') || errorMsg.includes('not associated')) {
          console.error('\n💡 LIKELY CAUSE: Model association error');
          console.error('   FIX: Update models/index.js');
        }
      } else if (error.response.status === 404) {
        console.error('\n💡 LIKELY CAUSE: User not found or route not registered');
        console.error('   Check: Email exists in database');
      } else if (error.response.status === 401) {
        console.error('\n💡 LIKELY CAUSE: Wrong password');
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  });