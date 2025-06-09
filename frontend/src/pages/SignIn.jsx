{
  /* <div className="realtive hidden md:flex flex-1 items-center justify-center bg-gray-900">
        <img
          src={samurai}
          alt="Samurai"
          className="absolute bottom-0 max-h-[100vh] select-none"
          draggable={false}
          style={{ userSelect: "none" }}
        />
      </div> */
}

import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import samurai from "../assets/samurai.png";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { signin, isSigningIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signin(formData);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left Side - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-serif font-bold mb-8 text-center">
            Sign In to DSA Duel
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative border rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-6 text-white/60" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-12 h-14 text-lg bg-black text-white placeholder-white/70 rounded-md"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative border rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-6 text-white/60" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-12 h-14 text-lg bg-black text-white placeholder-white/70 rounded-md"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full border border-white rounded-md hover:bg-white hover:text-black transition duration-300 font-serif font-semibold h-14 text-lg"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Loading...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/70 text-lg">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 font-semibold hover:text-blue-500 transition-colors duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Samurai Image */}
      <div className="relative hidden md:flex flex-1 items-center justify-center bg-gray-900">
        <img
          src={samurai}
          alt="Samurai"
          className="absolute bottom-0 max-h-[100vh] select-none"
          draggable={false}
          style={{ userSelect: "none" }}
        />
      </div>
    </div>
  );
};

export default SignIn;
