# 🎓 IIT Connect

A mobile social app for university students built with React Native (Expo) and Node.js (Express).

## 📁 Project Structure (Monorepo)

```
IIT-Connect/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Business logic (future use)
│   ├── middleware/         # Auth middleware (Phase 3)
│   ├── models/
│   │   └── user.js         # User schema
│   ├── routes/
│   │   └── auth.js         # Login/Register routes
│   ├── .env                # Environment variables (DO NOT COMMIT)
│   ├── .env.example        # Template for .env
│   ├── package.json
│   └── server.js           # Main entry point
│
├── mobile-app/             # React Native + Expo
│   ├── app/
│   │   └── index.tsx       # Login/Register screen
│   ├── src/
│   │   └── config/
│   │       └── api.ts      # API URL configuration
│   ├── assets/
│   ├── app.json
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)
- **Expo Go App** on your phone: [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)
- **MongoDB Atlas Account** (or local MongoDB): [MongoDB Atlas](https://www.mongodb.com/atlas)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/IIT-Connect.git
cd IIT-Connect
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Edit .env and add your MongoDB connection string
# MONGO_URI=mongodb+srv://...

# Start the server
npm run dev
```

You should see:

```
✅ MongoDB Connected: ...
✅ Server running on http://0.0.0.0:5000
```

### Step 3: Setup Mobile App

```bash
# Navigate to mobile-app folder (from root)
cd ../mobile-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

### Step 4: Configure Your IP Address

1. Find your laptop's IP address:
   - **Windows**: Open Command Prompt and run `ipconfig` (look for "IPv4 Address")
   - **Mac/Linux**: Run `ifconfig` or `ip addr`

2. Edit the file: `mobile-app/src/config/api.ts`

3. Change the `LAPTOP_IP` value to your IP:
   ```typescript
   const LAPTOP_IP = "YOUR_IP_HERE";
   ```

### Step 5: Connect From Your Phone

1. Make sure your phone and laptop are on the **same WiFi network**
2. Open **Expo Go** app on your phone
3. Scan the QR code shown in your terminal

## 🔑 API Endpoints

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| GET    | `/api/health`        | Check if server is running |
| POST   | `/api/auth/register` | Create new user            |
| POST   | `/api/auth/login`    | Login existing user        |

### Register Request Body

```json
{
  "username": "john_doe",
  "email": "john@iit.edu",
  "password": "secure123",
  "studentId": "IIT2024001"
}
```

### Login Request Body

```json
{
  "email": "john@iit.edu",
  "password": "secure123"
}
```

## 👥 Team Development Guide

### For Team Members

1. **Never commit `.env` files** - they contain secrets!
2. **Always pull before pushing**: `git pull origin main`
3. **Use meaningful commit messages**: `git commit -m "feat: add login validation"`
4. **Create branches for features**: `git checkout -b feature/user-profile`

### Common Issues

| Problem                    | Solution                                          |
| -------------------------- | ------------------------------------------------- |
| "Cannot connect to server" | Check IP address in `api.ts` and ensure same WiFi |
| "MONGO_URI undefined"      | Make sure `.env` file exists in backend folder    |
| "User not found"           | Register first before trying to login             |
| "Port already in use"      | Kill the process: `npx kill-port 5000`            |

## 📱 Development Roadmap

- [x] **Phase 1**: Project structure & basic setup
- [x] **Phase 2**: User authentication (login/register)
- [ ] **Phase 3**: Password hashing (bcrypt) & JWT tokens
- [ ] **Phase 4**: User profiles & feed
- [ ] **Phase 5**: Real-time features (Socket.io)

## 🛠️ Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Mobile   | React Native + Expo Router              |
| Backend  | Node.js + Express                       |
| Database | MongoDB + Mongoose                      |
| State    | React useState (Context API in Phase 3) |

## 📝 License

ISC

---

**Built with ❤️ by the IIT Connect Team**
