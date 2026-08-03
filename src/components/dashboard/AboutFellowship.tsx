import React from 'react';
import Image from 'next/image';

export function AboutFellowship() {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1E4D] to-[#1D4ED8]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/fellowship/congregation.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-2 shadow-lg shrink-0">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/fellowship/dlcf-logo-badge.png"
              alt="Deeper Life Campus Fellowship AFIT Logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="text-center sm:text-left text-white space-y-2">
          <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">About Us</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Deeper Life Campus Fellowship, AFIT
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-2xl">
            A community of students and staff at the Air Force Institute of Technology, Kaduna, standing together
            in holiness, academic excellence, and genuine fellowship — through worship, discipleship, counseling,
            and mentorship, both in the classroom and in Christ.
          </p>
        </div>
      </div>
    </div>
  );
}
