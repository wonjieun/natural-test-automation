import React, { useState, useMemo, useCallback } from "react";
import CodeBlock from "./code-block";

interface Props {
  resultString: string;
}

type Segment = { type: "text" | "code"; content: string };

const ResultDisplay = ({ resultString }: Props) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const segments = useMemo<Segment[]>(() => {
    console.log("Parsing result string...");
    const parsedSegments: Segment[] = [];
    const codeBlockRegex = /```(?:[a-zA-Z]+)?\n?(.*?)\n?```/gs;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(resultString)) !== null) {
      if (match.index > lastIndex) {
        parsedSegments.push({ type: "text", content: resultString.substring(lastIndex, match.index).trim() });
      }
      parsedSegments.push({ type: "code", content: match[1].trim() });
      lastIndex = codeBlockRegex.lastIndex; // Use regex.lastIndex for correct position after match
    }

    if (lastIndex < resultString.length) {
      parsedSegments.push({ type: "text", content: resultString.substring(lastIndex).trim() });
    }

    return parsedSegments.filter((segment) => segment.content.length > 0);
  }, [resultString]);

  const handleCopy = useCallback((codeToCopy: string, index: number) => {
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => {
        setCopiedCodeIndex(index);
        setTimeout(() => setCopiedCodeIndex(null), 1500);
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err);
      });
  }, []);

  let codeBlockRenderIndex = -1;

  return (
    <div className="space-y-6">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <p key={`text-${index}`} className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {segment.content}
            </p>
          );
        } else {
          codeBlockRenderIndex++;
          const currentCodeBlockIndex = codeBlockRenderIndex;

          return (
            <CodeBlock
              key={`code-${currentCodeBlockIndex}`}
              codeContent={segment.content}
              isCopied={copiedCodeIndex === currentCodeBlockIndex}
              onCopy={() => handleCopy(segment.content, currentCodeBlockIndex)}
            />
          );
        }
      })}
    </div>
  );
};

export default ResultDisplay;
