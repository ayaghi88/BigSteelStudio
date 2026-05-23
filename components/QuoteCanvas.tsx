
import React, { useRef, useEffect, useCallback } from 'react';
import { QuoteData, QuoteStyle, VisualSettings, BackgroundType, FontFamily } from '../types';

interface QuoteCanvasProps {
  quote: QuoteData;
  style: QuoteStyle;
  image: string | null;
  settings: VisualSettings;
  onExport: (dataUrl: string) => void;
  index: number;
}

const QuoteCanvas: React.FC<QuoteCanvasProps> = ({ quote, style, image, settings, onExport, index }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, type: BackgroundType) => {
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';

    if (type === BackgroundType.PATTERN_DOTS) {
      for (let x = 0; x < width; x += 30) {
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === BackgroundType.PATTERN_LINES) {
      ctx.lineWidth = 1;
      for (let i = -width; i < width + height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  };

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Slightly darker overlay for photo backgrounds to ensure text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, width, height);
    } else {
      if (settings.bgType === BackgroundType.GRADIENT) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, settings.bgColor);
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = settings.bgColor;
      }
      ctx.fillRect(0, 0, width, height);
      
      if (settings.bgType !== BackgroundType.GRADIENT && settings.bgType !== BackgroundType.SOLID) {
        drawPattern(ctx, width, height, settings.bgType);
      }
    }

    // 2. Styling Config
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = settings.fontColor;
    
    // Add text shadow for better legibility on photos
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    let baseFontSize = 64;
    let fontWeight = '500';
    let fontStyle = 'italic';
    let padding = 140;

    switch (style) {
      case QuoteStyle.ELEGANT:
        baseFontSize = 52;
        fontWeight = '400';
        break;
      case QuoteStyle.BOLD:
        baseFontSize = 85;
        fontWeight = '900';
        fontStyle = 'normal';
        break;
      case QuoteStyle.MINIMAL:
        baseFontSize = 56;
        fontWeight = '300';
        fontStyle = 'normal';
        padding = 200;
        break;
      case QuoteStyle.HANDWRITTEN:
        baseFontSize = 72;
        fontWeight = '400';
        fontStyle = 'normal';
        break;
    }

    // Adjust font size based on text length to ensure it always fits
    const textLength = quote.text.length;
    if (textLength > 150) baseFontSize *= 0.65;
    else if (textLength > 100) baseFontSize *= 0.8;
    else if (textLength > 60) baseFontSize *= 0.9;

    const quoteFont = `${fontStyle} ${fontWeight} ${baseFontSize}px "${settings.fontFamily}"`;
    const authorFont = `700 ${Math.max(24, baseFontSize * 0.45)}px "${settings.fontFamily}"`;

    // 3. Wrap Text Function with height tracking
    const maxWidth = width - (padding * 2);
    const wrapText = (text: string, font: string) => {
      ctx.font = font;
      const words = text.split(' ');
      let line = '';
      const lines = [];
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = baseFontSize * 1.35;
      const totalHeight = lines.length * lineHeight;
      let currentY = (height / 2) - (totalHeight / 2);

      lines.forEach((l) => {
        ctx.fillText(l.trim(), width / 2, currentY);
        currentY += lineHeight;
      });

      return currentY;
    };

    const lastY = wrapText(`"${quote.text}"`, quoteFont);
    
    // 4. Draw Author
    ctx.font = authorFont;
    ctx.globalAlpha = 0.9;
    ctx.shadowBlur = 6; // Lighter shadow for author
    ctx.fillText(`— ${quote.author}`, width / 2, lastY + (baseFontSize * 0.8));
    ctx.globalAlpha = 1.0;

    // 5. Draw Decorative Quote Mark
    ctx.font = `800 ${baseFontSize * 1.8}px "${settings.fontFamily}"`;
    ctx.globalAlpha = 0.15;
    ctx.shadowBlur = 0; // No shadow for the decorative mark
    ctx.fillText('“', width / 2, height / 2 - (baseFontSize * 2.5));
    ctx.globalAlpha = 1.0;

    onExport(canvas.toDataURL('image/png'));
  }, [quote, style, image, index, onExport, settings]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-auto aspect-square rounded-xl shadow-2xl border border-white/10 hidden"
    />
  );
};

export default QuoteCanvas;
