"use client";

import { useEffect, useRef, useState } from "react";

interface EyeMascotProps {
  imageUrl?: string;
  speechText?: string;
}

export default function EyeMascot({ imageUrl, speechText }: EyeMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBubble, setShowBubble] = useState(false);

  // Follow cursor with 3D rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angleX = (e.clientX - cx) / 25;
      const angleY = (e.clientY - cy) / 25;
      container.style.transform = `rotateX(${-angleY}deg) rotateY(${angleX}deg)`;
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // Speech bubble timer
  useEffect(() => {
    if (!speechText) return;
    const show = () => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 6500);
    };
    const timer = setTimeout(show, 2500);
    const interval = setInterval(show, 12000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [speechText]);

  if (!speechText && !imageUrl) return null;

  return (
    <>
      {/* Eye */}
      <div
        ref={containerRef}
        className="fixed right-[35px] top-[85px] z-[999] h-[85px] w-[85px] overflow-hidden rounded-full border-[3px] border-neon/40 transition-transform duration-[80ms] linear"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 0 20px rgba(0,255,136,0.5)",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Mascot"
            className="h-full w-full object-cover"
            style={{ animation: "blink 7s infinite" }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, #00ff88 0%, #00cc66 40%, #001a0d 80%)",
              animation: "blink 7s infinite",
            }}
          >
            <div className="h-8 w-8 rounded-full bg-black shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
          </div>
        )}
      </div>

      {/* Speech bubble */}
      {speechText && (
        <div className={`speech-bubble ${showBubble ? "show" : ""}`}>
          {speechText}
        </div>
      )}
    </>
  );
}
