import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  speed = 80,
  speedOnHover = 25,
  reverse = false,
  className,
}) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      setCurrentDuration(speed / speedOnHover * duration);
    } else {
      setCurrentDuration(duration);
    }
  }, [isHovered, duration, speed, speedOnHover]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex w-max"
        style={{
          gap: `${gap}px`,
          animation: `scroll ${currentDuration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
        {children}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50%));
          }
        }
      `}</style>
    </div>
  );
}
