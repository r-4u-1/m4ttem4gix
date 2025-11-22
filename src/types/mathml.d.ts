// Basic MathML JSX intrinsic element declarations so TypeScript stops complaining.
// You can refine these later by replacing `any` with stricter attribute typings.
// Placed under src/types so it's included via tsconfig.app.json include pattern.

import 'react';

// React 19 typings sometimes prefer module augmentation for JSX; using both patterns for safety.
declare global {
  namespace JSX {
    interface MathMLBaseProps extends React.HTMLAttributes<HTMLElement> {
      display?: 'block' | 'inline';
      xmlns?: string;
    }
    interface IntrinsicElements {
      math: MathMLBaseProps;
      mrow: React.HTMLAttributes<HTMLElement>;
      msup: React.HTMLAttributes<HTMLElement>;
      mfrac: React.HTMLAttributes<HTMLElement>;
      mi: React.HTMLAttributes<HTMLElement>;
      mn: React.HTMLAttributes<HTMLElement>;
      mo: React.HTMLAttributes<HTMLElement>;
      mfenced: React.HTMLAttributes<HTMLElement>;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: React.HTMLAttributes<HTMLElement> & { display?: 'block' | 'inline'; xmlns?: string };
      mrow: React.HTMLAttributes<HTMLElement>;
      msup: React.HTMLAttributes<HTMLElement>;
      mfrac: React.HTMLAttributes<HTMLElement>;
      mi: React.HTMLAttributes<HTMLElement>;
      mn: React.HTMLAttributes<HTMLElement>;
      mo: React.HTMLAttributes<HTMLElement>;
      mfenced: React.HTMLAttributes<HTMLElement>;
    }
  }
}

export {};