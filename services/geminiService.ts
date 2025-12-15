// geminiService.ts - Frontend (gọi Backend API)
// API key được bảo vệ ở backend, frontend không biết key

export const analyzeCV = async (cvText: string, targetField?: string): Promise<string> => {
  try {
    console.log("🔄 Gửi yêu cầu đến backend...");

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvText,
        targetField,
        type: 'analyze',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error("Không nhận được phản hồi từ AI");
    }

    console.log("✅ Phân tích thành công");
    return data.text;
    
  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    throw new Error(error.message || "Lỗi phân tích CV");
  }
};

export const suggestExploration = async (interests: string[]): Promise<string> => {
  try {
    console.log("🔄 Gửi yêu cầu gợi ý đến backend...");

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvText: interests,
        type: 'explore',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error("Không nhận được gợi ý từ AI");
    }

    console.log("✅ Gợi ý thành công");
    return data.text;
    
  } catch (error: any) {
    console.error("❌ Lỗi gợi ý:", error);
    throw new Error(error.message || "Lỗi gợi ý");
  }
};
