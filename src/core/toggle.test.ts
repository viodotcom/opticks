import { toggle as baseToggle } from "./toggle";

describe("Multi Toggle", () => {
  let toggle;

  beforeEach(() => {
    const dummyGetToggle = jest.fn(
      // only 'foo' is considered true for the tests
      (toggleId) => (toggleId === "foo" ? "b" : "a")
    );

    toggle = baseToggle(dummyGetToggle);
  });

  describe("Experiment Variant", () => {
    it("returns the correct variant based on argument index", () => {
      expect(toggle("foo", "a", "b", "c")).toEqual("b");
    });

    it("executes variant and forwards return value if it is a function", () => {
      const spy = jest.fn().mockImplementation(() => "bar");
      const result = toggle("foo", "a", spy, "c");

      expect(spy).toBeCalled();
      expect(result).toEqual("bar");
    });

    it("defaults to 'a' when experiment cannot be found", () => {
      expect(toggle("nonexistentId", "a", "b", "c")).toEqual("a");
    });
  });
});
