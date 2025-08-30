import { R } from "@praha/byethrow";
import { add } from "../libs/add.js";

export const calculate = (
  operation: string,
  a: number,
  b: number,
): R.Result<number, string> => {
  switch (operation) {
    case "add":
    case "+":
      return R.succeed(add(a, b));
    case "subtract":
    case "-":
      return R.succeed(a - b);
    case "multiply":
    case "*":
      return R.succeed(a * b);
    case "divide":
    case "/":
      if (b === 0) {
        return R.fail("Division by zero is not allowed");
      }
      return R.succeed(a / b);
    default:
      return R.fail(`Unknown operation: ${operation}`);
  }
};
