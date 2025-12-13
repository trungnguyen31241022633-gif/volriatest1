export enum AppState {
  IDLE = 'IDLE',
  EXTRACTING = 'EXTRACTING',
  READY_TO_ANALYZE = 'READY_TO_ANALYZE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum FlowStep {
  WELCOME = 'WELCOME',
  UNDIRECTED_EXPLORE = 'UNDIRECTED_EXPLORE', // Nhánh chưa có định hướng: Chọn lĩnh vực
  UNDIRECTED_RESULT = 'UNDIRECTED_RESULT',   // Nhánh chưa có định hướng: Xem gợi ý
  DIRECTION_CHECK_CV = 'DIRECTION_CHECK_CV', // Nhánh có định hướng: Hỏi có CV chưa
  UPLOAD_CV = 'UPLOAD_CV',                   // Có CV: Upload
  FILL_TEMPLATE = 'FILL_TEMPLATE',           // Chưa có CV: Điền form
}

export interface AnalysisResponse {
  markdown: string;
}

export interface PdfExtractResult {
  text: string;
  pageCount: number;
}
