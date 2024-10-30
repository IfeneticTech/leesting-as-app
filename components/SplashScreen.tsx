"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Change to 5000 for 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <Image 
          src="/images/logo.png"
          alt="Logo"
          width={450}
          height={450}
          className="mb-4 animate-bounce mx-auto translate-y-5" 
        />
        <h1 className="text-4xl font-bold animate-fade-slide mb-0">LeeSting</h1>
        <p className="text-lg font-light text-sky-500 italics animate-typing-delay">Keep The Sound Alive. Dont Stop Listening!</p>
      </div>
    </div>
  );
};

export default SplashScreen;
