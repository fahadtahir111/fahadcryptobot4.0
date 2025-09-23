'use client';

import CircularGallery from './CircularGallery';

export default function FeaturesSection() {
  const features = [
    {
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
      text: 'Gemini 2.5 Flash AI Analysis'
    },
    {
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&crop=center',
      text: 'Trading Signals'
    },
    {
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&crop=center',
      text: 'Technical Analysis'
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
      text: 'Risk Management'
    },
    {
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&crop=center',
      text: 'Market Insights'
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
      text: 'Lightning Fast'
    }
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Powered by Advanced AI Technology
          </h2>
          <p className="text-2xl md:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Experience the future of crypto trading with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SignalX's
            </span>{' '}
            cutting-edge AI analysis platform
          </p>
        </div>

        {/* Circular Gallery */}
        <div className="relative">
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery 
              items={features}
              bend={3} 
              textColor="#ffffff" 
              borderRadius={0.05} 
              scrollEase={0.02}
              font="bold 24px Figtree"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
