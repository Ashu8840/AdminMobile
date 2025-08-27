# AdminMobile - Movie Platform

A full-stack movie platform with mobile app, web frontend, admin panel, and backend API. Built with React Native, React.js, Node.js, and MongoDB.

## 🚀 Features

### Mobile App (React Native + Expo)

- 📱 Cross-platform mobile app for iOS and Android
- 🎬 Browse and search movies from external API
- 📝 Create and read movie blogs
- ⭐ Rate and review movies
- 👤 User profiles with watchlists
- 💬 Comment on blogs and reviews
- ❤️ Like blogs and reviews
- 🔐 JWT-based authentication

### Web Frontend (React + Vite)

- 🌐 Responsive web interface
- 🎨 Modern UI with Tailwind CSS
- 📊 Movie discovery and search
- 📰 Blog platform for movie discussions
- 👥 User community features

### Admin Panel (React + Vite)

- 🛠️ Content management system
- 📈 Analytics dashboard
- 👑 User management
- ✅ Blog and review moderation
- 📊 Platform statistics

### Backend API (Node.js + Express)

- 🔧 RESTful API with Express.js
- 🗄️ MongoDB database with Mongoose
- 🔐 JWT authentication & authorization
- 📁 Cloudinary image upload
- 🎬 External movie API integration
- 📧 User management system

## 🏗️ Project Structure

```
AdminMobile/
├── mobile/          # React Native mobile app
├── frontend/        # React web frontend
├── Admin/          # React admin panel
├── backend/        # Node.js API server
└── backend-2/      # Alternative backend setup
```

## 🛠️ Tech Stack

### Mobile App

- **React Native** with Expo
- **TypeScript**
- **Expo Router** for navigation
- **AsyncStorage** for local data
- **Axios** for API calls

### Frontend & Admin

- **React 18**
- **Vite** for build tooling
- **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image storage
- **Multer** for file uploads
- **bcryptjs** for password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB database
- Expo CLI (for mobile development)

### Environment Variables

Create `.env` files in the backend directory:

```env
# Backend .env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MOVIE_API_URL=https://adminmobile-gqli.onrender.com/free
PORT=8000
```

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/AdminMobile.git
   cd AdminMobile
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Admin Panel Setup**

   ```bash
   cd Admin
   npm install
   npm run dev
   ```

5. **Mobile App Setup**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## 📱 Mobile App Features

### Authentication

- User registration and login
- JWT token management
- Secure logout functionality

### Movie Discovery

- Browse movies from external API
- Search functionality
- Movie details and ratings
- Add to watchlist

### Blog Platform

- Create movie-related blogs
- Rich text content
- Image uploads
- Comment system
- Like functionality

### User Profile

- Profile management
- Avatar uploads
- View user's blogs and reviews
- Manage watchlist

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Movies

- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID

### Blogs

- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/comments` - Add comment

### Reviews

- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id/like` - Like/unlike review

### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/watchlist/:movieId` - Update watchlist

## 🔧 Development

### Mobile Development

```bash
cd mobile
npx expo start --tunnel  # For device testing
npx expo start --web     # For web preview
```

### Frontend Development

```bash
cd frontend
npm run dev              # Start development server
npm run build           # Build for production
```

### Backend Development

```bash
cd backend
npm run dev             # Start with nodemon
npm start              # Start production server
```

## 🚀 Deployment

### Backend

- Deploy to Render, Heroku, or similar platforms
- Set environment variables in production
- Ensure MongoDB connection is configured

### Frontend/Admin

- Deploy to Vercel, Netlify, or similar platforms
- Update API base URLs for production

### Mobile App

- Build with `npx expo build`
- Deploy to App Store and Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- External movie API for providing movie data
- Cloudinary for image storage services
- MongoDB for database services
- Expo for React Native development tools

## 📞 Contact

- **Author**: Ayush Tripathi
- **GitHub**: [@Ashu8840](https://github.com/Ashu8840)
- **Project Repository**: [AdminMobile](https://github.com/Ashu8840/AdminMobile)

---

⭐ Star this repository if you find it helpful!
