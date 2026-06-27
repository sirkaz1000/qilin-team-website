const { readDataFile } = require('@/lib/data-simple')

export async function GET(request) {
  try {
    const users = readDataFile('users.json')
    console.log('All users:', users)
    
    const adminUsers = users
      .filter(u => u.role === 'ADMIN' && u.isActive)
      .map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    console.log('Admin users:', adminUsers)
    return Response.json(adminUsers)
  } catch (error) {
    console.error('Error fetching admins:', error)
    return Response.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}
