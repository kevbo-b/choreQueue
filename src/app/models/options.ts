export interface IOptions {
  showMoons: MoonMode;
  theme: Theme;
  showAllDays: boolean;
  background?: string;
}

export enum MoonMode {
  None,
  FullMoonOnly,
  All,
}

export enum Theme {
  Light,
  Dark,
}
