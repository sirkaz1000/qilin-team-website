const fs = require('fs');
const path = require('path');

// Test the complete avatar upload flow
async function testAvatarFlow() {
  console.log('=== Testing Complete Avatar Upload Flow ===\n');
  
  const baseUrl = 'https://qilin-team-website.vercel.app';
  
  // Step 1: Login to get token
  console.log('Step 1: Login to get token...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'sir.kaz',
      password: 'kaz/1000/2000/6/1',
    }),
  });
  
  console.log('Login response status:', loginResponse.status);
  
  if (!loginResponse.ok) {
    console.error('Login failed');
    const error = await loginResponse.json();
    console.error('Error:', error);
    console.log('\nTrying alternative password...');
    
    // Try with the password from the local file
    const loginResponse2 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'sir.kaz',
        password: '2008/7/18',
      }),
    });
    
    console.log('Login response status (2nd attempt):', loginResponse2.status);
    
    if (!loginResponse2.ok) {
      console.error('Login failed again');
      const error2 = await loginResponse2.json();
      console.error('Error:', error2);
      return;
    }
    
    const loginData2 = await loginResponse2.json();
    console.log('Login successful (2nd attempt)');
    var token = loginData2.token;
  } else {
    const loginData = await loginResponse.json();
    console.log('Login successful');
    var token = loginData.token;
  }
  
  console.log('Token received:', token ? 'Yes' : 'No');
  
  // Step 2: Upload a test image
  console.log('\nStep 2: Upload a test image...');
  
  // Create a simple test image buffer
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  if (!fs.existsSync(testImagePath)) {
    // Create a minimal JPEG file
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00
    ]);
    fs.writeFileSync(testImagePath, jpegHeader);
  }
  
  const imageBuffer = fs.readFileSync(testImagePath);
  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'test-image.jpg');
  
  const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  console.log('Upload response status:', uploadResponse.status);
  
  if (!uploadResponse.ok) {
    console.error('Upload failed');
    const error = await uploadResponse.json();
    console.error('Error:', error);
    return;
  }
  
  const uploadData = await uploadResponse.json();
  console.log('Upload successful:', uploadData);
  
  // Step 3: Update user profile with the uploaded image URL
  console.log('\nStep 3: Update user profile with uploaded image URL...');
  
  const updateResponse = await fetch(`${baseUrl}/api/updateprofile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: 'Sir Kaz',
      avatarUrl: uploadData.url,
    }),
  });
  
  console.log('Update profile response status:', updateResponse.status);
  
  if (!updateResponse.ok) {
    console.error('Update profile failed');
    const error = await updateResponse.json();
    console.error('Error:', error);
    return;
  }
  
  const updateData = await updateResponse.json();
  console.log('Update profile successful:', updateData);
  
  console.log('\n=== Test Complete ===');
  console.log('Avatar URL:', uploadData.url);
  console.log('Updated user:', updateData);
}

testAvatarFlow().catch(console.error);
