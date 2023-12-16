import OpenAI from "openai";
import type { ZodSchema, TypeOf } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// This way of openAI updates the types ours will automatically update and we will get type errors if we do something wrong
export type CreateChatCompletionTypeSafeFunctionArgs = Parameters<
  OpenAI["chat"]["completions"]["create"]
>;

interface OpenAiFunctionWithParameters<Z extends ZodSchema = ZodSchema> {
  name: string;
  description?: string;
  parameters: Z;
}
type FunctionArray = OpenAiFunctionWithParameters[];
interface FunctionsArg {
  functions: FunctionArray;
}
interface FunctionForceArg<Z extends ZodSchema> {
  functionForce: OpenAiFunctionWithParameters<Z>;
}

export class TypeSafeOpenAIApi extends OpenAI {
  async createChatCompletionTypeSafe<Z extends ZodSchema>(
    args: Omit<CreateChatCompletionTypeSafeFunctionArgs[0], "functions"> &
      (FunctionsArg | FunctionForceArg<Z> | null),
    options?: CreateChatCompletionTypeSafeFunctionArgs[1]
  ): Promise<TypeOf<Z>> {
    if ("functionForce" in args) {
      const { functionForce, ...rest } = args;
      const functions = [
        {
          name: args.functionForce.name,
          description: args.functionForce.description,
          parameters: zodToJsonSchema(args.functionForce.parameters),
        },
      ];

      const res = await this.chat.completions.create(
        { ...rest, functions, stream: false },
        options
      );
      const arr = res?.choices || [];
      const rawFunctionArgs = JSON.parse(
        arr[arr.length - 1]?.message?.function_call?.arguments || "{}"
      );
      const functionArgs = functionForce.parameters.parse(rawFunctionArgs);

      return functionArgs as TypeOf<Z>;
    } else if ("functions" in args) {
      const functions =
        args?.functions?.map((fn) => {
          return {
            name: fn.name,
            description: fn.description,
            parameters: zodToJsonSchema(fn.parameters),
          };
        }) || [];
      const res = await this.chat.completions.create(
        { ...args, functions },
        options
      );
      return res;
    } else {
      return this.chat.completions.create(args, options);
    }
  }
}
