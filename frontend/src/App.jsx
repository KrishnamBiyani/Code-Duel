import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Room from "./pages/Room";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }
  console.log(authUser);

  return (
    <>
      {/* <Navbar /> */}
      <div className="">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={authUser ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUp /> : <Navigate to="/home" />}
          />
          <Route
            path="/signin"
            element={!authUser ? <SignIn /> : <Navigate to="/home" />}
          />
          <Route
            path="/room/:roomId"
            element={authUser ? <Room /> : <Navigate to="/signin" />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
