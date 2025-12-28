const AnimatedBackground = () => {
  return (
    <div className="animated-bg">
      {/* Grid pattern */}
      <div className="grid-pattern" />
      
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1 animate-pulse-soft" />
      <div className="floating-orb floating-orb-2 animate-pulse-soft" style={{ animationDelay: '-2s' }} />
      <div className="floating-orb floating-orb-3 animate-pulse-soft" style={{ animationDelay: '-4s' }} />
      <div className="floating-orb floating-orb-4 animate-pulse-soft" style={{ animationDelay: '-6s' }} />
      
      {/* Subtle noise overlay for texture */}
      <div className="noise-overlay opacity-[0.02]" />
    </div>
  );
};

export default AnimatedBackground;