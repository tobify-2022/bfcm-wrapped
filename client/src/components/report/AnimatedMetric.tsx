import { useEffect, useRef, useState } from 'react';

interface AnimatedMetricProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
  decimals?: number;
}

/**
 * Animated number counter with easing
 * Counts up from 0 to target value with smooth animation
 */
export default function AnimatedMetric({
  value,
  duration = 2000,
  formatFn,
  className = '',
  decimals = 0
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  
  useEffect(() => {
    // Reset on value change
    setDisplayValue(0);
    startTimeRef.current = undefined;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = value * eased;
      setDisplayValue(current);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);
  
  const formattedValue = formatFn
    ? formatFn(displayValue)
    : displayValue.toFixed(decimals).toLocaleString();
  
  return <span className={className}>{formattedValue}</span>;
}
