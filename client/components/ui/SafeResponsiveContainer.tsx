import React, { useRef, useCallback } from 'react';
import { ResponsiveContainer, ResponsiveContainerProps } from 'recharts';
import { useSafeResizeObserver } from '@/lib/resizeObserverFix';

interface SafeResponsiveContainerProps extends ResponsiveContainerProps {
  children: React.ReactNode;
  debounceMs?: number;
}

/**
 * A wrapper around ResponsiveContainer that prevents ResizeObserver loops
 * by using debounced resize handling and safe observer patterns.
 */
const SafeResponsiveContainer: React.FC<SafeResponsiveContainerProps> = ({
  children,
  debounceMs = 100,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  // Debounced resize handler
  const debouncedResize = useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (entries: ResizeObserverEntry[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
          }
        }, debounceMs);
      };
    }, [debounceMs]),
    [debounceMs]
  );

  // Use our safe ResizeObserver hook
  useSafeResizeObserver(containerRef, debouncedResize);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer {...props}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default SafeResponsiveContainer;
