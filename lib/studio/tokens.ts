// lib/studio/tokens.ts
// Studio-level design tokens for consistent premium feel

export const studioTokens = {
    // Color system with semantic meaning
    palette: {
        // Brand colors
        primary: "#10B981",      // emerald-500
        primaryHover: "#059669", // emerald-600
        secondary: "#3B82F6",    // blue-500
        accent: "#F59E0B",       // amber-500

        // Surface colors
        bg: {
            primary: "#0A0C10",    // neutral-950
            secondary: "#111827",   // gray-900
            tertiary: "#1F2937",   // gray-800
            glass: "rgba(17, 24, 39, 0.8)", // glass surfaces
        },

        // Text hierarchy
        text: {
            primary: "#F9FAFB",    // gray-50
            secondary: "#D1D5DB",  // gray-300
            tertiary: "#6B7280",   // gray-500
            muted: "#4B5563",      // gray-600
        },

        // Material tints (for finish selection)
        materials: {
            oak: "#E6D2B5",        // warm oak tint
            tile: "#CFE4F7",       // cool tile tint
            concrete: "#D3D6D8",   // neutral concrete tint
        },

        // Status colors
        status: {
            success: "#22C55E",    // green-500
            warning: "#F59E0B",    // amber-500
            error: "#EF4444",      // red-500
            info: "#3B82F6",       // blue-500
        }
    },

    // Typography scale
    typography: {
        // Font families
        fonts: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        },

        // Type scale
        scale: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem',    // 48px
            '6xl': '3.75rem', // 60px
        },

        // Line heights
        leading: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },

        // Font weights
        weights: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
        }
    },

    // Spacing system
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
        '4xl': '6rem',   // 96px
        '5xl': '8rem',   // 128px
    },

    // Border radius
    radius: {
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',  // pill shape
    },

    // Shadows for depth
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    },

    // Animation durations
    animation: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '750ms',
    },

    // Easing curves
    easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Breakpoints
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    }
} as const;

// Helper functions for consuming tokens
export const token = {
    color: (path: string) => {
        const keys = path.split('.');
        let value: any = studioTokens.palette;
        for (const key of keys) {
            value = value?.[key];
        }
        return value;
    },

    space: (size: keyof typeof studioTokens.spacing) => studioTokens.spacing[size],

    font: (size: keyof typeof studioTokens.typography.scale) => studioTokens.typography.scale[size],

    radius: (size: keyof typeof studioTokens.radius) => studioTokens.radius[size],

    shadow: (size: keyof typeof studioTokens.shadows) => studioTokens.shadows[size],
};

// CSS custom properties generator
export const generateCSSVars = () => {
    return `
:root {
  /* Colors */
  --color-primary: ${studioTokens.palette.primary};
  --color-primary-hover: ${studioTokens.palette.primaryHover};
  --color-secondary: ${studioTokens.palette.secondary};
  --color-accent: ${studioTokens.palette.accent};
  
  /* Backgrounds */
  --bg-primary: ${studioTokens.palette.bg.primary};
  --bg-secondary: ${studioTokens.palette.bg.secondary};
  --bg-tertiary: ${studioTokens.palette.bg.tertiary};
  --bg-glass: ${studioTokens.palette.bg.glass};
  
  /* Text */
  --text-primary: ${studioTokens.palette.text.primary};
  --text-secondary: ${studioTokens.palette.text.secondary};
  --text-tertiary: ${studioTokens.palette.text.tertiary};
  --text-muted: ${studioTokens.palette.text.muted};
  
  /* Materials */
  --material-oak: ${studioTokens.palette.materials.oak};
  --material-tile: ${studioTokens.palette.materials.tile};
  --material-concrete: ${studioTokens.palette.materials.concrete};
  
  /* Spacing */
  --space-xs: ${studioTokens.spacing.xs};
  --space-sm: ${studioTokens.spacing.sm};
  --space-md: ${studioTokens.spacing.md};
  --space-lg: ${studioTokens.spacing.lg};
  --space-xl: ${studioTokens.spacing.xl};
  --space-2xl: ${studioTokens.spacing['2xl']};
  
  /* Typography */
  --font-size-base: ${studioTokens.typography.scale.base};
  --font-size-lg: ${studioTokens.typography.scale.lg};
  --font-size-xl: ${studioTokens.typography.scale.xl};
  --font-size-2xl: ${studioTokens.typography.scale['2xl']};
  --font-size-3xl: ${studioTokens.typography.scale['3xl']};
  --font-size-4xl: ${studioTokens.typography.scale['4xl']};
  --font-size-5xl: ${studioTokens.typography.scale['5xl']};
  
  /* Shadows */
  --shadow-sm: ${studioTokens.shadows.sm};
  --shadow-md: ${studioTokens.shadows.md};
  --shadow-lg: ${studioTokens.shadows.lg};
  --shadow-glass: ${studioTokens.shadows.glass};
  --shadow-glow: ${studioTokens.shadows.glow};
  
  /* Border radius */
  --radius-sm: ${studioTokens.radius.sm};
  --radius-md: ${studioTokens.radius.md};
  --radius-lg: ${studioTokens.radius.lg};
  --radius-xl: ${studioTokens.radius.xl};
  --radius-2xl: ${studioTokens.radius['2xl']};
  --radius-full: ${studioTokens.radius.full};
  
  /* Animation */
  --duration-fast: ${studioTokens.animation.fast};
  --duration-normal: ${studioTokens.animation.normal};
  --duration-slow: ${studioTokens.animation.slow};
  
  /* Easing */
  --ease-out: ${studioTokens.easing.easeOut};
  --ease-in-out: ${studioTokens.easing.easeInOut};
  --ease-spring: ${studioTokens.easing.spring};
}
`;
};
