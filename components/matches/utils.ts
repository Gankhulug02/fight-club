// Format date for display
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get relative time (e.g., "2 hours ago", "in 3 days")
export const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffMins) < 60) {
    return diffMins > 0
      ? `in ${diffMins} min${diffMins !== 1 ? "s" : ""}`
      : `${Math.abs(diffMins)} min${diffMins !== -1 ? "s" : ""} ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0
      ? `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`
      : `${Math.abs(diffHours)} hour${diffHours !== -1 ? "s" : ""} ago`;
  } else {
    return diffDays > 0
      ? `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`
      : `${Math.abs(diffDays)} day${diffDays !== -1 ? "s" : ""} ago`;
  }
};

