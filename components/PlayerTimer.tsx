"use client";

import React, { useEffect, useState } from 'react';

interface TimerProps {
  currentTime: number;
  duration: number;
  onSeek: (seekTime: number) => void;
}

const Timer: React.FC<TimerProps> = ({ currentTime, duration, onSeek }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("currentTime:", currentTime);
    console.log("duration:", duration);
    const intervalId = setInterval(() => {
      setProgress((currentTime / duration) * 100);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentTime, duration]);

  const formatTime = (timeInSeconds: number) => {
    console.log("formatTime input:", timeInSeconds);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2,   
 '0')}`;
  };
  
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (event.target.valueAsNumber / 100) * duration;
    onSeek(seekTime);
  };



  return (
    <div className="flex items-center   
 gap-2">
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleSeek}
        className="w-full appearance-none bg-gray-200 rounded-full"
      />
      <div>
        {formattedCurrentTime} / {formattedDuration}
      </div>
    </div>
  );
};

export default Timer;




// import React, { useEffect, useState } from 'react';

// interface TimerProps {
//   currentTime: number;
//   duration: number;
//   onSeek: (seekTime: number) => void;
// }

// const Timer: React.FC<TimerProps> = ({ currentTime, duration, onSeek }) => {
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setProgress((currentTime / duration) * 100);
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, [currentTime, duration]);

//   const formatTime = (timeInSeconds: number) => {
//     console.log("Input timeInSeconds:", timeInSeconds);
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = Math.floor(timeInSeconds % 60);
//     const formattedTime = `${minutes}:${seconds.toString().padStart(2,   
//    '0')}`;
//     console.log("Formatted time:", formattedTime);
//     return formattedTime;
//   };

//   const formattedCurrentTime = formatTime(currentTime);
//   const formattedDuration = formatTime(duration);

//   const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const seekTime = (event.target.valueAsNumber / 100) * duration;
//     onSeek(seekTime);
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <input
//         type="range"
//         min="0"
//         max="100"
//         value={progress}
//         onChange={handleSeek}
//         className="w-full appearance-none bg-gray-200 rounded-full"
//       />
//       <div>
//         {formattedCurrentTime} / {formattedDuration}
//       </div>
//     </div>
//   );
// };

// export default Timer;