import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// 3D Card Animation
export const animateCard3D = (element: HTMLElement | null) => {
  if (!element) return;

  const card = element;
  const cardContent = card.querySelector('.card-content') as HTMLElement;
  const cardShadow = card.querySelector('.card-shadow') as HTMLElement;

  // Create shadow element if it doesn't exist
  if (!cardShadow) {
    const shadow = document.createElement('div');
    shadow.className = 'card-shadow';
    shadow.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                  rgba(0, 0, 0, 0.1) 0%, 
                  rgba(0, 0, 0, 0.05) 50%, 
                  transparent 100%);
      border-radius: inherit;
      pointer-events: none;
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    card.style.position = 'relative';
    card.appendChild(shadow);
  }

  // Mouse move handler for 3D effect
  const handleMouseMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    // Update CSS custom properties for shadow
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    
    // Apply 3D transform
    gsap.to(card, {
      duration: 0.3,
      ease: 'power2.out',
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transformStyle: 'preserve-3d'
    });
    
    // Show shadow
    gsap.to(cardShadow, {
      duration: 0.3,
      opacity: 1
    });
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    gsap.to(card, {
      duration: 0.5,
      ease: 'power2.out',
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transformStyle: 'preserve-3d'
    });
    
    gsap.to(cardShadow, {
      duration: 0.3,
      opacity: 0
    });
  };

  // Add event listeners
  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    card.removeEventListener('mousemove', handleMouseMove);
    card.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Scrolling Animation
export const animateOnScroll = (elements: NodeListOf<Element> | Element[], animation: string = 'fadeInUp') => {
  const elementArray = Array.from(elements);
  
  elementArray.forEach((element, index) => {
    const el = element as HTMLElement;
    
    gsap.fromTo(el, 
      {
        opacity: 0,
        y: animation.includes('Up') ? 50 : -50,
        x: animation.includes('Left') ? 50 : animation.includes('Right') ? -50 : 0,
        scale: animation.includes('Scale') ? 0.8 : 1,
        rotation: animation.includes('Rotate') ? -15 : 0
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

// Text Animation with Staggered Characters
export const animateText = (element: HTMLElement | null, animation: string = 'typewriter') => {
  if (!element) return;

  const text = element.textContent || '';
  element.textContent = '';
  
  // Create wrapper for characters
  const wrapper = document.createElement('span');
  wrapper.style.display = 'inline-block';
  element.appendChild(wrapper);

  if (animation === 'typewriter') {
    // Typewriter effect
    gsap.to(wrapper, {
      duration: 0.05,
      text: text,
      ease: 'none',
      delay: 0.5
    });
  } else if (animation === 'stagger') {
    // Staggered character reveal
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(20px)';
      wrapper.appendChild(span);
      return span;
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power2.out',
      delay: 0.3
    });
  } else if (animation === 'glitch') {
    // Glitch effect
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      wrapper.appendChild(span);
      return span;
    });

    gsap.to(chars, {
      opacity: 1,
      duration: 0.1,
      stagger: 0.02,
      ease: 'none',
      delay: 0.3,
      onComplete: () => {
        // Add glitch effect after reveal
        gsap.to(chars, {
          duration: 0.1,
          x: 'random(-2, 2)',
          y: 'random(-2, 2)',
          repeat: 3,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }
    });
  }
};

// Floating Animation
export const animateFloating = (element: HTMLElement | null, intensity: number = 10) => {
  if (!element) return;

  gsap.to(element, {
    y: `-=${intensity}`,
    duration: 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1
  });
};

// Pulse Animation
export const animatePulse = (element: HTMLElement | null, scale: number = 1.05) => {
  if (!element) return;

  gsap.to(element, {
    scale: scale,
    duration: 1,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1
  });
};

// Morphing Background Animation
export const animateMorphingBackground = (element: HTMLElement | null) => {
  if (!element) return;

  // Create gradient background
  element.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
  element.style.backgroundSize = '400% 400%';

  gsap.to(element, {
    backgroundPosition: '100% 100%',
    duration: 8,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1
  });
};

// Parallax Effect
export const animateParallax = (element: HTMLElement | null, speed: number = 0.5) => {
  if (!element) return;

  gsap.to(element, {
    y: `${speed * 100}%`,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
};

// Counter Animation
export const animateCounter = (element: HTMLElement | null, target: number, duration: number = 2) => {
  if (!element) return;

  gsap.to(element, {
    duration: duration,
    text: String(target),
    ease: 'power2.out',
    snap: { text: 1 }
  });
};

// Initialize all animations
export const initializeAnimations = () => {
  // Animate headings
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, index) => {
    gsap.fromTo(heading,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        delay: index * 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Animate cards
  const cards = document.querySelectorAll('.trading-card, .card');
  cards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Animate buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    gsap.fromTo(button,
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        delay: index * 0.05,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: button,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

// Cleanup function
export const cleanupAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
