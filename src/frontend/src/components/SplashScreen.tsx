import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("out"), 4400);
    const doneTimer = setTimeout(() => onComplete(), 5200);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      data-ocid="splash.panel"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse at center, #0d0d0d 0%, #000000 60%, #050505 100%)",
        opacity: phase === "out" ? 0 : 1,
        transition: phase === "out" ? "opacity 0.8s ease-in-out" : "none",
      }}
    >
      {/* Subtle vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Play icon */}
      <div
        data-ocid="splash.logo"
        style={{
          animation: "splashLogoIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
          marginBottom: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Glow ring */}
        <div
          style={{
            position: "absolute",
            inset: "-12px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,20,20,0.25) 0%, transparent 70%)",
            animation: "splashGlowPulse 2.5s ease-in-out infinite",
          }}
        />
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="YOU WATCH play icon"
        >
          <circle
            cx="48"
            cy="48"
            r="46"
            stroke="rgba(220,20,20,0.5)"
            strokeWidth="1.5"
          />
          <path
            d="M38 30L70 48L38 66V30Z"
            fill="#dc1414"
            stroke="#ff2020"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* YOU WATCH text */}
      <div
        data-ocid="splash.title"
        style={{
          animation:
            "splashTextIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          letterSpacing: "0.18em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 8vw, 64px)",
            color: "#e81010",
            display: "inline-block",
          }}
        >
          YOU
        </span>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 8vw, 64px)",
            color: "#ffffff",
            display: "inline-block",
            marginLeft: "0.18em",
          }}
        >
          WATCH
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          animation:
            "splashTextIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.0s both",
          position: "relative",
          zIndex: 1,
          marginTop: "12px",
          letterSpacing: "0.3em",
          fontSize: "11px",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 400,
          textTransform: "uppercase",
        }}
      >
        Stream Everything
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashTextIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes splashGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
