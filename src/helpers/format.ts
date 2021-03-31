const SIZE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
export function formatSize(bytes: number): string {
  const exponent = Math.min(Math.floor(Math.log10(bytes) / 3), SIZE_UNITS.length - 1);
  const number = (bytes / Math.pow(1000, exponent)).toFixed(2);
  const unit = SIZE_UNITS[exponent];

  return `${number}${unit}`;
}
