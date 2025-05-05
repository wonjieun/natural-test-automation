import { useState, useCallback } from 'react';

export type Mode = 'analyze' | 'generate';
export type LLMProvider = 'openai' | 'gemini';

interface UseCodegenReturn {
  mode: Mode;
  inputText: string;
  analysisResult: string;
  isLoading: boolean;
  error: string | null;
  selectedProvider: LLMProvider;
  handleModeChange: (newMode: Mode) => void;
  setInputText: (text: string) => void;
  handleProviderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
}

interface ApiRequestBody {
  mode: Mode;
  llmProvider: LLMProvider;
  codegenCode?: string;
  scenario?: string;
}

interface ApiResponse {
  result: string;
  error?: string;
}

export function useCodegen(initialMode: Mode = 'analyze'): UseCodegenReturn {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai');

  const resetState = useCallback(() => {
    setInputText('');
    setAnalysisResult('');
    setError(null);
  }, []);

  const handleModeChange = useCallback((newMode: Mode) => {
    if (newMode !== mode) {
      setMode(newMode);
      resetState();
    }
  }, [mode, resetState]);

  const handleProviderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === 'openai' || value === 'gemini') {
      setSelectedProvider(value);
    }
  }, []);

  const fetchAnalysis = useCallback(async () => {
    if (!inputText.trim()) {
      setError(mode === 'analyze' ? 'Please enter the Codegen code.' : 'Please enter the BDD scenario.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    const requestBody: ApiRequestBody = {
      mode,
      llmProvider: selectedProvider,
      ...(mode === 'analyze' ? { codegenCode: inputText } : { scenario: inputText }),
    };

    try {
      const response = await fetch('/api/analyze-codegen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        try {
          const errorData: Partial<ApiResponse> = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error response parsing failed:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      setAnalysisResult(data.result);

    } catch (err: unknown) {
      console.error(`Error during ${mode} request:`, err);
      if (err instanceof Error) {
        setError(err.message || `An error occurred during ${mode === 'analyze' ? 'analysis' : 'generation'}.`);
      } else {
        setError(`An unknown error occurred during ${mode === 'analyze' ? 'analysis' : 'generation'}.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, selectedProvider]);

  const handleSubmit = useCallback(async () => {
    await fetchAnalysis();
  }, [fetchAnalysis]);

  return {
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
  };
}