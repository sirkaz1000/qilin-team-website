const bcrypt = require('bcryptjs')

async function generateHash() {
  const password = 'qilin/1000/2008/7'
  const hash = await bcrypt.hash(password, 12)
  console.log('Password hash:', hash)
}

generateHash()
