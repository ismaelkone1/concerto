'use client';

import { Suspense } from 'react';
import { Rocket } from 'lucide-react';
import Launchpad from '@/components/Launchpad';

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
          <div className="text-center">
            <Rocket className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading CONCERTO...</p>
          </div>
        </div>
      }
    >
      <Launchpad />
    </Suspense>
  );
}
