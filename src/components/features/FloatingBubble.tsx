import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, X, Minus } from 'lucide-react';
import bubbleIcon from '@/assets/bubble-icon.png';

interface FloatingBubbleProps {
  onOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FloatingBubble = ({ onOpen, isOpen, onClose }: FloatingBubbleProps) => {
  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight * 0.4 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const hasDragged = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    hasDragged.current = false;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged.current = true;
    const size = isMinimized ? 24 : 64;
    setPos({
      x: clamp(dragStart.current.px + dx, 0, window.innerWidth - size),
      y: clamp(dragStart.current.py + dy, 0, window.innerHeight - size),
    });
  }, [isDragging, isMinimized]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (!hasDragged.current) {
      if (!isMinimized) onOpen();
    }
  }, [onOpen, isMinimized]);

  // Snap to edge on release
  useEffect(() => {
    if (!isDragging && !isMinimized) {
      const size = 64;
      const mid = window.innerWidth / 2;
      const snapX = pos.x + size / 2 > mid ? window.innerWidth - size - 8 : 8;
      const timer = setTimeout(() => {
        setPos(p => ({ ...p, x: snapX }));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isDragging, isMinimized]);

  if (isMinimized) {
    return (
      <div
        ref={bubbleRef}
        style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
        className="fixed z-[9999] no-select"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="w-6 h-6 rounded-full glass-bubble glow-purple cursor-pointer flex items-center justify-center"
          onClick={() => setIsMinimized(false)}>
          <div className="w-2 h-2 rounded-full bg-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={bubbleRef}
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      className={`fixed z-[9999] no-select transition-transform duration-200 ${isDragging ? 'scale-110' : 'scale-100'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={`w-16 h-16 rounded-full glass-bubble bubble-pulse cursor-grab active:cursor-grabbing flex items-center justify-center relative overflow-hidden ${isDragging ? 'glow-cyan' : 'glow-purple'}`}>
        <img src={bubbleIcon} alt="AccessiBubble" className="w-10 h-10 object-cover rounded-full opacity-90" />
        
        {/* Quick action buttons when open */}
        {isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full gap-1">
            <button
              className="text-white/80 hover:text-white p-0.5"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setIsMinimized(true); }}
            >
              <Minus size={10} />
            </button>
            <button
              className="text-white/80 hover:text-white p-0.5"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onClose(); }}
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>

      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
          <Settings size={8} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default FloatingBubble;
