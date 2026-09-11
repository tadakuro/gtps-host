"use client";

import { useEffect, useState } from "react";

interface PageBackgroundProps {
  type: string;
  mediaUrl: string;
  overlayOpacity: number;
}

export default function PageBackground({
  type,
  mediaUrl,
  overlayOpacity,
}: PageBackgroundProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || type === "none" || !mediaUrl) return null;

  const overlayAlpha = overlayOpacity / 100;

  return (
    <div className="pointer-events-none fixed inset-0 z-[-2]">
      {type === "video" && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          style={{ filter: `brightness(${1 - overlayAlpha}) saturate(1.2)` }}
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = "none";
          }}
        >
          <source src={mediaUrl} type="video/mp4" />
        </video>
      )}
      {type === "image" && (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${mediaUrl})`,
            filter: `brightness(${1 - overlayAlpha}) saturate(1.2)`,
          }}
        />
      )}
    </div>
  );
}
