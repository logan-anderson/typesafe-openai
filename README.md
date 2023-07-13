# typesafe-openai

[![npm version](https://badge.fury.io/js/typesafe-openai.svg)](https://badge.fury.io/js/typesafe-openai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# WARNING:

This package is currently being worked on and the API is subject to change. Please do not use this package in production until it is stable.

## Description

This package provides a subclass of the openAI that ensures type safety for function calling using zod. It does so by taking in a zod schema and converting it to a JSON schema that can be understood by the openAI API. It the arguments are also checked against the zod schema to ensure they are valid.

## Installation

npm:

```bash
npm install typesafe-openai
```

yarn:

```bash
yarn add typesafe-openai
```

pnpm:

```bash
pnpm add typesafe-openai
```

## Usage

Before using this package, you must have an openAI API key. You can get one [here](https://platform.openai.com/account/api-keys).

### Force a function call return

Using `functionForce` will force a function call to be returned and will only return the arguments that are defined. This is useful if you want to force your data to be returned in a certain format.

```typescript
import { Configuration } from "openai";
import z from "zod";
import { TypeSafeOpenAIApi } from "typesafe-openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new TypeSafeOpenAIApi(configuration);

const args = await openai.createChatCompletionTypeSafe({
  messages: [
    {
      role: "user",
      content: "What is the weather like today in Washington DC?",
    },
  ],
  model: "gpt-3.5-turbo-0613",
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
});
console.dir(args, { depth: null });
// Outputs: {location: "Washington DC", format: "F"}
```

This is the same as:

```typescript
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

openai.createChatCompletion({
  messages: [{ role: "user", content: "What is the weather like today?" }],
  function_call: { name: "getWeather" },
  model: "gpt-3.5-turbo-0613",
  functions: [
    {
      name: "weather",
      description: "Get the current weather",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The location to get the weather for",
          },
        },
      },
    },
  ],
});
```

## API Reference

TODO:

## Examples

TODO:

## Contributing

TODO:

## Issues

TODO:

## License

TODO:

## Credits

TODO:

## Frequently Asked Questions (FAQ)

TODO:
