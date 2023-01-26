import { initialize, getBooleanToggle, getToggle } from "./simple";

describe("Simple Integration", () => {
  describe("Boolean Toggles", () => {
    beforeEach(() => {
      initialize({
        booleanToggles: {
          foo: true,
          bar: false,
        },
      });
    });

    it("Gets boolean toggles by id", () => {
      expect(getBooleanToggle("foo")).toBeTruthy();
      expect(getBooleanToggle("bar")).toBeFalsy();
    });

    it("defaults to false when toggle cannot be found", () => {
      expect(getBooleanToggle("baz")).toEqual(false);
      // $FlowFixMe: invalid API call for testing purpose
      expect(getBooleanToggle()).toEqual(false);
    });
  });

  describe("Multi Toggles", () => {
    beforeEach(() => {
      initialize({
        toggles: {
          foo: { variant: "b" },
          bar: { variant: "a" },
        },
      });
    });

    it("Gets multi toggles by id", () => {
      expect(getToggle("foo")).toEqual("b");
      expect(getToggle("bar")).toEqual("a");
    });

    it('defaults to "a" when toggle cannot be found', () => {
      expect(getToggle("baz")).toEqual("a");
      // $FlowFixMe: invalid API call for testing purpose
      expect(getToggle()).toEqual("a");
    });
  });
});
