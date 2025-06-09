import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", to: "/" },
    {
      name: "Settings",
      to: "/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 backdrop-blur-lg bg-base-100/80 border-b border-base-300 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
      role="banner"
    >
      <nav
        className="container mx-auto px-4 h-16 flex items-center justify-between"
        aria-label="Primary Navigation"
      >
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity font-bold text-lg"
          aria-label="DSA Duel Homepage"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          DSA Duel
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks.map(({ name, to, icon }) => (
            <Link
              key={to}
              to={to}
              className={`btn btn-sm gap-2 transition-colors ${
                location.pathname === to
                  ? "bg-primary text-white"
                  : "hover:bg-primary/70"
              }`}
            >
              {icon && icon}
              <span>{name}</span>
            </Link>
          ))}

          {authUser ? (
            <>
              <Link
                to="/profile"
                className={`btn btn-sm gap-2 transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-primary text-white"
                    : "hover:bg-primary/70"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="btn btn-sm gap-2 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            id="mobile-menu"
            className="absolute top-full left-0 w-full bg-base-100 border-t border-base-300 shadow-md md:hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map(({ name, to, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                    location.pathname === to
                      ? "bg-primary text-white"
                      : "hover:bg-primary/70"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {icon && icon}
                  {name}
                </Link>
              ))}

              {authUser ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      location.pathname === "/profile"
                        ? "bg-primary text-white"
                        : "hover:bg-primary/70"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
