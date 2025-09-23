'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  trigger?: string;
}

const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  className = '',
  trigger = 'top 80%'
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const obj = { value: 0 };
    const animation = gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: function() {
        setCount(Math.round(obj.value));
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: trigger,
        once: true,
      }
    });

    return () => {
      animation.kill();
    };
  }, [end, duration, trigger]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedCounter;
