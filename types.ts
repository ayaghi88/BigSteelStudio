
export enum QuoteStyle {
  MODERN = 'Modern',
  ELEGANT = 'Elegant',
  BOLD = 'Bold',
  HANDWRITTEN = 'Handwritten',
  MINIMAL = 'Minimal'
}

export enum FontFamily {
  SANS = 'Inter',
  SERIF = 'Playfair Display',
  MONO = 'monospace',
  SCRIPT = 'Caveat',
  DISPLAY = 'Bebas Neue'
}

export enum BackgroundType {
  SOLID = 'Solid',
  GRADIENT = 'Gradient',
  PATTERN_DOTS = 'Dots',
  PATTERN_LINES = 'Lines'
}

export interface QuoteData {
  text: string;
  author: string;
}

export interface QuoteGenerationParams {
  topic: string;
  details: string;
  signature: string;
  count: number;
}

export interface VisualSettings {
  fontFamily: FontFamily;
  fontColor: string;
  bgColor: string;
  bgType: BackgroundType;
}
