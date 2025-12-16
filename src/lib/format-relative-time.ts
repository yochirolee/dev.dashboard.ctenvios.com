import { formatDistanceToNow } from "date-fns";

export // Helper to format relative time
const formatRelativeTime = (date: Date): string => {
   const now = new Date();
   const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

   if (diffInHours < 1) return "Just now";
   if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
   if (diffInHours < 48) return "Yesterday";
   const diffInDays = Math.floor(diffInHours / 24);
   if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
   if (diffInDays < 14) return "1 week";
   return formatDistanceToNow(date, { addSuffix: true });
};