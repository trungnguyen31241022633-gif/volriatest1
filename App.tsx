import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisResult } from './components/AnalysisResult';
import { LoginForm } from './components/LoginForm';
import { extractTextFromPdf } from './services/pdfService';
import { analyzeCV, suggestExploration } from './services/geminiService';
import { AppState, FlowStep, PdfExtractResult } from './types';
import { FileText, Loader2, BrainCircuit, AlertTriangle, Target, ArrowLeft, CheckCircle2, Compass, PenTool, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State quản lý Flow
  const [currentStep, setCurrentStep] = useState<FlowStep>(FlowStep.WELCOME);
  
  // State quản lý dữ liệu
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [targetField, setTargetField] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // State cho nhánh "Chưa định hướng"
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [explorationResult, setExplorationResult] = useState<string>("");

  // State cho nhánh "Điền Template"
  const [templateData, setTemplateData] = useState({
    name: '',
    education: '',
    skills: '',
    experience: ''
  });

  // --- HANDLERS ---
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    resetApp();
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setAppState(AppState.EXTRACTING);
    setError(null);

    try {
      const result: PdfExtractResult = await extractTextFromPdf(selectedFile);
      setExtractedText(result.text);
      setAppState(AppState.READY_TO_ANALYZE);
    } catch (err) {
      setAppState(AppState.ERROR);
      setError(err instanceof Error ? err.message : "Failed to extract text");
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText) return;
    
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const markdown = await analyzeCV(extractedText, targetField);
      setAnalysis(markdown);
      setAppState(AppState.COMPLETED);
    } catch (err) {
      setAppState(AppState.ERROR);
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const handleTemplateSubmit = async () => {
    if (!templateData.name || !templateData.skills) {
      setError("Vui lòng nhập ít nhất Tên và Kỹ năng.");
      return;
    }
    
    // Convert form data to text for AI
    const rawText = `
      HỒ SƠ ỨNG VIÊN (TEMPLATE FORM)
      Họ tên: ${templateData.name}
      Học vấn: ${templateData.education}
      Kỹ năng: ${templateData.skills}
      Kinh nghiệm/Dự án đã làm: ${templateData.experience || "Chưa có kinh nghiệm"}
    `;
    
    setExtractedText(rawText);
    setAppState(AppState.ANALYZING);
    
    try {
      const markdown = await analyzeCV(rawText, targetField || templateData.skills); // Use skills as target if field not set
      setAnalysis(markdown);
      setAppState(AppState.COMPLETED);
    } catch (err) {
      setAppState(AppState.ERROR);
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const handleExplore = async () => {
    if (selectedInterests.length === 0) return;
    setAppState(AppState.ANALYZING);
    try {
      const result = await suggestExploration(selectedInterests);
      setExplorationResult(result);
      setCurrentStep(FlowStep.UNDIRECTED_RESULT);
      setAppState(AppState.IDLE);
    } catch (err) {
      setAppState(AppState.ERROR);
      setError("Không thể lấy gợi ý.");
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCurrentStep(FlowStep.WELCOME);
    setFile(null);
    setExtractedText("");
    setAnalysis("");
    setTargetField("");
    setError(null);
    setExplorationResult("");
    setSelectedInterests([]);
    setTemplateData({ name: '', education: '', skills: '', experience: '' });
  };

  const goBack = () => {
    if (appState === AppState.COMPLETED) {
      // If viewing analysis, go back to where we came from
      if (currentStep === FlowStep.UNDIRECTED_RESULT) {
        setAppState(AppState.IDLE);
        return;
      }
      setAppState(AppState.READY_TO_ANALYZE);
      setAnalysis("");
      return;
    }

    switch (currentStep) {
      case FlowStep.DIRECTION_CHECK_CV:
      case FlowStep.UNDIRECTED_EXPLORE:
        setCurrentStep(FlowStep.WELCOME);
        break;
      case FlowStep.UPLOAD_CV:
      case FlowStep.FILL_TEMPLATE:
        setCurrentStep(FlowStep.DIRECTION_CHECK_CV);
        setAppState(AppState.IDLE);
        setExtractedText("");
        break;
      case FlowStep.UNDIRECTED_RESULT:
        setCurrentStep(FlowStep.UNDIRECTED_EXPLORE);
        break;
      default:
        resetApp();
    }
  };

  // --- RENDER HELPERS ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Chào bạn, sinh viên! 👋</h2>
        <p className="text-lg text-slate-600">
          Hãy cho chúng tôi biết trạng thái hiện tại của bạn để AI có thể hỗ trợ tốt nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onClick={() => setCurrentStep(FlowStep.DIRECTION_CHECK_CV)}
          className="flex flex-col items-center p-8 bg-white border-2 border-indigo-100 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Target size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Đã có định hướng</h3>
          <p className="text-center text-slate-500 text-sm">
            Bạn đã biết mình muốn làm gì hoặc muốn thử sức ở lĩnh vực nào.
          </p>
        </button>

        <button
          onClick={() => setCurrentStep(FlowStep.UNDIRECTED_EXPLORE)}
          className="flex flex-col items-center p-8 bg-white border-2 border-slate-100 rounded-2xl hover:border-sky-500 hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Compass size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có định hướng</h3>
          <p className="text-center text-slate-500 text-sm">
            Bạn chưa biết mình thích gì? Đừng lo, hãy cùng khám phá nhé.
          </p>
        </button>
      </div>
    </div>
  );

  const renderUndirectedExplore = () => {
    const topics = ["Công nghệ thông tin (IT)", "Kinh tế - Marketing", "Thiết kế & Nghệ thuật", "Ngôn ngữ & Sư phạm", "Kỹ thuật - Cơ khí", "Y sinh - Hóa học"];
    
    const toggleInterest = (topic: string) => {
      setSelectedInterests(prev => 
        prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
      );
    };

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Bạn quan tâm đến lĩnh vực nào?</h2>
          <p className="text-slate-600">Chọn một hoặc nhiều lĩnh vực để AI gợi ý dự án trải nghiệm.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => toggleInterest(topic)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedInterests.includes(topic)
                  ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{topic}</span>
                {selectedInterests.includes(topic) && <CheckCircle2 size={16} />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleExplore}
          disabled={selectedInterests.length === 0 || appState === AppState.ANALYZING}
          className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
        >
          {appState === AppState.ANALYZING ? (
            <><Loader2 className="animate-spin" size={20} /> Đang suy nghĩ...</>
          ) : (
            "Đề xuất Dự án & Khóa học"
          )}
        </button>
      </div>
    );
  };

  const renderUndirectedResult = () => (
    <div className="animate-fade-in space-y-6">
       <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-xl font-bold text-sky-800 mb-4 border-b pb-2">Gợi ý từ AI Mentor</h3>
         <ReactMarkdown>{explorationResult}</ReactMarkdown>
       </div>
       
       <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col items-center text-center">
         <h4 className="text-lg font-bold text-indigo-900 mb-2">Bạn có thấy hứng thú không?</h4>
         <p className="text-indigo-700 mb-4 text-sm">Nếu bạn muốn bắt đầu ngay, hãy thử tạo một CV (hoặc Hồ sơ năng lực) sơ khởi để định hướng rõ hơn.</p>
         <div className="flex gap-4">
            <button 
               onClick={() => setCurrentStep(FlowStep.FILL_TEMPLATE)}
               className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Tạo hồ sơ ngay
            </button>
            <button 
               onClick={() => setCurrentStep(FlowStep.UNDIRECTED_EXPLORE)}
               className="bg-white text-slate-600 border border-slate-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Chọn lại lĩnh vực
            </button>
         </div>
       </div>
    </div>
  );

  const renderCheckCV = () => (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
       <h2 className="text-2xl font-bold text-slate-800 mb-6">Bạn đã có CV chưa?</h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => setCurrentStep(FlowStep.UPLOAD_CV)}
            className="p-8 bg-white border-2 border-indigo-100 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <span className="font-bold text-lg text-slate-800">Đã có CV (PDF)</span>
            <span className="text-sm text-slate-500 mt-1">Quét và phân tích ngay</span>
          </button>

          <button
            onClick={() => setCurrentStep(FlowStep.FILL_TEMPLATE)}
            className="p-8 bg-white border-2 border-orange-100 rounded-2xl hover:border-orange-500 hover:shadow-lg transition-all flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
              <PenTool size={28} />
            </div>
            <span className="font-bold text-lg text-slate-800">Chưa có CV</span>
            <span className="text-sm text-slate-500 mt-1">Điền mẫu nhanh & Nhận tư vấn</span>
          </button>
       </div>
    </div>
  );

  const renderUploadCV = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
       <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tải lên CV của bạn</h2>
          <p className="text-slate-600">Hệ thống sẽ quét nội dung và gợi ý công việc phù hợp.</p>
       </div>
       
       <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <FileUpload onFileSelect={handleFileSelect} disabled={appState === AppState.EXTRACTING} />
       </div>

       {(appState === AppState.READY_TO_ANALYZE || appState === AppState.ANALYZING || appState === AppState.EXTRACTING) && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
               <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" />
                  Vị trí / Lĩnh vực mong muốn (Tùy chọn)
               </label>
               <input
                  type="text"
                  placeholder="VD: Marketing Intern, Frontend Dev..."
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  disabled={appState === AppState.ANALYZING}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
               />
            </div>
            
            <div className="p-4 text-center">
               {appState === AppState.READY_TO_ANALYZE && (
                 <button
                   onClick={handleAnalyze}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                 >
                   <BrainCircuit size={20} />
                   Phân tích & Matching
                 </button>
               )}
               {appState === AppState.EXTRACTING && (
                 <div className="text-slate-500 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Đang đọc PDF...</div>
               )}
               {appState === AppState.ANALYZING && (
                 <div className="text-indigo-600 flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> AI đang phân tích chiến lược...</div>
               )}
            </div>
         </div>
       )}
    </div>
  );

  const renderFillTemplate = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Điền thông tin cơ bản</h2>
          <p className="text-slate-600">AI sẽ dựa vào đây để đánh giá tiềm năng và gợi ý dự án.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={templateData.name}
              onChange={e => setTemplateData({...templateData, name: e.target.value})}
              placeholder="Nguyễn Văn A"
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trường / Ngành học</label>
            <input 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={templateData.education}
              onChange={e => setTemplateData({...templateData, education: e.target.value})}
              placeholder="Đại học Bách Khoa - CNTT..."
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kỹ năng / Điểm mạnh</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
              value={templateData.skills}
              onChange={e => setTemplateData({...templateData, skills: e.target.value})}
              placeholder="Ví dụ: Tiếng Anh giao tiếp tốt, biết Python cơ bản, thích làm việc nhóm..."
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm / Dự án (nếu có)</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
              value={templateData.experience}
              onChange={e => setTemplateData({...templateData, experience: e.target.value})}
              placeholder="Đã từng làm tình nguyện viên, bài tập lớn môn học..."
            />
         </div>
         
         {appState === AppState.ANALYZING ? (
            <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-lg flex justify-center items-center gap-2">
               <Loader2 className="animate-spin" /> Đang tạo hồ sơ & Phân tích...
            </div>
         ) : (
            <button
               onClick={handleTemplateSubmit}
               className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
               <BrainCircuit size={20} />
               Hoàn tất & Phân tích
            </button>
         )}
      </div>
    </div>
  );

  // -- RENDER MAIN --

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== FlowStep.WELCOME && (
              <button onClick={goBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BrainCircuit className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Student Career Flow</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
              Powered by Gemini 2.5
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition-colors p-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-pulse">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold">Lỗi</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* View Switcher based on FlowStep */}
        {appState === AppState.COMPLETED ? (
          <AnalysisResult markdown={analysis} onReset={resetApp} />
        ) : (
          <>
            {currentStep === FlowStep.WELCOME && renderWelcome()}
            {currentStep === FlowStep.UNDIRECTED_EXPLORE && renderUndirectedExplore()}
            {currentStep === FlowStep.UNDIRECTED_RESULT && renderUndirectedResult()}
            {currentStep === FlowStep.DIRECTION_CHECK_CV && renderCheckCV()}
            {currentStep === FlowStep.UPLOAD_CV && renderUploadCV()}
            {currentStep === FlowStep.FILL_TEMPLATE && renderFillTemplate()}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} CV Insight AI. Hỗ trợ sinh viên định hướng nghề nghiệp.
        </div>
      </footer>
    </div>
  );
};

export default App;