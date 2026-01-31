interface RezzyLogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'dark' | 'light';
}

const RezzyLogo = ({ size = 40, className = '', variant = 'default' }: RezzyLogoProps) => {
  // Color schemes based on variant
  const colors = {
    default: {
      body: '#4A9B8C',      // sage
      face: 'white',
      glasses: '#E8927C',   // coral
      eyes: '#1A3A34',      // ink
      eyeHighlight: 'white',
      antenna: '#E8927C',   // coral
    },
    dark: {
      body: '#6DB3A5',      // sage-light
      face: '#1A3A34',      // ink
      glasses: '#A8D4CA',   // sage-lighter
      eyes: '#A8D4CA',
      eyeHighlight: '#1A3A34',
      antenna: '#6DB3A5',
    },
    light: {
      body: '#4A9B8C',
      face: '#FDF8F3',      // cream
      glasses: '#E8927C',
      eyes: '#1A3A34',
      eyeHighlight: 'white',
      antenna: '#E8927C',
    },
  };

  const c = colors[variant];

  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      className={className}
      aria-label="Rezzy logo"
    >
      {/* Antenna */}
      <g>
        <line x1="50" y1="8" x2="50" y2="0" stroke={c.antenna} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="50" cy="0" r="4" fill={c.antenna}/>
      </g>

      {/* R Body */}
      <path
        d="M20 8 L20 130 L35 130 L35 75 L55 75 L75 130 L92 130 L70 72 C82 68 90 56 90 42 C90 22 74 8 54 8 L20 8 Z M35 22 L54 22 C66 22 75 30 75 42 C75 54 66 62 54 62 L35 62 L35 22 Z"
        fill={c.body}
      />

      {/* Face hole */}
      <ellipse cx="52" cy="42" rx="22" ry="22" fill={c.face}/>

      {/* Glasses frame */}
      <circle cx="42" cy="42" r="12" fill="none" stroke={c.glasses} strokeWidth="2.5"/>
      <circle cx="62" cy="42" r="12" fill="none" stroke={c.glasses} strokeWidth="2.5"/>
      <line x1="54" y1="42" x2="50" y2="42" stroke={c.glasses} strokeWidth="2"/>

      {/* Glasses lenses (subtle tint) */}
      <circle cx="42" cy="42" r="10" fill={c.glasses} opacity="0.1"/>
      <circle cx="62" cy="42" r="10" fill={c.glasses} opacity="0.1"/>

      {/* Eyes */}
      <circle cx="42" cy="43" r="4" fill={c.eyes}/>
      <circle cx="43" cy="41" r="1.5" fill={c.eyeHighlight}/>
      <circle cx="62" cy="43" r="4" fill={c.eyes}/>
      <circle cx="63" cy="41" r="1.5" fill={c.eyeHighlight}/>
    </svg>
  );
};

export default RezzyLogo;
