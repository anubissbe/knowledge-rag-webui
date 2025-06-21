import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

export function useResponsive(): ResponsiveState {
  const [responsive, setResponsive] = useState<ResponsiveState>(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: 'landscape',
    isTouchDevice: false,
  }));

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const orientation = height > width ? 'portrait' : 'landscape';
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setResponsive({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
      });
    };

    // Initial update
    updateResponsiveState();

    // Add event listeners
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return responsive;
}

// Hook for specific breakpoint detection
export function useBreakpoint() {
  const { screenWidth } = useResponsive();

  return {
    xs: screenWidth < 480,
    sm: screenWidth >= 480 && screenWidth < 640,
    md: screenWidth >= 640 && screenWidth < 768,
    lg: screenWidth >= 768 && screenWidth < 1024,
    xl: screenWidth >= 1024 && screenWidth < 1280,
    '2xl': screenWidth >= 1280,
  };
}

// Hook for touch device detection
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
    window.addEventListener('touchstart', checkTouchDevice, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouchDevice);
    };
  }, []);

  return isTouchDevice;
}