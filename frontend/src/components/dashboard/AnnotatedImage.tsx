"use client";

import { useEffect, useRef, useState } from "react";
import type { Detection } from "@/store/types";

interface AnnotatedImageProps {
  imageUrl: string;
  detections: Detection[];
  isLoading: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  comedone: "#94A3B8", // slate-400
  papule: "#3B82F6", // blue-500
  pustule: "#EAB308", // yellow-500
  nodule: "#EF4444", // red-500
};

const CLASS_INITIALS: Record<string, string> = {
  comedone: "C",
  papule: "Pa",
  pustule: "Pu",
  nodule: "N",
};

export default function AnnotatedImage({ imageUrl, detections, isLoading }: AnnotatedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImageObj(img);
  }, [imageUrl]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !imageObj) return;
    
    const draw = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Handle high-DPI displays for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      // Calculate scale to fit image (cover/contain behavior)
      const scale = Math.max(rect.width / imageObj.width, rect.height / imageObj.height);
      const scaledWidth = imageObj.width * scale;
      const scaledHeight = imageObj.height * scale;
      const xOffset = (rect.width - scaledWidth) / 2;
      const yOffset = (rect.height - scaledHeight) / 2;
      
      ctx.drawImage(imageObj, xOffset, yOffset, scaledWidth, scaledHeight);
      
      // Draw detections
      detections.forEach(det => {
        const x = xOffset + det.bboxX * scaledWidth;
        const y = yOffset + det.bboxY * scaledHeight;
        const w = det.bboxW * scaledWidth;
        const h = det.bboxH * scaledHeight;
        
        const color = CLASS_COLORS[det.className] || "#FFFFFF";
        
        // Bounding box
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (det.lowConf) {
          ctx.setLineDash([5, 3]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.rect(x, y, w, h);
        ctx.stroke();
        
        // Pill background
        ctx.setLineDash([]);
        const initial = CLASS_INITIALS[det.className] || det.className.charAt(0).toUpperCase();
        
        ctx.font = "bold 11px 'DM Sans', sans-serif";
        const textMetrics = ctx.measureText(initial);
        const textWidth = textMetrics.width;
        
        ctx.fillStyle = color;
        
        // Draw rounded rectangle for pill
        const pillX = x;
        const pillY = y - 18;
        const pillW = textWidth + 10;
        const pillH = 18;
        const radius = 4;
        
        ctx.beginPath();
        ctx.moveTo(pillX + radius, pillY);
        ctx.lineTo(pillX + pillW - radius, pillY);
        ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + radius);
        ctx.lineTo(pillX + pillW, pillY + pillH - radius);
        ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - radius, pillY + pillH);
        ctx.lineTo(pillX + radius, pillY + pillH);
        ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - radius);
        ctx.lineTo(pillX, pillY + radius);
        ctx.quadraticCurveTo(pillX, pillY, pillX + radius, pillY);
        ctx.closePath();
        ctx.fill();
        
        // Pill text
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(initial, pillX + 5, pillY + 13);
      });
      
      // Draw Legend if there are detections
      if (detections.length > 0) {
        const counts: Record<string, number> = {};
        detections.forEach(d => {
          counts[d.className] = (counts[d.className] || 0) + 1;
        });
        
        const legendX = 16;
        const legendY = rect.height - 16 - Object.keys(counts).length * 20 - 16;
        const legendW = 120;
        const legendH = Object.keys(counts).length * 20 + 16;
        
        ctx.fillStyle = "rgba(28, 25, 23, 0.7)"; // skin-charcoal transparent
        
        // Rounded legend background
        ctx.beginPath();
        ctx.roundRect(legendX, legendY, legendW, legendH, 8);
        ctx.fill();
        
        ctx.font = "12px 'DM Sans', sans-serif";
        let yPos = legendY + 20;
        Object.entries(counts).forEach(([className, count]) => {
          const color = CLASS_COLORS[className] || "#FFFFFF";
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(legendX + 16, yPos - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(`${className} (${count})`, legendX + 28, yPos);
          yPos += 20;
        });
      }
    };
    
    // Initial draw
    draw();
    
    // Resize observer
    const observer = new ResizeObserver(() => draw());
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [imageObj, detections]);

  // Construct aria-label
  let ariaLabel = "Annotated skin image. No lesions detected.";
  if (detections.length > 0) {
    const counts = { comedones: 0, papules: 0, pustules: 0, nodules: 0 };
    detections.forEach(d => {
      if (d.className === "comedone") counts.comedones++;
      if (d.className === "papule") counts.papules++;
      if (d.className === "pustule") counts.pustules++;
      if (d.className === "nodule") counts.nodules++;
    });
    ariaLabel = `Annotated skin image. Detected: ${counts.comedones} comedones, ${counts.papules} papules, ${counts.pustules} pustules, ${counts.nodules} nodules.`;
  }

  return (
    <div className="relative w-full aspect-square rounded-card overflow-hidden bg-bg-subtle shadow-card" ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 bg-bg-base animate-pulse" />
      )}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
        aria-label={ariaLabel}
        role="img"
      />
    </div>
  );
}
