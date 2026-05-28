async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'sir.kaz',
        email: 'sirkaz@team.qilin',
        password: 'qilin/1000/2008/7',
        displayName: 'Sir Kaz',
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('Admin account created successfully:', data.user)
    } else {
      console.error('Failed to create admin account:', data.error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

createAdmin()
