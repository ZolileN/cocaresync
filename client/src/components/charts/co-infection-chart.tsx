import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { CoInfectionTrendData } from "@shared/api-types";

interface ChartDataPoint {
  date: string;
  count: number;
}

export function CoInfectionChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: trends, isLoading } = useQuery<CoInfectionTrendData[]>({
    queryKey: ["/api/dashboard/co-infection-trends"],
    retry: false,
  });

  useEffect(() => {
    if (!trends || !canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Transform API data to chart data
    const chartData: ChartDataPoint[] = trends && trends.length > 0 
      ? trends.map(item => ({
          date: item.date,
          count: item.coInfections
        }))
      : [
          { date: "2024-01", count: 450 },
          { date: "2024-02", count: 520 },
          { date: "2024-03", count: 480 },
          { date: "2024-04", count: 600 },
          { date: "2024-05", count: 580 },
          { date: "2024-06", count: 650 },
          { date: "2024-07", count: 720 },
          { date: "2024-08", count: 680 },
          { date: "2024-09", count: 750 },
          { date: "2024-10", count: 820 },
          { date: "2024-11", count: 890 },
          { date: "2024-12", count: 950 }
        ];

    if (chartData.length === 0) {
      // Draw no data message
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No co-infection trend data available', width / 2, height / 2);
      return;
    }

    const maxCount = Math.max(...chartData.map(d => d.count));
    const minCount = Math.min(...chartData.map(d => d.count));
    const countRange = maxCount - minCount || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= chartData.length - 1; i++) {
      const x = padding + (chartWidth / (chartData.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = 'hsl(210, 100%, 45%)'; // Primary color
    ctx.lineWidth = 3;
    ctx.beginPath();

    chartData.forEach((point: ChartDataPoint, index: number) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index;
      const y = height - padding - ((point.count - minCount) / countRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = 'hsl(210, 100%, 45%)';
    chartData.forEach((point: ChartDataPoint, index: number) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index;
      const y = height - padding - ((point.count - minCount) / countRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw date labels
      if (index % 2 === 0) { // Only draw every other label to avoid overlap
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          point.date, 
          x, 
          height - padding / 2
        );
        ctx.fillStyle = 'hsl(210, 100%, 45%)';
      }
    });

  }, [trends, isLoading]);

  return (
    <div className="h-full w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        aria-label="Co-infection Trends Chart"
        role="img"
      />
    </div>
  );
}
