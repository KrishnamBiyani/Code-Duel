#  DSA Duel

A real-time competitive coding platform where two users are matched to solve a random DSA (Data Structures & Algorithms) problem under a timer. Built using the MERN stack with real-time communication via Socket.IO and secure code execution using Judge0 API.

---

##  Features

-  JWT-based authentication (Sign Up, Sign In, Logout)
-  Create or join a private room via unique Room ID
-  Random DSA problem assignment per room
-  Countdown timer (e.g. 10 minutes per match)
-  Code submission with test case validation using Judge0 API
-  Real-time winner detection when all test cases pass
-  Zustand for frontend state management
-  WebSockets (Socket.IO) for real-time communication
-  UI built with Tailwind CSS

---

##  Tech Stack

**Frontend**
- React + Vite
- Zustand
- Axios
- Tailwind CSS + Lucide Icons

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO
- Judge0 (for code execution)
- JWT for authentication

---

##  How It Works

1. **Authentication:** Users sign in via email/password. Auth is managed via JWT tokens stored in cookies.
2. **Room System:** One user creates a room and shares the room ID. Second user joins using the ID.
3. **Question Assignment:** A random DSA problem is fetched from MongoDB and shared to both users in real-time via Socket.IO.
4. **Timer Logic:** Countdown begins when both users are present in the room.
5. **Code Submission:** Users write code and submit it; backend uses Judge0 API to run against test cases.
6. **Winner Declaration:** First user to pass all test cases wins. Socket.IO emits the winner in real-time.

---

##  Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/dsa-duel.git
cd dsa-duel
```

### 2. Setup environment variables

- PORT=PORT
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- JUDGE0_URL=https://judge0.p.rapidapi.com
- JUDGE0_API_KEY1=your_api_key
- JUDGE0_API_KEY2=your_api_key(for more responses)
- NODE_ENV=development

### 3. Install dependencies

Terminal 1
```bash
cd frontend
npm install
npm run dev
```
Terminal 2
```bash
cd backend
npm install
npm run dev
```
