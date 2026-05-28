# Qilin Team Website - Setup Guide

This guide will help you complete the setup and deployment of The Qilin Team website.

## Current Status

✅ **Completed:**
- Project structure and configuration
- Database schema with Prisma
- Authentication system (API routes and pages)
- All core pages (Home, Posts, Achievements, Hosting, Store, FAQ, Support)
- Admin dashboard
- API routes for all features
- GitHub-like hosting system with Git integration
- Multi-language support (Arabic/English)
- Dark/Light mode
- README documentation

⏳ **Remaining Steps:**
1. Install npm dependencies
2. Set up MySQL database
3. Configure environment variables
4. Run database migrations
5. Process and integrate the logo
6. Deploy to GitHub

## Step 1: Install npm Dependencies

**Issue:** PowerShell execution policy is currently blocking npm commands.

**Solution:** You need to change the PowerShell execution policy or use a different terminal.

### Option A: Change PowerShell Execution Policy (Recommended)

1. Open PowerShell as Administrator
2. Run the following command:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Confirm the change by typing "Y"
4. Close and reopen PowerShell
5. Navigate to the project directory:
```powershell
cd C:\Users\HP\CascadeProjects\qilin-team-website
```
6. Install dependencies:
```powershell
npm install
```

### Option B: Use Command Prompt (cmd)

1. Open Command Prompt (not PowerShell)
2. Navigate to the project directory:
```cmd
cd C:\Users\HP\CascadeProjects\qilin-team-website
```
3. Install dependencies:
```cmd
npm install
```

### Option C: Use Git Bash

1. Open Git Bash
2. Navigate to the project directory:
```bash
cd /c/Users/HP/CascadeProjects/qilin-team-website
```
3. Install dependencies:
```bash
npm install
```

## Step 2: Set up MySQL Database

### Option A: Local MySQL Installation

1. Download and install MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. During installation, set a root password (remember it!)
3. Start the MySQL service
4. Create a database:
```sql
CREATE DATABASE qilin_team_db;
```

### Option B: Use MySQL Cloud Service (Recommended for Production)

1. Sign up for a free account at PlanetScale (https://planetscale.com/)
2. Create a new database
3. Get the connection string

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your database credentials:

**For Local MySQL:**
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/qilin_team_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-please"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**For PlanetScale:**
```
DATABASE_URL="mysql://YOUR_PLANETSCALE_CONNECTION_STRING"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-please"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

⚠️ **Important:** Change the JWT_SECRET to a secure random string!

## Step 4: Run Database Migrations

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push the schema to the database:
```bash
npx prisma db push
```

3. Seed the database (creates admin account):
```bash
node prisma/seed.js
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the admin password after first login!

## Step 5: Process and Integrate the Logo

You mentioned you have a logo image. Here's how to process it:

### Option A: Remove Background Online

1. Go to https://www.remove.bg/ or similar service
2. Upload your logo image
3. Download the transparent PNG version
4. Save it as `logo.png` in `public/images/`

### Option B: Use Image Editing Software

1. Open your logo in Photoshop, GIMP, or similar
2. Remove the black background
3. Export as transparent PNG
4. Save as `logo.png` in `public/images/`

### Option C: Use Command Line Tools (if available)

```bash
# Using ImageMagick (if installed)
convert logo.png -background none -flatten logo-transparent.png
```

After processing the logo, update the Navbar component to use it:

Edit `src/components/layout/Navbar.js` and replace the placeholder with:
```jsx
<img src="/images/logo.png" alt="Qilin Team Logo" className="h-10" />
```

## Step 6: Start Development Server

1. Run the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. You should be redirected to the login page
4. Log in with the admin credentials

## Step 7: Deploy to GitHub

### Initial Setup

1. Initialize Git repository:
```bash
git init
```

2. Create a `.gitignore` file (already created in the project)

3. Add all files:
```bash
git add .
```

4. Make initial commit:
```bash
git commit -m "Initial commit: Qilin Team website"
```

5. Create a new repository on GitHub (https://github.com/new)
   - Repository name: `qilin-team-website`
   - Make it private if you prefer
   - Don't initialize with README (we already have one)

6. Add remote origin:
```bash
git remote add origin https://github.com/YOUR_USERNAME/qilin-team-website.git
```

7. Push to GitHub:
```bash
git branch -M main
git push -u origin main
```

### Deploy to Vercel (Recommended)

1. Go to https://vercel.com/
2. Sign up or log in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL` - Your MySQL connection string
   - `JWT_SECRET` - Your JWT secret
   - `NEXT_PUBLIC_APP_URL` - Your Vercel URL (after deployment)
6. Click "Deploy"
7. Wait for deployment to complete

### Alternative: Deploy to GitHub Pages

1. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

2. Update `package.json` scripts:
```json
"scripts": {
  "export": "next export",
  "deploy": "gh-pages -d out"
}
```

3. Build and deploy:
```bash
npm run build
npm run export
npm run deploy
```

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed: https://nodejs.org/
- Restart your terminal after installation

### "Cannot connect to database"
- Verify MySQL is running
- Check your DATABASE_URL in `.env.local`
- Ensure the database exists

### "Prisma client not generated"
- Run `npx prisma generate`
- Ensure dependencies are installed

### "Port 3000 already in use"
- Stop the process using port 3000, or
- Use a different port: `npm run dev -- -p 3001`

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a secure random string
- [ ] Change admin password
- [ ] Use strong database password
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Set up environment variables in production
- [ ] Review and update `.gitignore`
- [ ] Remove any sensitive data from code
- [ ] Set up rate limiting (if needed)
- [ ] Enable CORS if needed
- [ ] Set up backup strategy for database

## Next Steps After Deployment

1. **Customize Content:**
   - Update team information on home page
   - Add real posts and achievements
   - Create FAQ entries
   - Add store items

2. **Configure Email (Optional):**
   - Set up email service for notifications
   - Configure email templates

3. **Add Analytics (Optional):**
   - Google Analytics
   - Vercel Analytics

4. **Set Up CI/CD (Optional):**
   - GitHub Actions for automated testing
   - Automated deployments

## Support

If you encounter issues:
1. Check the console for error messages
2. Review the logs in the terminal
3. Ensure all environment variables are set correctly
4. Verify database connection
5. Check that all dependencies are installed

## Project Structure Reference

```
qilin-team-website/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Database seed script
├── public/
│   ├── images/
│   │   ├── avatars/       # User avatars
│   │   └── logo.png       # Team logo (add this)
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
├── .env.local             # Environment variables (create this)
├── package.json           # Dependencies
├── README.md              # Project documentation
└── SETUP_GUIDE.md         # This file
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (admin only)

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Create achievement (admin only)

### Repositories
- `GET /api/repositories` - Get user repositories
- `POST /api/repositories` - Create new repository
- `GET /api/repositories/[repoId]` - Get specific repository
- `GET /api/repositories/[repoId]/files` - Get repository files
- `GET /api/repositories/[repoId]/content` - Get file content
- `POST /api/repositories/[repoId]/content` - Update file

### Store
- `GET /api/store/items` - Get all store items
- `POST /api/store/items` - Create store item (admin only)
- `GET /api/store/orders` - Get orders
- `POST /api/store/orders` - Create order
- `GET /api/store/reviews` - Get reviews
- `POST /api/store/reviews` - Create review

### Support
- `GET /api/support` - Get support tickets
- `POST /api/support` - Create support ticket

### Admin
- `GET /api/admin/stats` - Get site statistics (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users` - Update user (admin only)
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user profile

### Comments
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Update notification

## Color Scheme

- **Primary Blue**: #007ACC
- **Silver**: #C0C0C0
- **Dark Blue**: #005a9e
- **Light Blue**: #3399cc

## License

© 2026 The Qilin Team. All rights reserved.
