import 'react';

declare module 'react' {
  // Augment JSX namespace to avoid "JSX element implicitly has type 'any'" errors
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 