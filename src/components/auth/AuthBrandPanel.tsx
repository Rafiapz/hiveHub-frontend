import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHexagonNodes } from "@fortawesome/free-solid-svg-icons";

interface AuthBrandPanelProps {
  className?: string;
}

const AuthBrandPanel: FC<AuthBrandPanelProps> = ({ className = "" }) => {
  const features = ["Stories", "Live Polls", "Messaging", "Premium"];
  const stats = [
    { value: "10K+", label: "Users" },
    { value: "50K+", label: "Posts" },
    { value: "99%", label: "Uptime" },
  ];

  return (
    <div
      className={`relative w-full lg:w-1/2 lg:h-full flex flex-col items-center justify-center overflow-hidden py-10 px-6 sm:px-10 lg:py-6 lg:px-8 text-center ${className}`}
      style={{
        background:
          "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-16 -left-16 sm:-top-20 sm:-left-20 w-60 h-60 sm:w-72 sm:h-72 rounded-full opacity-20 animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, #F97316, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-16 w-52 h-52 sm:w-60 sm:h-60 rounded-full opacity-15 animate-pulse-slow animation-delay-400"
          style={{
            background: "radial-gradient(circle, #3B82F6, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-16 left-1/3 w-64 h-64 sm:w-80 sm:h-80 rounded-full opacity-10 animate-pulse-slow animation-delay-200"
          style={{
            background: "radial-gradient(circle, #F97316, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto animate-fade-in flex flex-col items-center my-auto">
        {/* Logo */}
        <div className="mb-3 sm:mb-4 lg:mb-5 flex items-center justify-center gap-2.5 sm:gap-3">
          <div
            className="w-11 h-11 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-brand-hover"
            style={{
              background: "linear-gradient(135deg, #F97316, #EA580C)",
            }}
          >
            <FontAwesomeIcon
              icon={faHexagonNodes}
              className="text-white text-lg sm:text-xl lg:text-2xl"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-black text-white tracking-tight">
            hive<span className="text-brand-orange">Hub</span>
          </h1>
        </div>

        {/* Tagline */}
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">
          Connect. Share. <span className="text-brand-orange">Thrive.</span>
        </h2>
        <p className="text-slate-300 sm:text-slate-400 text-xs sm:text-sm max-w-xs sm:max-w-md mx-auto leading-relaxed">
          Join thousands of creators and professionals building meaningful
          connections in the hive.
        </p>

        {/* Feature pills */}
        <div className="mt-4 sm:mt-6 lg:mt-6 flex flex-wrap gap-2 justify-center">
          {features.map((feat, i) => (
            <span
              key={i}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium text-white border border-white/20 bg-white/5 backdrop-blur-sm shadow-xs hover:bg-white/10 transition-colors"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-5 sm:mt-7 lg:mt-7 grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-sm sm:max-w-md pt-4 sm:pt-5 border-t border-white/10">
          {stats.map(({ value, label }, i) => (
            <div key={i} className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-orange">
                {value}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthBrandPanel;
