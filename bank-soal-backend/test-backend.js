const axios = require('axios');

// Ganti dengan token Anda
const TOKEN = 'your_token_here';

axios.get('http://localhost:8080/api/questionsets/recycle-bin/all', {
  headers: {
    'x-access-token': TOKEN,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ Success:', response.data);
})
.catch(error => {
  console.error('❌ Error:', error.response?.data || error.message);
  console.error('Status:', error.response?.status);
});