import { R } from "@praha/byethrow";
import { assert, test } from "vitest";
import { calculate } from "./calculator.js";

test("calculate関数の加算テスト", () => {
  const result = calculate("add", 5, 3);

  assert(R.isSuccess(result));
  if (R.isSuccess(result)) {
    assert(result.value === 8);
  }
});

test("calculate関数の減算テスト", () => {
  const result = calculate("subtract", 10, 4);

  assert(R.isSuccess(result));
  if (R.isSuccess(result)) {
    assert(result.value === 6);
  }
});

test("calculate関数の乗算テスト", () => {
  const result = calculate("multiply", 6, 7);

  assert(R.isSuccess(result));
  if (R.isSuccess(result)) {
    assert(result.value === 42);
  }
});

test("calculate関数の除算テスト", () => {
  const result = calculate("divide", 15, 3);

  assert(R.isSuccess(result));
  if (R.isSuccess(result)) {
    assert(result.value === 5);
  }
});

test("ゼロ除算エラーテスト", () => {
  const result = calculate("divide", 10, 0);

  assert(R.isFailure(result));
  if (R.isFailure(result)) {
    assert(result.error === "Division by zero is not allowed");
  }
});

test("不正な演算子エラーテスト", () => {
  const result = calculate("invalid", 1, 2);

  assert(R.isFailure(result));
  if (R.isFailure(result)) {
    assert(result.error === "Unknown operation: invalid");
  }
});

test("記号での演算テスト", () => {
  const addResult = calculate("+", 2, 3);
  const subtractResult = calculate("-", 5, 2);
  const multiplyResult = calculate("*", 4, 3);
  const divideResult = calculate("/", 8, 2);

  assert(R.isSuccess(addResult));
  assert(R.isSuccess(subtractResult));
  assert(R.isSuccess(multiplyResult));
  assert(R.isSuccess(divideResult));

  if (R.isSuccess(addResult)) assert(addResult.value === 5);
  if (R.isSuccess(subtractResult)) assert(subtractResult.value === 3);
  if (R.isSuccess(multiplyResult)) assert(multiplyResult.value === 12);
  if (R.isSuccess(divideResult)) assert(divideResult.value === 4);
});
