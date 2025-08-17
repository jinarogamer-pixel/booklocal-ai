// lib/studio/components.ts
// Premium component styles using studio tokens


export const studioComponents = {
    // Button variants
    button: {
        base: `
      inline-flex items-center justify-center gap-2 font-semibold 
      transition-all duration-300 ease-out cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `,

        variants: {
            primary: `
        bg-gradient-to-r from-emerald-500 to-emerald-600 
        hover:from-emerald-600 hover:to-emerald-700
        text-white shadow-lg hover:shadow-emerald-500/25
        focus:ring-emerald-500
        active:scale-95 transform
      `,

            secondary: `
        bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600
        text-gray-100 shadow-md
        focus:ring-gray-500
        active:scale-95 transform
      `,

            ghost: `
        bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20
        text-gray-300 hover:text-white
        focus:ring-white/20
        active:scale-95 transform
      `,

            destructive: `
        bg-gradient-to-r from-red-500 to-red-600 
        hover:from-red-600 hover:to-red-700
        text-white shadow-lg hover:shadow-red-500/25
        focus:ring-red-500
        active:scale-95 transform
      `
        },

        sizes: {
            sm: 'px-3 py-1.5 text-sm rounded-lg',
            md: 'px-4 py-2.5 text-base rounded-xl',
            lg: 'px-6 py-3 text-lg rounded-xl',
            xl: 'px-8 py-4 text-xl rounded-2xl',
        }
    },

    // Card/Panel styles
    card: {
        base: `
      rounded-2xl border backdrop-blur-md
      transition-all duration-300 ease-out
    `,

        variants: {
            default: `
        bg-gray-900/60 border-gray-800 
        hover:bg-gray-900/80 hover:border-gray-700
        shadow-lg hover:shadow-xl
      `,

            glass: `
        bg-white/5 border-white/10 backdrop-blur-xl
        hover:bg-white/10 hover:border-white/20
        shadow-glass hover:shadow-2xl
      `,

            elevated: `
        bg-gray-900 border-gray-700
        shadow-2xl hover:shadow-emerald-500/10
        hover:border-gray-600
      `,

            interactive: `
        bg-gray-900/60 border-gray-800 
        hover:bg-gray-900/80 hover:border-gray-600
        hover:scale-[1.02] hover:shadow-xl
        cursor-pointer transition-transform
      `
        }
    },

    // Input styles
    input: {
        base: `
      w-full px-4 py-2.5 rounded-xl border
      bg-gray-900/60 backdrop-blur-sm
      text-white placeholder-gray-400
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    `,

        variants: {
            default: `
        border-gray-700 hover:border-gray-600 
        focus:border-emerald-500 focus:ring-emerald-500/20
      `,

            error: `
        border-red-500 focus:border-red-500 focus:ring-red-500/20
        bg-red-900/10
      `,

            success: `
        border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20
        bg-emerald-900/10
      `
        }
    },

    // Badge styles
    badge: {
        base: `
      inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
      transition-all duration-200 ease-out
    `,

        variants: {
            default: `
        bg-gray-800 text-gray-300 border border-gray-700
      `,

            success: `
        bg-emerald-900/40 text-emerald-300 border border-emerald-800
      `,

            warning: `
        bg-amber-900/40 text-amber-300 border border-amber-800
      `,

            info: `
        bg-blue-900/40 text-blue-300 border border-blue-800
      `,

            premium: `
        bg-gradient-to-r from-purple-900/40 to-pink-900/40 
        text-purple-300 border border-purple-800
      `
        }
    },

    // Animation utilities
    animation: {
        fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      animation: fadeIn 0.3s ease-out;
    `,

        slideUp: `
      @keyframes slideUp {
        from { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      animation: slideUp 0.5s ease-out;
    `,

        slideInRight: `
      @keyframes slideInRight {
        from { 
          opacity: 0; 
          transform: translateX(30px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }
      animation: slideInRight 0.4s ease-out;
    `,

        bounce: `
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0);
        }
        40%, 43% {
          transform: translate3d(0, -5px, 0);
        }
        70% {
          transform: translate3d(0, -3px, 0);
        }
        90% {
          transform: translate3d(0, -1px, 0);
        }
      }
      animation: bounce 1s ease-in-out;
    `,

        pulse: `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      animation: pulse 2s infinite;
    `
    },

    // Typography styles
    typography: {
        headline: `
      font-extrabold tracking-tight leading-tight
      bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent
    `,

        subheadline: `
      font-medium leading-relaxed text-gray-300
    `,

        body: `
      leading-normal text-gray-400
    `,

        caption: `
      text-sm leading-normal text-gray-500
    `,

        kicker: `
      text-xs font-semibold uppercase tracking-wider text-gray-400
    `
    },

    // Layout utilities
    layout: {
        container: `
      max-w-6xl mx-auto px-6
    `,

        section: `
      py-16 lg:py-24
    `,

        grid: `
      grid gap-6 md:gap-8
    `,

        flexCenter: `
      flex items-center justify-center
    `,

        flexBetween: `
      flex items-center justify-between
    `
    }
};

// Utility function to combine component styles
export const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

// Component style builders
export const buildButtonClass = (variant: keyof typeof studioComponents.button.variants = 'primary', size: keyof typeof studioComponents.button.sizes = 'md') => {
    return cn(
        studioComponents.button.base,
        studioComponents.button.variants[variant],
        studioComponents.button.sizes[size]
    );
};

export const buildCardClass = (variant: keyof typeof studioComponents.card.variants = 'default') => {
    return cn(
        studioComponents.card.base,
        studioComponents.card.variants[variant]
    );
};

export const buildInputClass = (variant: keyof typeof studioComponents.input.variants = 'default') => {
    return cn(
        studioComponents.input.base,
        studioComponents.input.variants[variant]
    );
};

export const buildBadgeClass = (variant: keyof typeof studioComponents.badge.variants = 'default') => {
    return cn(
        studioComponents.badge.base,
        studioComponents.badge.variants[variant]
    );
};
