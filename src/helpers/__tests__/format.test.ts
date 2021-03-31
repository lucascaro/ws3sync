import { formatSize } from "../format";

describe("format", () => {
  describe("formatSize", () => {
    it("should format bytes", () => {
      expect(formatSize(0)).toBe("0B");
      expect(formatSize(1)).toBe("1.00B");
      expect(formatSize(30)).toBe("30.00B");
      expect(formatSize(100)).toBe("100.00B");
      expect(formatSize(1000)).toBe("1.00kB");
      expect(formatSize(1542)).toBe("1.54kB");
      expect(formatSize(1546)).toBe("1.55kB");
      expect(formatSize(154200)).toBe("154.20kB");
      expect(formatSize(1_000_000)).toBe("1.00MB");
      expect(formatSize(334_200_000)).toBe("334.20MB");
      expect(formatSize(1_334_200_000)).toBe("1.33GB");
      expect(formatSize(4_231_334_200_000)).toBe("4.23TB");
      expect(formatSize(7_654_231_334_200_000)).toBe("7.65PB");
      expect(formatSize(1_987_654_231_334_200_000)).toBe("1.99EB");
    });
  });
});
