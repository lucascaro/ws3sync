import { parseBucketAndPrefix } from "../s3";
import { Timers } from "../timers";

describe("timers", () => {
  it("timer.ms should get milliseconds", () => {
    const timer = Timers.newTimer(0, 10);
    expect(timer.ms).toBe(10);
  });
  it("timer.seconds should get seconds", () => {
    const timer = Timers.newTimer(0, 100);
    expect(timer.seconds).toBe(0.1);
  });

  it("timer.human for milliseconds", () => {
    expect(Timers.newTimer(0, 1).human).toBe("1ms");
    expect(Timers.newTimer(0, 100).human).toBe("100ms");
    expect(Timers.newTimer(0, 999).human).toBe("999ms");
  });
  it("timer.human for seconds", () => {
    expect(Timers.newTimer(0, 1000).human).toBe("1.00s");
    expect(Timers.newTimer(0, 42000).human).toBe("42.00s");
    expect(Timers.newTimer(0, 42499).human).toBe("42.50s");
    expect(Timers.newTimer(0, 42666).human).toBe("42.67s");
    expect(Timers.newTimer(0, 59499).human).toBe("59.50s");
    expect(Timers.newTimer(0, 59990).human).toBe("59.99s");
  });

  it("timer.human for minutes", () => {
    expect(Timers.newTimer(0, 59999).human).toBe("1m 0s");
    expect(Timers.newTimer(0, 60000).human).toBe("1m 0s");
    expect(Timers.newTimer(0, 63000).human).toBe("1m 3s");
    expect(Timers.newTimer(0, (2 * 60 + 33) * 1000).human).toBe("2m 33s");
    expect(Timers.newTimer(0, (10 * 60 + 42) * 1000).human).toBe("10m 42s");
    expect(Timers.newTimer(0, (10 * 60 + 59) * 1000).human).toBe("10m 59s");
    // TODO: hh:mm:ss
  });
});
