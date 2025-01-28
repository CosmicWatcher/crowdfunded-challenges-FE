import { useState } from "react";

export default function Time({ timestamp }: { timestamp: Date }) {
  const [showFull, setShowFull] = useState(false);

  function timeAgo() {
    const seconds = Math.floor(
      (new Date().getTime() - timestamp.getTime()) / 1000,
    );

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }

    return "just now";
  }

  const fullDateTime = timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <time
      dateTime={timestamp.toISOString()}
      title={fullDateTime}
      className="select-none"
      onTouchStart={() => setShowFull((prev) => !prev)}
    >
      {showFull ? fullDateTime : timeAgo()}
    </time>
  );
}
