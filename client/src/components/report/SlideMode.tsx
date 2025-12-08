import { useState, useEffect, useCallback, ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content: ReactNode;
}

interface SlideModeProps {
  slides: Slide[];
  onClose: () => void;
}

export default function SlideMode({ slides, onClose }: SlideModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);
  
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);
  
  const goToSlide = (index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, slides.length - 1)));
  };
  
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);
  
  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const progressPercent = ((currentSlide + 1) / slides.length) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur-sm border-b border-cyan-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{slides[currentSlide]?.title}</h2>
            <span className="text-sm text-white/70">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-slate-700 text-white/70 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 text-white/70 hover:text-white transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {/* Slide Content */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-center">
          <div className="w-full transition-all duration-300 ease-in-out">
            {slides[currentSlide]?.content}
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="flex-shrink-0 bg-slate-800/90 backdrop-blur-sm border-t border-cyan-500/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold">Previous</span>
          </button>
          
          {/* Slide Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-cyan-400'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="font-semibold">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Keyboard Hints */}
      <div className="fixed bottom-20 right-6 bg-slate-800/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-3 text-xs text-white/70">
        <div className="space-y-1">
          <div>→ or Space: Next slide</div>
          <div>← Previous slide</div>
          <div>F: Toggle fullscreen</div>
          <div>ESC: Close presentation</div>
        </div>
      </div>
    </div>
  );
}
