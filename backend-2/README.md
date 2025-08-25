# Movie Admin Portal

A MERN stack application for managing movies with admin authentication and user request system.

## Features

- **Authentication System**: Login and user request functionality
- **Admin Dashboard**: Manage user requests and movies
- **Movie Management**: CRUD operations for movies with image upload
- **Image Upload**: Cloudinary integration for movie posters
- **Responsive Design**: Built with Tailwind CSS

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Authentication**: JWT

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB account
- Cloudinary account

### Installation

1. **Install Backend Dependencies**

   ```bash
   cd backend-2
   npm install
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   The `.env` file is already configured with the provided credentials.

### Running the Application

#### Option 1: Start both servers with batch file (Windows)

```bash
# From backend-2 directory
./start.bat
```

#### Option 2: Start servers manually

**Backend Server:**

```bash
cd backend-2
npm start
```

**Frontend Server:**

```bash
cd backend-2/frontend
npm run dev
```

### Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Admin Credentials

**Email**: ayush.bhrg@gmail.com  
**Password**: ayushtri

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/request` - Request access

### Admin (requires admin token)

- `GET /api/admin/requests` - Get pending user requests
- `PATCH /api/admin/approve/:userId` - Approve user request
- `DELETE /api/admin/reject/:userId` - Reject user request

### Movies (requires authentication)

- `GET /api/movies` - Get all movies
- `GET /api/movies/:movieId` - Get single movie
- `POST /api/movies` - Create movie (admin only)
- `PUT /api/movies/:movieId` - Update movie (admin only)
- `DELETE /api/movies/:movieId` - Delete movie (admin only)

## Movie Schema

```json
{
  "title": "String (required)",
  "description": "String (required)",
  "year": "Number (required)",
  "genre": ["Array of strings (required)"],
  "director": "String (required)",
  "cast": ["Array of strings (required)"],
  "posterUrl": "String (Cloudinary URL)",
  "trailerUrl": "String (optional)",
  "averageRating": "Number (0-10)"
}
```

## Usage Flow

1. **New User**: Click "Request Access" → Fill email/password → Wait for admin approval
2. **Admin Login**: Use admin credentials to log in
3. **Admin Dashboard**:
   - **Requests Tab**: View and approve/reject user requests
   - **Movies Tab**: Add, edit, delete movies
4. **Movie Management**: Upload poster images, add movie details
5. **User Access**: Once approved, users can log in and view movies

## File Structure

```
backend-2/
├── server.js           # Main backend server
├── package.json        # Backend dependencies
├── .env               # Environment variables
├── start.bat          # Windows start script
├── start.sh           # Unix start script
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── RequestsTab.jsx
    │   │   ├── MoviesTab.jsx
    │   │   ├── MovieForm.jsx
    │   │   └── MovieCard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── App.css
    └── package.json       # Frontend dependencies
```

## Environment Variables

The following environment variables are configured:

- `MONGO_URI` - MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5000)

## Development Notes

- Admin user is automatically created on server start
- Images are uploaded to Cloudinary with automatic optimization
- JWT tokens expire in 7 days
- All API routes require authentication except login and request
- Admin routes require admin privileges
