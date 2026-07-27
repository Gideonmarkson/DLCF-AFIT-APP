import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DLCF AFIT Saintly Intellectuals Hub',
  description: 'Unified spiritual nurture and academic excellence platform for Deeper Life Campus Fellowship AFIT Kaduna.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFF5F5] text-[#1F2937] min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
