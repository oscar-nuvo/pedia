import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-rezzy-cream relative overflow-hidden">
      {/* Floating blob backgrounds */}
      <div
        className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-rezzy-sage-lighter rounded-full opacity-30"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute -bottom-24 left-1/4 w-[300px] h-[300px] bg-rezzy-coral-pale rounded-full opacity-40"
        style={{ filter: "blur(80px)" }}
      />

      <div className="relative z-10 text-center px-4">
        {/* Big 404 */}
        <h1 className="text-[10rem] md:text-[14rem] font-display font-bold text-rezzy-sage-lighter leading-none">
          404
        </h1>

        {/* Message */}
        <p className="text-xl md:text-2xl text-rezzy-ink-muted mb-8 -mt-4">
          Oops! This page wandered off.
        </p>

        {/* Return link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-rezzy-sage text-white px-8 py-3 rounded-full font-semibold hover:bg-rezzy-sage-light transition-colors"
        >
          ← Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
