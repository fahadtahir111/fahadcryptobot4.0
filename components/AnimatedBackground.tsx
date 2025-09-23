'use client';

import RippleGrid from './RippleGrid';

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'full';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}

const AnimatedBackground = ({ 
  variant = 'hero', 
  intensity = 'medium',
  color = '#ffffff'
}: AnimatedBackgroundProps) => {
  const getConfig = () => {
    switch (variant) {
      case 'hero':
        return {
          gridSize: 4.0,
          gridThickness: 12.0,
          rippleIntensity: 0.08,
          opacity: intensity === 'high' ? 0.6 : intensity === 'medium' ? 0.4 : 0.3,
          glowIntensity: 0.2,
          vignetteStrength: 0.8,
          fadeDistance: 0.8
        };
      case 'section':
        return {
          gridSize: 6.0,
          gridThickness: 8.0,
          rippleIntensity: 0.05,
          opacity: intensity === 'high' ? 0.5 : intensity === 'medium' ? 0.3 : 0.2,
          glowIntensity: 0.15,
          vignetteStrength: 1.0,
          fadeDistance: 1.0
        };
      case 'full':
        return {
          gridSize: 8.0,
          gridThickness: 6.0,
          rippleIntensity: 0.03,
          opacity: intensity === 'high' ? 0.4 : intensity === 'medium' ? 0.25 : 0.15,
          glowIntensity: 0.1,
          vignetteStrength: 1.2,
          fadeDistance: 1.2
        };
      default:
        return {
          gridSize: 8.0,
          gridThickness: 6.0,
          rippleIntensity: 0.04,
          opacity: 0.2,
          glowIntensity: 0.08,
          vignetteStrength: 1.8,
          fadeDistance: 1.3
        };
    }
  };

  const config = getConfig();

  return (
    <div className="absolute inset-0 w-full h-full">
      <RippleGrid
        enableRainbow={false}
        gridColor={color}
        rippleIntensity={config.rippleIntensity}
        gridSize={config.gridSize}
        gridThickness={config.gridThickness}
        fadeDistance={config.fadeDistance}
        vignetteStrength={config.vignetteStrength}
        glowIntensity={config.glowIntensity}
        opacity={config.opacity}
        gridRotation={0}
        mouseInteraction={true}
        mouseInteractionRadius={1.2}
      />
    </div>
  );
};

export default AnimatedBackground;
