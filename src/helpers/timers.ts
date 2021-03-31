export const Timers = {
  startTimer(): Readonly<Timer> {
    return Timers.newTimer(Date.now());
  },

  newTimer(startTime: number, endTime?: number): Readonly<Timer> {
    const self = {
      stop() {
        return Timers.newTimer(startTime, Date.now());
      },
      get endTime() {
        return endTime ?? Date.now();
      },
      get ms(): number {
        return self.endTime - startTime;
      },
      get seconds(): number {
        return self.ms / 1000;
      },
      get human(): string {
        const seconds = self.seconds;
        const rseconds = Math.round(seconds);
        const ms = self.ms;
        return seconds > 59.99
          ? // Minutes
            `${Math.floor(rseconds / 60).toFixed(0)}m ${rseconds % 60}s`
          : // Seconds
          seconds >= 1
          ? `${seconds.toFixed(2)}s`
          : // Milliseconds
            `${ms}ms`;
      },
      getSpeed(n: number): string {
        return (n / self.seconds).toFixed(2);
      },
    } as const;

    return Object.freeze(self);
  },
};

export interface Timer {
  stop: () => Timer;
  ms: number;
  seconds: number;
  human: string;
  getSpeed(n: number): string;
}
