import { it, expect } from "vitest";
import z from "zod";

import { TypeSafeOpenAIApi } from "./typesafeOpenAi";

it("Passes", () => {
  expect(TypeSafeOpenAIApi).toBeDefined();
  const foo = new TypeSafeOpenAIApi({});
  foo.createChatCompletionTypeSafe({
    messages: [
      { role: "user", content: "What is the weather today in PEI Canada" },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "getWeather",
        description: "Get the current weather",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
          format: z
            .enum(["F", "C"])
            .describe("The format to return the weather in"),
        }),
      },
    ],
  });
});
