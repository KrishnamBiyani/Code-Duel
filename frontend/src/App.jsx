import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Room from "./pages/Room";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Navbar from "./components/Navbar";

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
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUp /> : <Navigate to="/" />}
          />
          <Route
            path="/signin"
            element={!authUser ? <SignIn /> : <Navigate to="/" />}
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
