import { useCallback, useState } from 'react';
import { formatTime } from '../utils';

const TOOLTIP_WIDTH = 160;
const EDGE_PADDING = 3;

function useTimeline(videoRef, duration, chapters) {
    const [currentTime, setCurrentTime] = useState(0);
    const [hoverInfo, setHoverInfo] = useState(null);

    const handleTimeUpdate = () => setCurrentTime(videoRef.current.currentTime);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
        const time = (rawPct / 100) * duration;
        const chapter = chapters.find(c => time >= c.start && time <= c.end);
        const half = (TOOLTIP_WIDTH / 2 / rect.width) * 100 + EDGE_PADDING;
        setHoverInfo({
            title: chapter?.title,
            time: formatTime(time),
            percent: Math.min(100 - half, Math.max(half, rawPct)),
        });
    }, [duration, chapters]);

    const handleClick = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    }, [duration]);

    return { currentTime, hoverInfo, handleTimeUpdate, handleMouseMove, handleClick, clearHover: () => setHoverInfo(null) };
}

export default useTimeline;
