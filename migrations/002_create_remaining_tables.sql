-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  is_public BOOLEAN DEFAULT true,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  language VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create store items table
CREATE TABLE IF NOT EXISTS store_items (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  category VARCHAR(100),
  is_digital BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create FAQ table
CREATE TABLE IF NOT EXISTS faq (
  id VARCHAR(255) PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(id);
CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_is_active ON faq(is_active);
