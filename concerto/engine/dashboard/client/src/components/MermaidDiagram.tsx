'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      try {
        mermaid.contentLoaded();
        // Mermaid needs to clear the container before re-rendering
        ref.current.removeAttribute('data-processed');
        mermaid.render('mermaid-svg', chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        });
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }
  }, [chart]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div ref={ref} className="mermaid w-full h-full flex items-center justify-center" />
    </div>
  );
}
