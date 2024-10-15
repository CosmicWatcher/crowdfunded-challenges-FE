export default function Time({ timestamp }: { timestamp: Date }) {
  return (
    <time dateTime={timestamp.toISOString()}>
      {timestamp.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </time>
  );
}
