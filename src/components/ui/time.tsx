import { useEffect, useState } from "react";

export default function Time({ timestamp }: { timestamp: Date }) {
  const [showFull, setShowFull] = useState(false);
  const [, setUpdateTrigger] = useState(0);

  // Force update every so often if showing time with seconds
  useEffect(() => {
    if (showFull) return;

    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showFull]);

  function relativeTime() {
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

    // Handle future dates
    if (seconds < 0) {
      const positiveSeconds = Math.abs(seconds);

      // For future dates, calculate the most precise representation
      if (positiveSeconds < intervals.minute) {
        return "in <1 minute";
      }
      if (positiveSeconds < intervals.hour) {
        const minutes = Math.floor(positiveSeconds / intervals.minute);
        return `in ${minutes}m`;
      }
      if (positiveSeconds < intervals.day) {
        const hours = Math.floor(positiveSeconds / intervals.hour);
        const remainingMinutes = Math.floor(
          (positiveSeconds % intervals.hour) / intervals.minute,
        );
        return `in ${hours}h ${remainingMinutes}m`;
      }
      if (positiveSeconds < 2 * intervals.week) {
        const days = Math.floor(positiveSeconds / intervals.day);
        const remainingHours = Math.floor(
          (positiveSeconds % intervals.day) / intervals.hour,
        );
        const remainingMinutes = Math.floor(
          (positiveSeconds % intervals.hour) / intervals.minute,
        );
        return `in ${days}d ${remainingHours}h ${remainingMinutes}m`;
      }
      // For longer periods, use simpler format
      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(positiveSeconds / secondsInUnit);
        if (interval >= 1) {
          return `in ${interval} ${unit}${interval === 1 ? "" : "s"}`;
        }
      }
      return "in a moment";
    }

    // Handle past dates
    if (seconds < intervals.minute) {
      return "<1 minute ago";
    }
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
      {showFull ? fullDateTime : relativeTime()}
    </time>
  );
}
