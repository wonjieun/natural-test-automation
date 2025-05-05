import Head from "next/head";
import clsx from "clsx";
import { useCodegen, Mode, LLMProvider } from "../hooks/useCodegen";
import ResultDisplay from "../components/result-display";
import "../globals.css";

const modeConfig = {
  analyze: {
    pageTitle: "Playwright Codegen Analyzer",
    description:
      "Paste the code generated using Playwright Test Generator's 'Record a New Test' feature below, select the AI model for analysis, and click the 'Analyze with AI' button.",
    inputLabel: "Enter Playwright Codegen Code:",
    inputPlaceholder: "Paste your Playwright Codegen code here.",
    buttonLabel: "Analyze with AI",
    resultTitle: "AI Analysis Result:",
    loadingText: "AI is analyzing...",
  },
  generate: {
    pageTitle: "Playwright BDD Test Generator",
    description:
      "Enter your BDD scenario below, select the AI model for generation, and click the 'Generate BDD Test' button.",
    inputLabel: "Enter BDD Scenario:",
    inputPlaceholder: "Enter your BDD scenario here (e.g., Given-When-Then format).",
    buttonLabel: "Generate BDD Test",
    resultTitle: "Generated Playwright Test Code:",
    loadingText: "AI is generating code...",
  },
};

const CodegenPage = () => {
  const {
    mode,
    inputText,
    analysisResult,
    isLoading,
    error,
    selectedProvider,
    handleModeChange,
    setInputText,
    handleProviderChange,
    handleSubmit,
  } = useCodegen("analyze");

  const config = modeConfig[mode];

  const baseButtonClasses =
    "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition duration-150 ease-in-out";

  const submitButtonClasses = clsx(baseButtonClasses, {
    "bg-gray-400 cursor-not-allowed": isLoading,
    "bg-indigo-600 hover:bg-indigo-700": !isLoading,
  });

  const getTabClasses = (tabMode: Mode): string => {
    const isActive = mode === tabMode;
    return clsx(
      "px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ease-in-out",
      {
        "bg-indigo-100 text-indigo-700": isActive,
        "text-gray-600 hover:bg-gray-100 hover:text-gray-800": !isActive,
      }
    );
  };

  const getRadioLabelClasses = (providerValue: LLMProvider): string => {
    const isSelected = selectedProvider === providerValue;
    return clsx(
      "flex items-center p-3 border rounded-md cursor-pointer transition-all duration-150 ease-in-out",
      {
        "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300": isSelected,
        "border-gray-300 bg-white hover:bg-gray-50": !isSelected,
        "opacity-50 cursor-not-allowed": isLoading,
      }
    );
  };

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <Head>
        <title>{config.pageTitle}</title>
      </Head>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{config.pageTitle}</h1>
      </header>
      <nav className="mb-6 flex space-x-1 bg-white p-1 rounded-lg shadow-sm" aria-label="Tabs">
        <button
          onClick={() => handleModeChange("analyze")}
          className={getTabClasses("analyze")}
          aria-current={mode === "analyze" ? "page" : undefined}
        >
          Codegen Code Analysis
        </button>
        <button
          onClick={() => handleModeChange("generate")}
          className={getTabClasses("generate")}
          aria-current={mode === "generate" ? "page" : undefined}
        >
          BDD Test Generation
        </button>
      </nav>
      <section className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <p className="mb-4 text-gray-600 text-sm">{config.description}</p>

        <label htmlFor="main-input" className="block mb-2 text-sm font-medium text-gray-800">
          {config.inputLabel}
        </label>
        <textarea
          id="main-input"
          className="w-full p-3 min-h-[250px] border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm disabled:bg-gray-100 disabled:opacity-70"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={config.inputPlaceholder}
          disabled={isLoading}
          aria-label={config.inputLabel}
        />
      </section>
      <section className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <div className="mb-6">
          <span className="block mb-3 text-sm font-medium text-gray-800">Select AI model to use:</span>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={getRadioLabelClasses("openai")}>
              <input
                type="radio"
                name="llmProvider"
                value="openai"
                className="sr-only form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                checked={selectedProvider === "openai"}
                onChange={handleProviderChange}
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-800">OpenAI</span>
            </label>
            <label className={getRadioLabelClasses("gemini")}>
              <input
                type="radio"
                name="llmProvider"
                value="gemini"
                className="sr-only form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                checked={selectedProvider === "gemini"}
                onChange={handleProviderChange}
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-800">Gemini</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <button className={submitButtonClasses} onClick={handleSubmit} disabled={isLoading}>
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isLoading ? config.loadingText : config.buttonLabel}
          </button>
          {isLoading && <p className="mt-3 text-sm text-gray-600">{config.loadingText}</p>}
          {error && (
            <div
              className="mt-3 flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700"
              role="alert"
            >
              <svg
                className="flex-shrink-0 w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 14a1 1 0 110-2 1 1 0 010 2zm0-7a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Error:</span>&nbsp;{error}
            </div>
          )}
        </div>
      </section>
      {analysisResult && !isLoading && (
        <section className="mt-10 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-gray-900">{config.resultTitle}</h2>
          <ResultDisplay resultString={analysisResult} />
        </section>
      )}
    </main>
  );
};
export default CodegenPage;
