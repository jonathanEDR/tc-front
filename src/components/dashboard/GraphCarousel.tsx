import React, { useState } from 'react';

interface GraphCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

const GraphCarousel: React.FC<GraphCarouselProps> = ({ children, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % children.length;
    console.log('🎠 CAROUSEL - Next slide:', { currentIndex, newIndex, totalChildren: children.length });
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + children.length) % children.length;
    console.log('🎠 CAROUSEL - Prev slide:', { currentIndex, newIndex, totalChildren: children.length });
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    console.log('🎠 CAROUSEL - Go to slide:', { currentIndex, targetIndex: index });
    setCurrentIndex(index);
  };

  // Debug log para ver el estado actual
  console.log('🎠 CAROUSEL - Current state:', { currentIndex, childrenCount: children.length });

  return (
    <div className={`relative ${className}`}>
      {/* Contenedor Circular Principal */}
      <div className="relative w-80 h-80 mx-auto">
        {/* Fondo Circular */}
        <div className="absolute inset-0 bg-white rounded-full shadow-xl border-4 border-gray-100" />
        
        {/* Área del Gráfico - Cambiado para mostrar solo el gráfico actual */}
        <div className="absolute inset-4 overflow-hidden rounded-full">
          <div className="w-full h-full flex items-center justify-center">
            {children[currentIndex]}
          </div>
        </div>

        {/* Botones de Navegación */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 
                     w-10 h-10 bg-white rounded-full shadow-md border border-gray-200
                     flex items-center justify-center hover:bg-gray-50 transition-colors
                     text-gray-600 hover:text-gray-800 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     w-10 h-10 bg-white rounded-full shadow-md border border-gray-200
                     flex items-center justify-center hover:bg-gray-50 transition-colors
                     text-gray-600 hover:text-gray-800 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Título del Gráfico Actual */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                        bg-white px-4 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Gráfico {currentIndex + 1} de {children.length}
          </span>
        </div>
      </div>

      {/* Indicadores de Navegación */}
      <div className="flex justify-center mt-6 space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-500 scale-110'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GraphCarousel;