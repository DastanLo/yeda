export const formatTime = (t) =>
    `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
