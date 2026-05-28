const simpleGit = require('simple-git')
const path = require('path')
const fs = require('fs').promises

const REPOSITORIES_PATH = path.join(process.cwd(), 'public', 'repositories')

// Initialize a new repository
async function initRepository(repoName, userId) {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  await fs.mkdir(repoPath, { recursive: true })
  
  const git = simpleGit(repoPath)
  await git.init()
  
  // Create initial README
  const readmePath = path.join(repoPath, 'README.md')
  await fs.writeFile(readmePath, `# ${repoName}\n\nInitial repository.`)
  
  await git.add('README.md')
  await git.commit('Initial commit')
  
  return repoPath
}

// Get repository info
async function getRepositoryInfo(repoName) {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  const git = simpleGit(repoPath)
  
  try {
    const log = await git.log()
    const status = await git.status()
    
    return {
      path: repoPath,
      commits: log.all,
      currentBranch: status.current,
      files: status.files,
    }
  } catch (error) {
    return null
  }
}

// Get file tree
async function getFileTree(repoName, dirPath = '') {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  const targetPath = path.join(repoPath, dirPath)
  
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true })
    const files = []
    
    for (const entry of entries) {
      if (entry.name === '.git') continue
      
      const fullPath = path.join(targetPath, entry.name)
      const stats = await fs.stat(fullPath)
      
      files.push({
        name: entry.name,
        path: path.join(dirPath, entry.name).replace(/\\/g, '/'),
        isDirectory: entry.isDirectory(),
        size: stats.size,
      })
    }
    
    return files
  } catch (error) {
    return []
  }
}

// Get file content
async function getFileContent(repoName, filePath) {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  const targetPath = path.join(repoPath, filePath)
  
  try {
    const content = await fs.readFile(targetPath, 'utf-8')
    return content
  } catch (error) {
    return null
  }
}

// Create or update file
async function updateFile(repoName, filePath, content, message) {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  const targetPath = path.join(repoPath, filePath)
  
  // Create directory if needed
  const dir = path.dirname(targetPath)
  await fs.mkdir(dir, { recursive: true })
  
  // Write file
  await fs.writeFile(targetPath, content)
  
  // Commit changes
  const git = simpleGit(repoPath)
  await git.add(filePath)
  await git.commit(message || `Update ${filePath}`)
  
  return true
}

// Delete file
async function deleteFile(repoName, filePath, message) {
  const repoPath = path.join(REPOSITORIES_PATH, repoName)
  const targetPath = path.join(repoPath, filePath)
  
  await fs.unlink(targetPath)
  
  const git = simpleGit(repoPath)
  await git.rm(filePath)
  await git.commit(message || `Delete ${filePath}`)
  
  return true
}

module.exports = {
  initRepository,
  getRepositoryInfo,
  getFileTree,
  getFileContent,
  updateFile,
  deleteFile,
}
