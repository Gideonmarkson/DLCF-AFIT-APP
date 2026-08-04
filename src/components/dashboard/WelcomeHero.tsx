'use client';

import React, { useEffect, useState } from 'react';

// Drop your real photos into /public/hero/ named slide-1.jpg through slide-15.jpg
// (any you don't have yet just won't load — the gradient behind covers the gap).
const SLIDES = Array.from({ length: 15 }, (_, i) => `/hero/slide-${i + 1}.jpg`);

export function WelcomeHero({ firstName }: { firstName: string }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-80 sm:h-[26rem] rounded-3xl overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#1E40AF]" />

      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-top transition-opacity duration-1000"
          style={{ backgroundImage: `url(${src})`, opacity: activeSlide === i ? 1 : 0 }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

      <div className="relative h-full flex flex-col items-start justify-end p-6 sm:p-8 text-white">
        <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-amber-300 uppercase mb-1.5">
          DLCF AFIT · Saintly Intellectuals Hub
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight drop-shadow-md">
          Welcome, Saintly Intellectual{firstName ? ` ${firstName}` : ''}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 max-w-md">
          Standing saintly in holiness and academic excellence — glad you&apos;re here.
        </p>
      </div>

      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${activeSlide === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
