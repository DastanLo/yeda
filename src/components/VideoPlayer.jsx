import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import playIcon from '../assets/play.svg';
import pauseIcon from '../assets/pause.svg';
import volumeIcon from '../assets/volume_up.svg';
import muteIcon from '../assets/mute.svg';
import qualityIcon from '../assets/quality.svg';
import fullscreenIcon from '../assets/settings.svg';
import useTimeline from '../hooks/useTimeLine';
import { formatTime } from '../utils';


const VideoPlayer = ({ data }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [levels, setLevels] = useState([]);
    const [showQuality, setShowQuality] = useState(false);

    const { currentTime, hoverInfo, handleTimeUpdate, handleMouseMove, handleClick, clearHover } =
        useTimeline(videoRef, data.videoLength, data.chapters);

    const togglePlay = () => {
        const video = videoRef.current;
        video.paused ? video.play() : video.pause();
        setIsPlaying(!video.paused);
    };

    const toggleFullscreen = () =>
        document.fullscreenElement
            ? document.exitFullscreen()
            : containerRef.current.requestFullscreen().catch(console.error);

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        videoRef.current.volume = val;
        setVolume(val);
        setIsMuted(val === 0);
    };

    const handleMuteToggle = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(v => !v);
    };

    const handleLevelChange = (i) => {
        hlsRef.current.currentLevel = i;
        setShowQuality(false);
    };

    useEffect(() => {
        if (!Hls.isSupported()) return;
        const hls = new Hls();
        hls.loadSource(data.hlsPlaylistUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setLevels(hls.levels));
        hlsRef.current = hls;
        return () => hls.destroy();
    }, []);

    return (
        <div className="video-container" ref={containerRef}>
            <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
            />

            <div className="player-ui">
                {hoverInfo && (
                    <div className="chapter-tooltip" style={{ left: `${hoverInfo.percent}%` }}>
                        <div className="tooltip-title">{hoverInfo.title}</div>
                        <div className="tooltip-time">{hoverInfo.time}</div>
                    </div>
                )}

                <div
                    className="timeline-bar"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={clearHover}
                    onClick={handleClick}
                >
                    {data.chapters.map((ch, i) => (
                        <div key={i} className="timeline-segment"
                             style={{ width: `${((ch.end - ch.start) / data.videoLength) * 100}%` }}>
                            <div className="fill" style={{
                                width: `${Math.min(100, Math.max(0,
                                    ((currentTime - ch.start) / (ch.end - ch.start)) * 100
                                ))}%`
                            }} />
                        </div>
                    ))}
                </div>

                <div className="controls-row">
                    <div className="controls-left">
                        <button onClick={togglePlay} className="ui-icon">
                            <img src={isPlaying ? pauseIcon : playIcon} alt="play/pause" />
                        </button>

                        <div className="volume-group">
                            <button onClick={handleMuteToggle} className="ui-icon">
                                <img src={isMuted || volume === 0 ? muteIcon : volumeIcon} alt="mute" />
                            </button>
                            <input type="range" min="0" max="1" step="0.1"
                                   value={isMuted ? 0 : volume}
                                   onChange={handleVolumeChange}
                                   className="volume-slider"
                            />
                        </div>

                        <span className="time-text">
                            {formatTime(currentTime)} / {formatTime(data.videoLength)}
                        </span>
                    </div>

                    <div className="controls-right">
                        <div className="quality-menu">
                            <button className="ui-icon" onClick={() => setShowQuality(v => !v)}>
                                <img src={qualityIcon} alt="quality" />
                            </button>
                            {showQuality && (
                                <div className="quality-dropdown">
                                    {levels.map((lvl, i) => (
                                        <button key={i} onClick={() => handleLevelChange(i)}>
                                            {lvl.height}p
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="ui-icon">
                            <img src={fullscreenIcon} alt="fullscreen" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
