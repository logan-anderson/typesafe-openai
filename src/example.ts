import { Configuration } from "openai";
import z from "zod";
import dotenv from "dotenv";
dotenv.config();
import { TypeSafeOpenAIApi } from "./typesafeOpenAi";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new TypeSafeOpenAIApi(configuration);

const run = async () => {
  // New Way
  const args = await openai.createChatCompletionTypeSafe({
    messages: [
      {
        role: "user",
        content: "What is the weather like today in Washington DC?",
      },
    ],
    model: "gpt-3.5-turbo-0613",
    function_call: { name: "getWeather" },
    functionForce: {
      name: "getWeather",
      description: "Get the current weather",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
        format: z
          .enum(["F", "C"])
          .describe("The format to return the weather in."),
      }),
    },
    // functions: [
    //   {
    //     name: "getWeather",
    //     description: "Get the current weather",
    //     parameters: z.object({
    //       location: z.string().describe("The location to get the weather for"),
    //       format: z
    //         .enum(["F", "C"])
    //         .describe("The format to return the weather in."),
    //     }),
    //   },
    // ],
  });
  console.dir({ args }, { depth: null });
};

run();
// // Old way
// openai.createChatCompletion({
//   messages: [{ role: "user", content: "What is the weather like today?" }],
//   model: "gpt-3.5-turbo-0613",
//   functions: [
//     {
//       name: "weather",
//       description: "Get the current weather",
//       parameters: {
//         type: "object",
//         properties: {
//           location: {
//             type: "string",
//             description: "The location to get the weather for",
//           },
//         },
//       },
//     },
//   ],
// });
