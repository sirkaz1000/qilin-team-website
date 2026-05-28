const { authenticateUser } = require('../src/lib/auth-simple')

async function testLogin() {
  try {
    const user = await authenticateUser('sir.kaz', 'qilin/1000/2008/7')
    console.log('Login successful:', user)
  } catch (error) {
    console.error('Login failed:', error.message)
  }
}

testLogin()
