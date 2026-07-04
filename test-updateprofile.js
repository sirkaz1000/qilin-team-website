// Test the /api/updateprofile endpoint on Vercel with real login
async function testUpdateProfile() {
  console.log('Testing /api/updateprofile endpoint on Vercel with real login...');
  
  // First, login to get a token from Vercel
  console.log('Step 1: Login to Vercel to get token...');
  const loginResponse = await fetch('https://qilin-team-website.vercel.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'sir.kaz',
      password: 'kaz/1000/2000/6/1',
    }),
  });
  
  if (!loginResponse.ok) {
    console.error('Login failed:', loginResponse.status);
    const error = await loginResponse.json();
    console.error('Error:', error);
    return;
  }
  
  const loginData = await loginResponse.json();
  console.log('Login successful. Token:', loginData.token ? 'Received' : 'Not received');
  
  // Test the update profile endpoint on Vercel
  console.log('\nStep 2: Test /api/updateprofile endpoint on Vercel...');
  const token = loginData.token;
  
  const updateResponse = await fetch('https://qilin-team-website.vercel.app/api/updateprofile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: 'Sir Kaz',
      avatarUrl: '/uploads/17276c09-7324-4dcd-acca-e9b0aefabcf2.jpg',
    }),
  });
  
  console.log('Response status:', updateResponse.status);
  
  if (!updateResponse.ok) {
    console.error('Update profile failed');
    const error = await updateResponse.json();
    console.error('Error:', error);
    return;
  }
  
  const updateData = await updateResponse.json();
  console.log('Update profile successful:', updateData);
}

testUpdateProfile().catch(console.error);
