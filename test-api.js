const axios = require('axios');

// First login to get a token
axios.post('http://localhost:3000/api/auth/login', {
  email: 'admin@example.com',
  password: 'password123'
}).then(response => {
  const token = response.data.token;
  console.log('Got token:', token.substring(0, 20) + '...');
  
  // Test recently joined endpoint
  return axios.get('http://localhost:3000/api/users/recently-joined', {
    headers: { Authorization: `Bearer ${token}` }
  });
}).then(response => {
  console.log('\n=== Recently Joined Staff ===');
  console.log('Count:', response.data.staff?.length || 0);
  console.log('Data:', JSON.stringify(response.data, null, 2));
}).catch(error => {
  console.error('Error:', error.response?.data || error.message);
});
