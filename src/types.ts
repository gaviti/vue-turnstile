export type Appearance = 'always' | 'execute' | 'interaction-only';

export type Position = 'left' | 'right';

export type Size = 'compact' | 'normal';

export type Styles = {
  position: string;
  bottom: string;
  zIndex: string;
  [key: string]: string;
};

export type Theme = 'light' | 'dark' | 'auto';
