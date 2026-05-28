# The Qilin Team Website

A full-stack team website with authentication, GitHub-like hosting system, store, admin dashboard, and multi-language support.

## Features

- **Authentication System**: User registration and login with JWT tokens
- **Multi-language Support**: Arabic and English with RTL support
- **Dark/Light Mode**: Theme toggle functionality
- **Posts System**: Team news and announcements (admin-only posting)
- **Achievements**: Showcase team achievements
- **GitHub-like Hosting**: Repository management with Git integration
- **Store System**: Services and digital products with reviews (admin CRUD)
- **FAQ System**: Frequently asked questions with search
- **Admin Dashboard**: Full site control with statistics
- **Responsive Design**: Mobile-friendly interface
- **Support System**: Ticket-based support for users

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Production) / JSON files (Development)
- **Authentication**: JWT with bcrypt
- **Git Integration**: simple-git
- **Icons**: Lucide React
- **File Upload**: Cloudinary (Production) / Local (Development)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database server (for production)
- Git installed (for repository management)
- Cloudinary account (for production file uploads)

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd qilin-team-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment in `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/qilin_team_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Setup

1. Set up PostgreSQL database:
   - Create a PostgreSQL database on your hosting provider
   - Get the connection string

2. Configure production environment variables:
```
DATABASE_URL="postgresql://username:password@your-host:5432/qilin_team_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
```

3. Build the project:
```bash
npm run build
```

4. Start production server:
```bash
npm start
```

## Default Admin Account

After first setup, you can create an admin account through the registration page or manually in the database.

⚠️ **Important**: Change the JWT_SECRET and admin password in production!

## Project Structure

```
qilin-team-website/
├── data/                   # JSON data files (development)
│   ├── users.json
│   ├── posts.json
│   ├── achievements.json
│   ├── store-items.json
│   └── tickets.json
├── public/
│   ├── images/
│   │   └── avatars/       # User avatars
│   └── repositories/      # Git repositories
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (main)/        # Main application pages
│   │   ├── api/           # API routes
│   │   ├── layout.js      # Root layout
│   │   └── page.js        # Home page
│   ├── components/
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility libraries
│   └── styles/            # Global styles
├── .env.local             # Environment variables
├── .env.example           # Environment variables template
├── package.json           # Dependencies
└── tailwind.config.js     # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/users/me` - Update current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (admin only)
- `PATCH /api/posts/[postId]` - Update post (admin only)
- `DELETE /api/posts/[postId]` - Delete post (admin only)

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Create achievement (admin only)
- `PATCH /api/achievements/[achievementId]` - Update achievement (admin only)
- `DELETE /api/achievements/[achievementId]` - Delete achievement (admin only)

### Store
- `GET /api/store/items` - Get all store items
- `POST /api/store/items` - Create store item (admin only)
- `PATCH /api/store/items/[id]` - Update store item (admin only)
- `DELETE /api/store/items/[id]` - Delete store item (admin only)
- `POST /api/store/requests` - Submit purchase request

### Repositories
- `GET /api/repositories` - Get user repositories
- `POST /api/repositories` - Create new repository
- `GET /api/repositories/[repoId]` - Get repository details
- `GET /api/repositories/[repoId]/files` - Get repository files
- `POST /api/repositories/[repoId]/content` - Update file content

### FAQ
- `GET /api/faq` - Get all FAQs
- `POST /api/faq` - Create FAQ (admin only)

### Support
- `GET /api/support` - Get support tickets
- `POST /api/support` - Create support ticket

### Admin
- `GET /api/admin/stats` - Get site statistics (admin only)
- `POST /api/admin/create` - Create admin user (admin only)

## Color Scheme

- **Primary Blue**: #007ACC
- **Silver**: #C0C0C0
- **Dark Blue**: #005a9e
- **Light Blue**: #3399cc

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages using gh-pages:
```bash
npm install -g gh-pages
gh-pages -d out
```

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Security Notes

- Change JWT_SECRET in production
- Use strong database passwords
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for API routes
- Use environment variables for sensitive data
- Enable CORS for your domain only

## Production Database Setup

For a public site, use PostgreSQL instead of JSON files:

1. Install PostgreSQL on your server
2. Create a database:
```sql
CREATE DATABASE qilin_team_db;
```

3. Create tables (migration script coming soon)

4. Update API routes to use PostgreSQL instead of JSON files

## Support

For support, please contact the team through the website's support system.

## License

© 2026 The Qilin Team. All rights reserved.
