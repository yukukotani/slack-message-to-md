import { assert, test } from "vitest";
import { add } from "./add.js";

test("add関数は正しく加算を行う", () => {
  assert(add(1, 2) === 3);
  assert(add(-1, 1) === 0);
  assert(add(0, 0) === 0);
});
