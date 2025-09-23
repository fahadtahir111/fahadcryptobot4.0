'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedIconProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'bounce' | 'rotate' | 'scale' | 'float' | 'pulse';
  trigger?: string;
}

const AnimatedIcon = ({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'bounce',
  trigger = 'top 80%'
}: AnimatedIconProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;

    const getAnimation = () => {
      switch (animation) {
        case 'bounce':
          return {
            from: { y: 0, scale: 1 },
            to: { 
              y: -10, 
              scale: 1.1,
              duration: 0.6,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: -1
            }
          };
        case 'rotate':
          return {
            from: { rotation: 0 },
            to: { 
              rotation: 360,
              duration: 2,
              ease: 'none',
              repeat: -1
            }
          };
        case 'scale':
          return {
            from: { scale: 1 },
            to: { 
              scale: 1.2,
              duration: 0.8,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: -1
            }
          };
        case 'float':
          return {
            from: { y: 0 },
            to: { 
              y: -15,
              duration: 1.5,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: -1
            }
          };
        case 'pulse':
          return {
            from: { scale: 1, opacity: 0.8 },
            to: { 
              scale: 1.1,
              opacity: 1,
              duration: 1,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: -1
            }
          };
        default:
          return {
            from: { y: 0 },
            to: { y: -10, duration: 0.6, ease: 'power2.inOut', yoyo: true, repeat: -1 }
          };
      }
    };

    const anim = getAnimation();

    gsap.fromTo(
      iconRef.current,
      anim.from,
      {
        ...anim.to,
        delay,
        scrollTrigger: {
          trigger: iconRef.current,
          start: trigger,
          once: true,
        }
      }
    );
  }, [delay, animation, trigger]);

  return (
    <div ref={iconRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedIcon;
