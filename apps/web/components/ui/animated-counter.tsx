"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  onComplete?: () => void;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
  onComplete,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
        onComplete?.();
      } else {
        setCount(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration, isVisible, onComplete]);

  const formattedValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count);

  return (
    <span ref={ref} className={cn("font-display font-bold tabular-nums", className)}>
      {prefix}
      {Number(formattedValue).toLocaleString()}
      {suffix}
    </span>
  );
}

// Variant with animation styles
interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
}

export function AnimatedNumber({ value, className, suffix = "" }: AnimatedNumberProps) {
  return (
    <span className={cn("inline-block animate-count-up", className)}>
      <AnimatedCounter value={value} suffix={suffix} />
    </span>
  );
}
