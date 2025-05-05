import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import * as z from 'zod';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1";

const OPENAI_MODEL = "gpt-4o";
const GEMINI_MODEL = "gemini-2.0-flash-001";

const SYSTEM_PROMPT_ANALYZE = "You are an expert in analyzing Playwright code.";
const SYSTEM_PROMPT_GENERATE = "You are an expert in generating Playwright BDD test code using TypeScript.";

interface ApiResponse {
  result?: string;
  error?: string;
  details?: z.inferFlattenedErrors<typeof RequestBodySchema>["fieldErrors"];
}

const BaseSchema = z.object({
  llmProvider: z.enum(['openai', 'gemini']).default('openai'),
});

const AnalyzeSchema = BaseSchema.extend({
  mode: z.literal('analyze'),
  codegenCode: z.string().min(1, { message: "Codegen code cannot be empty." }),
  scenario: z.string().optional(),
});

const GenerateSchema = BaseSchema.extend({
  mode: z.literal('generate'),
  scenario: z.string().min(1, { message: "BDD scenario cannot be empty." }),
  codegenCode: z.string().optional(),
});

const RequestBodySchema = z.discriminatedUnion('mode', [
  AnalyzeSchema,
  GenerateSchema,
]);

const RequestBodyInputSchema = z.object({
    mode: z.enum(['analyze', 'generate']).default('analyze'),
    llmProvider: z.enum(['openai', 'gemini']).default('openai'),
    codegenCode: z.string().optional(),
    scenario: z.string().optional(),
});

if (!OPENAI_API_KEY) {
  console.warn("OpenAI API key is missing.");
}
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
});

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key is missing.");
}
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

const getAnalysisPrompt = (codegenCode: string): string => {
  return `Analyze the following Playwright Codegen **TypeScript** code and explain the following improvements in natural language:
- Suggest more robust selectors (e.g., using data-testid attributes).
- Check for unnecessary waits and suggest improvements if any.
- Explain the purpose of the actions and assertions performed in each step in natural language.
- Suggest adding potentially missing important assertions.
- Suggest refactoring for better code readability.
- Provide a brief explanation of the Playwright APIs used in the code.

[Start of Codegen Code]
\`\`\`typescript
${codegenCode}
\`\`\`
[End of Codegen Code]`;
};

const getGenerationPrompt = (scenario: string): string => {
  return `Convert the following BDD scenario into a Playwright test code draft using TypeScript syntax:
- Use Playwright's basic functions (describe, test).
- **Write the initial page navigation (page.goto in the Given step) directly within the test() function body.**
- **Wrap subsequent actions (When) and assertions (Then) steps with test.step(), clearly including comments or step names for each step.**
- Include basic Playwright actions or assertion code corresponding to each step.
- Suggest refactoring for better code readability.
- Provide a brief explanation of the Playwright APIs used in the code.

[Start of BDD Scenario]
${scenario}
[End of BDD Scenario]

Generate the Playwright test code inside a code block (\`\`\`typescript), and write any explanations outside the code block.`;
};

async function generateWithOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("OpenAI API returned an empty result.");
    }
    console.log("Received result from OpenAI.");
    return result;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(`OpenAI API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text ?? null;

    if (text === null) {
      console.warn(`No response from Gemini.`);
      throw new Error(`Gemini API returned an empty result.`);
    }
    console.log("Received result from Gemini.");
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const initialParseResult = RequestBodyInputSchema.safeParse(req.body);

  if (!initialParseResult.success) {
    console.error("Zod Initial Validation Error:", initialParseResult.error.format());
    return res.status(400).json({ error: "Invalid request format.", details: initialParseResult.error.flatten().fieldErrors });
  }

  const validationResult = RequestBodySchema.safeParse(initialParseResult.data);

  if (!validationResult.success) {
    console.error("Zod Validation Error:", validationResult.error.format());
    return res.status(400).json({ error: "Input validation error.", details: validationResult.error.flatten().fieldErrors });
  }

  const validatedData = validationResult.data;

  let prompt: string;
  let systemPrompt: string;

  if (validatedData.mode === "generate") {
    prompt = getGenerationPrompt(validatedData.scenario);
    systemPrompt = SYSTEM_PROMPT_GENERATE;
    console.log(`Mode: generate, Provider: ${validatedData.llmProvider}`);
  } else { // validatedData.mode === "analyze"
    prompt = getAnalysisPrompt(validatedData.codegenCode);
    systemPrompt = SYSTEM_PROMPT_ANALYZE;
    console.log(`Mode: analyze, Provider: ${validatedData.llmProvider}`);
  }

  try {
    let llmResult: string;

    if (validatedData.llmProvider === "gemini") {
      if (!GEMINI_API_KEY) throw new Error("Gemini API key is not configured.");
      llmResult = await generateWithGemini(prompt);
    } else {
      if (!OPENAI_API_KEY) throw new Error("OpenAI API key is not configured.");
      llmResult = await generateWithOpenAI(prompt, systemPrompt!);
    }
    res.status(200).json({ result: llmResult });
  } catch (error: unknown) {
    console.error(`[API Error] Provider: ${validatedData.llmProvider}, Mode: ${validatedData.mode}`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during the API call.";
    res.status(500).json({ error: `LLM API (${validatedData.llmProvider} - ${validatedData.mode}) ${errorMessage}` });
  }
}