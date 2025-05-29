import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

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
    <div className="w-[50%] border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <div className="relative border">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="size-5 text-base-content/40" />
            </div>
            <input
              type="email"
              className={`input input-bordered w-full pl-10`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <div className="relative border">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="size-5 text-base-content/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className={`input input-bordered w-full pl-10`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-5 text-base-content/40" />
              ) : (
                <Eye className="size-5 text-base-content/40" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full border cursor-pointer"
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
      <div className="text-center">
        <p className="text-base-content/60">
          Dont have an account?{" "}
          <Link to="/signup" className="link link-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
