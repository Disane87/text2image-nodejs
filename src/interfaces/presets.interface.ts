export interface Presets {
  [key: string]: Preset;
}

export interface Preset {
  sizes: PresetSizes;
  template: string;
  openGraph: boolean;
}

export interface PresetSizes {
  width: number;
  height: number;
}
