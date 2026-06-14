const { getUserByUsername, updateUserRole } = require('../src/lib/auth-simple')

async function updateSirKazRole() {
  try {
    console.log('=== Updating sir.kaz role to ADMIN ===')
    
    const user = await getUserByUsername('sir.kaz')
    
    if (!user) {
      console.error('User sir.kaz not found')
      return
    }
    
    console.log('Current user:', { id: user.id, username: user.username, role: user.role })
    
    const updatedUser = await updateUserRole(user.id, 'ADMIN')
    
    if (updatedUser) {
      console.log('User role updated successfully:', { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role })
    } else {
      console.error('Failed to update user role')
    }
  } catch (error) {
    console.error('Error updating user role:', error)
  }
}

updateSirKazRole()
