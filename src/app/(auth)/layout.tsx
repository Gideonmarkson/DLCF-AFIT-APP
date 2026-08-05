import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-[#EFF6FF]/40 to-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.05] z-0"
        style={{
          backgroundImage: 'url(/fellowship/dlcf-logo-badge.png)',
          backgroundSize: '40%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
