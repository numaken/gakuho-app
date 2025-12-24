import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  getElapsed: () => number;
}

export const useTimer = ({
  initialTime,
  onTimeUp,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startTimeRef.current !== null) {
      elapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newTime?: number) => {
      setTimeLeft(newTime ?? initialTime);
      setIsRunning(false);
      startTimeRef.current = null;
      elapsedRef.current = 0;
    },
    [initialTime]
  );

  const getElapsed = useCallback(() => {
    let total = elapsedRef.current;
    if (isRunning && startTimeRef.current !== null) {
      total += (Date.now() - startTimeRef.current) / 1000;
    }
    return Math.min(total, initialTime);
  }, [isRunning, initialTime]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    getElapsed,
  };
};
