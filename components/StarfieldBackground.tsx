"use client";

const stars = Array.from({ length: 110 }, (_, index) => {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  const y = Math.sin(index * 78.233) * 24634.6345;
  const randomX = x - Math.floor(x);
  const randomY = y - Math.floor(y);
  const size = 0.6 + ((index * 7) % 4);

  return {
    id: index,
    left: `${randomX * 100}%`,
    top: `${randomY * 100}%`,
    size: `${size}px`,
    opacity: 0.25 + ((index * 13) % 60) / 100,
    delay: `${(index * 0.37) % 8}s`,
    duration: `${2 + ((index * 11) % 8)}s`,
  };
});

export default function StarfieldBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star-dot absolute rounded-full bg-zinc-700 dark:bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}
