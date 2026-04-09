// File: Client/src/components/VideoTransition.jsx
import { useRef } from 'react';
import styles from '../styles/VideoTransition.module.css';

const VideoTransition = ({ onTransitionPoint, videoSrc = "/assets/videos/inkomod-transition1.mp4" }) => {
    const videoRef = useRef(null);

    const triggerSwitch = () => {
        const video = videoRef.current;
        if (video && !video.dataset.switched) {
            video.dataset.switched = "true";
            if (onTransitionPoint) onTransitionPoint();
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;

        // Trigger switch at 1 second
        if (video.currentTime >= 1.0) {
            triggerSwitch();
        }
    };

    return (
        <div className={styles.videoOverlay}>
            <video
                ref={videoRef}
                className={styles.fullscreenVideo}
                src={videoSrc} // <-- Use the dynamic prop here
                autoPlay
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={triggerSwitch}
                onError={() => {
                    console.error("Video failed to load.");
                    triggerSwitch();
                }}
            />
        </div>
    );
};

export default VideoTransition;