import { useNavigate } from "react-router-dom";
import samurai from "../assets/samurai.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Center Title */}
      <h1 className="text-6xl md:text-6xl font-extrabold text-center relative z-10 mb-10 font-serif tracking-widest">
        DSA DUEL
      </h1>

      {/* Left Fighter Image - Rotated */}
      <img
        src={samurai}
        alt="Fighter Left"
        className="absolute w-36 md:w-165 object-contain rotate-y-180  left-0 bottom-0"
      />

      {/* Right Fighter Image */}
      <img
        src={samurai}
        alt="Fighter Right"
        className="absolute w-36 md:w-165 object-contain  right-0 bottom-0"
      />

      {/* Duel Button */}
      <button
        onClick={() => navigate("/signin")}
        className="mt-20 px-8 py-4 text-lg md:text-xl font-bold font-serif rounded-md border border-white hover:bg-white hover:text-black transition duration-300 z-10"
      >
        Let’s Duel
      </button>

      {/* Subtle Glow Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black pointer-events-none" />
    </div>
  );
};

export default LandingPage;
