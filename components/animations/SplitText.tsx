'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

interface SplitTextProps {
  animation?: 'fadeIn' | 'fadeInUp' | 'slideIn';
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitBy?: 'chars' | 'words';
  stagger?: number;
}

export function SplitText({
  animation = 'fadeInUp',
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  splitBy = 'chars',
  stagger = 0.02,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const chars = containerRef.current.querySelectorAll('.char');
      if (chars.length === 0) return;

      // Set initial state based on animation type
      switch (animation) {
        case 'fadeIn':
          gsap.set(chars, { opacity: 0 });
          break;
        case 'fadeInUp':
          gsap.set(chars, {
            opacity: 0,
            y: 50,
          });
          break;
        case 'slideIn':
          gsap.set(chars, {
            opacity: 0,
            x: -20,
          });
          break;
      }

      // Animate
      gsap.to(chars, {
        delay,
        duration,
        ease: 'power3.out',
        opacity: 1,
        stagger,
        x: 0,
        y: 0,
      });
    },
    { dependencies: [children], scope: containerRef }
  );

  // Split text into characters or words
  const splitText = () => {
    if (splitBy === 'chars') {
      return children.split('').map((char, index) => (
        <span
          className='char inline-block'
          key={index}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else {
      return children.split(' ').map((word, index) => (
        <span className='char mr-1 inline-block' key={index}>
          {word}
        </span>
      ));
    }
  };

  return (
    <span className={className} ref={containerRef}>
      {splitText()}
    </span>
  );
}
