import clsx from "clsx";
import React from "react";

interface Props {
  codeContent: string;
  isCopied: boolean;
  onCopy: () => void;
}

const CodeBlock = React.memo(({ codeContent, isCopied, onCopy }: Props) => {
  const copyButtonClasses = clsx(
    "absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-indigo-400",
    {
      'bg-green-600 text-white': isCopied,
      'bg-gray-600 text-gray-200 opacity-60 hover:opacity-100 hover:bg-gray-500': !isCopied,
    }
  );

  return (
    <div className="relative group">
      <pre className="bg-gray-800 text-gray-100 p-4 pt-10 border border-gray-700 rounded-md whitespace-pre-wrap break-words overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <code>{codeContent}</code>
      </pre>
      <button className={copyButtonClasses} onClick={onCopy}>
        <span className="sr-only">{isCopied ? "Copied!" : "Copy code"}</span>
        {isCopied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';
export default CodeBlock;
