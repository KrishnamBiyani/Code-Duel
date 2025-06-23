import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Room from "./pages/Room";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { Loader2 } from "lucide-react";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex items-center gap-3 text-red-600 text-xl font-semibold">
          <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
          Verifying blood pact...
        </div>
      </div>
    );
  }
  //console.log(authUser);

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
