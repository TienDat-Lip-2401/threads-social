// src/utils/timeAgo.js
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Enable relativeTime plugin
dayjs.extend(relativeTime);

// Convert timestamp to "time ago" format
export const timeStamp = (timestamp) => {
    return dayjs(timestamp).fromNow();
};

// Examples:
// timeAgo("2025-11-20T15:00:00Z") → "1 hour ago"
// timeAgo("2025-11-20T16:10:00Z") → "2 minutes ago"
// timeAgo("2025-11-19T16:12:00Z") → "1 day ago"
