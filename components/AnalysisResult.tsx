import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AnalysisResultProps {
  markdown: string;
  onReset: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ markdown, onReset }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Analysis Result</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} />
          Analyze Another
        </button>
      </div>

      <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <ReactMarkdown
          components={{
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-indigo-900 mt-8 mb-4 border-b pb-2 border-indigo-100" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-4" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-indigo-700" {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
