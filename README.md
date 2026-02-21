# Cell Groups Management System

A modern React web application for managing cell groups with role-based access control for Admin and Cell Leaders.

## Features

### Admin Features
- Login with fixed credentials (bethel@gmail.com / 123456)
- Dashboard with overview statistics
- View all Cell Leaders and their students
- Approve/verify Cell Leaders
- Send announcements (broadcast or to specific Cell Leader)

### Cell Leader Features
- Signup and login functionality
- Dashboard access after admin approval
- Student management (add students with name, place, area)
- Attendance tracking (mark present/absent)
- View announcements from Admin

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: Firebase (configured)
- **Styling**: Custom CSS with modern design

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (connection string provided)
- Firebase project (configuration provided)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update MongoDB connection string in `.env` file:
```
MONGODB_URI=mongodb+srv://gopimackeysgopimackeys_db_user:<db_password>@cluster0.m3qqwll.mongodb.net/?appName=Cluster0
```
Replace `<db_password>` with your actual MongoDB password.

3. Start the backend server:
```bash
npm run server
```

4. In a new terminal, start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Admin Login
- Email: `bethel@gmail.com`
- Password: `123456`

### Cell Leader
1. Sign up with email, password, name, place, and area
2. Wait for admin approval
3. Once approved, login to access dashboard

## Project Structure

```
cellgroups/
├── src/
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── CellLeaderLogin.jsx
│   │   ├── CellLeaderSignup.jsx
│   │   ├── CellLeaderDashboard.jsx
│   │   └── PendingApproval.jsx
│   ├── firebase/
│   │   └── config.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── index.js
├── package.json
└── vite.config.js
```

## API Endpoints

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/cellleaders` - Get all cell leaders
- `POST /api/admin/approve/:id` - Approve cell leader
- `GET /api/admin/students` - Get all students grouped by leader

### Cell Leader
- `POST /api/cellleader/signup` - Cell leader registration
- `POST /api/cellleader/login` - Cell leader login
- `GET /api/student/:cellLeaderId` - Get students for a leader
- `POST /api/student/add` - Add new student

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/:cellLeaderId/:place/:date` - Get attendance

### Announcements
- `POST /api/announcement/send` - Send announcement (Admin)
- `GET /api/announcement/:cellLeaderId` - Get announcements (Cell Leader)

## Notes

- The application uses a light theme with card-based layout
- Responsive design with sidebar navigation (collapsible on mobile)
- All data is stored in MongoDB Atlas
- Firebase is configured but authentication is handled via backend API
