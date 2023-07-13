import { OpenAIApi } from "openai";
import type { ZodSchema, TypeOf } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { ChatCompletionFunctions } from "openai";

// This way of openAI updates the types ours will automatically update and we will get type errors if we do something wrong
type CreateChatCompletionTypeSafeFunctionArgs = Parameters<
  OpenAIApi["createChatCompletion"]
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

export class TypeSafeOpenAIApi extends OpenAIApi {
  constructor(configuration) {
    super(configuration);
  }
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

      const res = await this.createChatCompletion(
        { ...rest, functions },
        options
      );
      const arr = res?.data?.choices || [];
      const rawFunctionArgs = JSON.parse(
        arr[arr.length - 1]?.message?.function_call?.arguments || "{}"
      );
      const functionArgs = functionForce.parameters.parse(rawFunctionArgs);

      return functionArgs as TypeOf<Z>;
    } else if ("functions" in args) {
      const functions: ChatCompletionFunctions[] =
        args?.functions?.map((fn) => {
          return {
            name: fn.name,
            description: fn.description,
            parameters: zodToJsonSchema(fn.parameters),
          };
        }) || [];
      console.dir(functions, { depth: null });
      const res = await this.createChatCompletion(
        { ...args, functions },
        options
      );
      return res;
      // const arr = res?.data?.choices || [];
      // const foo = JSON.parse(arr[0]?.message?.function_call?.arguments || "{}");

      // return foo as TypeOf<Z>;
    } else {
      return this.createChatCompletion(args, options);
    }
  }
}
