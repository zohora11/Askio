const getTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  console.log({ timestamp, now: now.toISOString(), diffInSeconds });
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  return 'Older';
};

const past = new Date(Date.now() - 300000).toISOString();
console.log(getTimeAgo(past));
