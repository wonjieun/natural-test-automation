# ✨ Natural Test Automation AI Assistant ✨

🛠️ A web application built with Next.js and TypeScript that leverages AI models (OpenAI or Gemini) to analyze existing Playwright Codegen code or generate Playwright BDD test scripts from scenarios, supporting natural language interactions for test automation.

## 📝 Description

This tool aims to assist developers and QA engineers in refining Playwright test scripts. It provides two main functionalities:

1.  **Codegen Analysis:** Analyzes Playwright Codegen output (TypeScript) and suggests improvements regarding selectors, waits, assertions, and readability. It also explains the actions performed in the code.
2.  **BDD Test Generation:** Takes a Behavior-Driven Development (BDD) scenario (e.g., in Given-When-Then format) and generates a basic Playwright test script (TypeScript) implementing that scenario using `describe`, `test`, and `test.step`.

Users can choose between OpenAI (GPT-4o or other configured models) and Google Gemini (e.g., Gemini 1.5 Flash) to perform these tasks.

## ✅ Features

* **Analyze Playwright Codegen:** Get AI-powered feedback on generated Playwright code.
* **Generate Playwright BDD Tests:** Convert BDD scenarios into Playwright test code drafts.
* **Multiple AI Providers:** Supports both OpenAI and Google Gemini APIs.
* **Intuitive UI:** Simple interface to switch modes, input text, select AI, and view results.
* **Formatted Results:** Displays AI responses clearly, separating text and code blocks.
* **Code Copy Functionality:** Easily copy generated or analyzed code snippets with a single click.
* **Robust Backend:** Next.js API route with input validation using Zod.
* **Custom Hook:** Frontend logic encapsulated in a reusable React hook (`useCodegen`).

## 💻 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
* **API Validation:** [Zod](https://zod.dev/)
* **AI APIs:** [OpenAI API](https://platform.openai.com/), [Google Gemini API](https://ai.google.dev/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 📋 Prerequisites

* [Node.js](https://nodejs.org/) (Version 18.x or later recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### ⚙️ Installation

1.  **👉 Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```
2.  **👉 Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **🔑 Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add your API keys:
    ```dotenv
    # .env.local

    # Required: Your OpenAI API Key
    OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    # Required: Your Google Gemini API Key
    GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    # Optional: If using a proxy or different OpenAI endpoint
    # OPENAI_API_BASE_URL=[https://api.openai.com/v1](https://api.openai.com/v1)
    ```
    *Replace placeholders with your actual keys.*

### ▶️ Running the Development Server

1.  **Start the application:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## 📖 Usage

1.  Open the application in your browser.
2.  Select the desired mode using the tabs: "Codegen Code Analysis" or "BDD Test Generation".
3.  Paste your Playwright Codegen code or type your BDD scenario into the text area.
4.  Choose the AI model you want to use (OpenAI or Gemini) via the radio buttons.
5.  Click the "AI Analyze" or "Generate BDD Test" button.
6.  Wait for the AI response to appear below the button.
7.  Results containing code blocks will have a "Copy" button for convenience.

## 🔗 API Endpoint

The application uses a single API endpoint for interacting with the AI models.

### `POST /api/analyze-codegen`

Handles requests for both analysis and generation.

**Request Body (JSON):**

The request body is validated using Zod.

```typescript
// Zod Schema Summary
{
  // 'analyze' or 'generate', defaults to 'analyze' if omitted
  mode: z.enum(['analyze', 'generate']).default('analyze'),
  // 'openai' or 'gemini', defaults to 'openai' if omitted
  llmProvider: z.enum(['openai', 'gemini']).default('openai'),
  // Required and non-empty string if mode is 'analyze'
  codegenCode?: string,
  // Required and non-empty string if mode is 'generate'
  scenario?: string
}