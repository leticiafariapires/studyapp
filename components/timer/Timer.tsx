'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pause, Play, RotateCcw, Timer as TimerIcon } from 'lucide-react';

type TimerProps = {
  onTimeUpdate: (minutes: number) => void;
  initialTime?: number;
};

export function Timer({ onTimeUpdate, initialTime = 0 }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(initialTime * 60); // Convert minutes to seconds
  const [customTime, setCustomTime] = useState(25); // Default 25 minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start or pause the timer
  const toggleTimer = () => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Start the timer
      if (time === 0) {
        setTime(customTime * 60);
      }
      
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // Timer finished
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            onTimeUpdate(customTime); // Report the full custom time when done
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    setIsRunning(!isRunning);
  };

  // Reset the timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTime(customTime * 60);
  };

  // Set a custom time
  const handleCustomTime = (minutes: number) => {
    setCustomTime(minutes);
    if (!isRunning) {
      setTime(minutes * 60);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Temporizador de Estudo</h3>
        </div>
        <div className="text-2xl font-mono font-bold">
          {formatTime(time)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCustomTime(25)}
          className={customTime === 25 ? 'bg-primary/10' : ''}
        >
          25 min
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCustomTime(45)}
          className={customTime === 45 ? 'bg-primary/10' : ''}
        >
          45 min
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCustomTime(60)}
          className={customTime === 60 ? 'bg-primary/10' : ''}
        >
          60 min
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(Number(e.target.value) || 25)}
            min="1"
            max="240"
            className="w-16 h-8 text-center"
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={isRunning ? 'outline' : 'default'} 
          onClick={toggleTimer}
          className="flex-1 gap-2"
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {time === 0 ? 'Iniciar' : 'Continuar'}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetTimer}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
