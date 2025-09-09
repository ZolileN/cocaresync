import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { ChartResponse, ProvincialStats } from "@shared/api-types";

const defaultProvincialData: ProvincialStats[] = [
  { province: "Gauteng", tbCount: 1250, hivCount: 980, coInfectionCount: 623 },
  { province: "KwaZulu-Natal", tbCount: 1890, hivCount: 1456, coInfectionCount: 892 },
  { province: "Western Cape", tbCount: 890, hivCount: 567, coInfectionCount: 345 },
  { province: "Eastern Cape", tbCount: 1120, hivCount: 890, coInfectionCount: 567 },
  { province: "Limpopo", tbCount: 780, hivCount: 623, coInfectionCount: 389 },
  { province: "Mpumalanga", tbCount: 650, hivCount: 512, coInfectionCount: 323 },
  { province: "North West", tbCount: 520, hivCount: 398, coInfectionCount: 234 },
  { province: "Free State", tbCount: 450, hivCount: 356, coInfectionCount: 198 },
  { province: "Northern Cape", tbCount: 280, hivCount: 189, coInfectionCount: 123 }
];

export function ProvincialChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: provincial, isLoading } = useQuery<ChartResponse>({
    queryKey: ["/api/dashboard/provincial-distribution"],
    retry: false,
  });

  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

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
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get chart data, handling both API response and default data
    const chartData = (provincial?.chartData && 
                      Array.isArray(provincial.chartData) && 
                      'province' in provincial.chartData[0]) 
      ? (provincial.chartData as ProvincialStats[])
      : defaultProvincialData;

    if (chartData.length === 0) {
      // Draw no data message
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No provincial data available', width / 2, height / 2);
      return;
    }

    const maxValue = Math.max(...chartData.map(d => Math.max(d.tbCount, d.hivCount, d.coInfectionCount)));
    const barWidth = chartWidth / chartData.length;
    const groupWidth = barWidth * 0.8;
    const individualBarWidth = groupWidth / 3;

    // Colors matching the design
    const colors = {
      tb: 'hsl(0, 84%, 60%)',      // Destructive red for TB
      hiv: 'hsl(45, 93%, 47%)',     // Accent yellow for HIV  
      coInfection: 'hsl(210, 100%, 45%)' // Primary blue for co-infections
    };

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

    // Draw bars
    chartData.forEach((data, index) => {
      const x = padding + barWidth * index + (barWidth - groupWidth) / 2;
      
      // TB bars
      const tbHeight = (data.tbCount / maxValue) * chartHeight;
      ctx.fillStyle = colors.tb;
      ctx.fillRect(x, height - padding - tbHeight, individualBarWidth, tbHeight);
      
      // HIV bars
      const hivHeight = (data.hivCount / maxValue) * chartHeight;
      ctx.fillStyle = colors.hiv;
      ctx.fillRect(x + individualBarWidth, height - padding - hivHeight, individualBarWidth, hivHeight);
      
      // Co-infection bars
      const coInfectionHeight = (data.coInfectionCount / maxValue) * chartHeight;
      ctx.fillStyle = colors.coInfection;
      ctx.fillRect(x + individualBarWidth * 2, height - padding - coInfectionHeight, individualBarWidth, coInfectionHeight);
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(value.toString(), padding - 8, y);
    }

    // Draw X-axis labels (province names)
    ctx.textAlign = 'center';
    ctx.font = '10px Inter, sans-serif';
    chartData.forEach((data, index) => {
      const x = padding + barWidth * index + barWidth / 2;
      const provinceName = data.province.length > 10 ? 
        data.province.substring(0, 8) + '...' : 
        data.province;
      ctx.fillText(provinceName, x, height - padding + 20);
    });

    // Draw legend
    const legendY = 20;
    const legendItems = [
      { label: 'TB Cases', color: colors.tb },
      { label: 'HIV Cases', color: colors.hiv },
      { label: 'Co-infections', color: colors.coInfection }
    ];

    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    legendItems.forEach((item, index) => {
      const x = padding + index * 100;
      
      // Draw color box
      ctx.fillStyle = item.color;
      ctx.fillRect(x, legendY, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#111827';
      ctx.fillText(item.label, x + 16, legendY + 9);
    });

  }, [provincial, isLoading]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        data-testid="provincial-chart"
      />
    </div>
  );
}
