export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export interface JsonObject {
  [x: string]: JsonValue;
}

type JsonArray = Array<JsonValue>;

export type JsonType<T extends JsonValue> = T;

// Compile-time guard: verifies T is JSON-compatible without adding an index signature.
// Usage: type _guard = JsonGuard<MyInterface>  — compile error if any property is not JsonValue
export type JsonGuard<T extends Record<keyof T, JsonValue>> = true
