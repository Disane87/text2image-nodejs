export interface Presets {
  [key: string]: Preset;
}

export interface Preset {
  sizes: {
    width: number;
    height: number;
  };
  template: string;
}
