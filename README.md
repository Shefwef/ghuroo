# Ghuroo - Travel & Tourism Platform

Ghuroo is a full-stack MERN (MongoDB, Express, React, Node.js) application for managing tours, bookings, blogs, and reviews. It features separate user and admin interfaces with comprehensive management capabilities.

## 🌐 Live Link

**https://ghuroo.onrender.com/**

## ✨ Features

### User Features
- **User Authentication**
  - Email/Password signup and signin
  - Google OAuth integration
  - Secure JWT-based authentication
  
- **Tour Management**
  - Browse and search tours
  - Filter tours by location, price, and duration
  - View featured tours
  - Detailed tour information with galleries
  
- **Booking System**
  - Book tours with multiple persons
  - Track booking status (pending, confirmed, cancelled)
  - View booking history
  - Real-time booking notifications
  
- **Review System**
  - Submit ratings and reviews for tours
  - View tour average ratings
  - Browse recent reviews
  
- **Blog System**
  - Create and publish travel blogs
  - Upload blog thumbnails and gallery images
  - Comment on blogs
  - Search blogs by title and content
  - View featured blogs
  
- **Destinations**
  - Explore tours by destination
  - Browse destinations (Beach, Mountain, City, Culture)
  
- **Notifications**
  - Real-time notifications for booking status updates
  - Unread notification count
  - Mark notifications as read
  
- **User Profile**
  - Update profile information
  - Upload profile pictures
  - Manage account settings

### Admin Features
- **Admin Dashboard**
  - View statistics (users, tours, blogs, bookings)
  - Analytics and revenue tracking
  - Quick actions for common tasks
  
- **Tour Management**
  - Create, update, and delete tours
  - Upload tour thumbnails and gallery images
  - Mark tours as featured
  - Search and filter tours
  
- **Blog Management**
  - View all user blogs
  - Delete inappropriate blogs
  - Monitor blog activity
  
- **User Management**
  - View all users and admins
  - Update user information
  - Delete user accounts
  
- **Booking Management**
  - View all bookings
  - Update booking status
  - Filter bookings
  - Calculate total revenue
  
- **Review Management**
  - View all reviews
  - Delete reviews
  - Filter reviews by tour and user
  
- **Notifications**
  - Receive notifications for:
    - New user registrations
    - New tour creations
    - New blog publications
    - New bookings
    - New reviews
    - Blog comments
    - Booking status changes

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ghuroo
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGO_URL=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Node Environment
NODE_ENV=development
PORT=8080

# Supabase Storage (for image uploads)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a `.env` file in the `client` directory:

```env
# Firebase Configuration (for Google OAuth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API server will run on `http://localhost:8080`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`


## 📄 License

This project is licensed under the ISC License.


## 👥 Contributors

- [@NafNawal04](https://github.com/NafNawal04)
- [@AASani29](https://github.com/AASani29)
- [@Shefwef](https://github.com/Shefwef)
- [@imtiaz-risat](https://github.com/imtiaz-risat)

