import { useEffect, useRef } from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniSparkline({ data, color = 'hsl(var(--primary))', height = 24 }: MiniSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, width, h);

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const step = width / (data.length - 1 || 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = i * step;
      const y = h - ((value - min) / range) * (h - 4) - 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [data, color, height]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={height}
      className="opacity-70"
    />
  );
}
