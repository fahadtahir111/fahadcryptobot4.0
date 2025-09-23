'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  trigger?: string;
}

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  trigger = 'top 85%'
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const getTransform = () => {
      switch (direction) {
        case 'up': return { y: 60, opacity: 0 };
        case 'down': return { y: -60, opacity: 0 };
        case 'left': return { x: 60, opacity: 0 };
        case 'right': return { x: -60, opacity: 0 };
        default: return { y: 60, opacity: 0 };
      }
    };

    const getToTransform = () => {
      switch (direction) {
        case 'up': return { y: 0, opacity: 1 };
        case 'down': return { y: 0, opacity: 1 };
        case 'left': return { x: 0, opacity: 1 };
        case 'right': return { x: 0, opacity: 1 };
        default: return { y: 0, opacity: 1 };
      }
    };

    gsap.fromTo(
      cardRef.current,
      getTransform(),
      {
        ...getToTransform(),
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: trigger,
          once: true,
        }
      }
    );
  }, [delay, direction, trigger]);

  return (
    <Card ref={cardRef} className={`${className} opacity-0`}>
      {children}
    </Card>
  );
};

export default AnimatedCard;
