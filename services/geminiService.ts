import { GoogleGenAI } from "@google/genai";

// Lấy API key từ environment variable (đã setup trên Vercel)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBYoUPwNclByF-LZrss2cp3SOBsQFMjp1A";

console.log("API Key Status:", API_KEY ? "✅ Loaded" : "❌ Not Found");
console.log("Using API Key:", API_KEY.substring(0, 15) + "...");

let ai: any = null;

// Khởi tạo AI client an toàn
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
}

export const analyzeCV = async (cvText: string, targetField?: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("❌ API key chưa được cấu hình trên Vercel. Vui lòng thêm VITE_GEMINI_API_KEY vào Environment Variables.");
  }

  if (!ai) {
    throw new Error("❌ Lỗi khởi tạo AI service. Vui lòng kiểm tra lại API key.");
  }

  try {
    const targetContext = targetField 
      ? `\n\n📢 **LƯU Ý QUAN TRỌNG**: Ứng viên này đang mong muốn phát triển sự nghiệp theo hướng: **"${targetField}"**. Hãy tập trung đánh giá sự phù hợp của hồ sơ với hướng đi này.` 
      : "";

    const prompt = `
Bạn là một chuyên gia tư vấn nghề nghiệp và tuyển dụng (HR Specialist). Hãy phân tích hồ sơ năng lực (CV) sau đây và đưa ra nhận xét chi tiết bằng **Tiếng Việt**.

${targetContext}

Nhiệm vụ của bạn là cung cấp một báo cáo gồm 4 phần chính, sử dụng định dạng Markdown:

1. 🌟 **Điểm mạnh (Strengths)**
   - Liệt kê 5-7 điểm mạnh nổi bật nhất về kỹ năng, kinh nghiệm hoặc tư duy của ứng viên.
   ${targetField ? `- Đánh giá xem những điểm mạnh này có hỗ trợ tốt cho mục tiêu "${targetField}" hay không.` : ""}

2. 🔻 **Điểm yếu & Cải thiện (Weaknesses)**
   - Chỉ ra 3-5 điểm hạn chế hoặc thiếu sót trong CV (đặc biệt nếu so với tiêu chuẩn của ngành ${targetField || "liên quan"}).
   - Gợi ý cách khắc phục cụ thể để hồ sơ ấn tượng hơn.

3. 🚀 **Gợi ý Dự án & Lộ trình (Recommended Projects)**
   - Đề xuất 3-5 ý tưởng dự án cá nhân (Side Projects) cụ thể giúp ứng viên ghi điểm trong mắt nhà tuyển dụng ${targetField ? `lĩnh vực ${targetField}` : ""}.
   - Gợi ý các từ khóa, công nghệ (Tech Stack) hoặc khóa học ngắn nên tìm hiểu thêm.

4. 💼 **Công việc Phù hợp (Suitable Jobs)**
   - Đề xuất 5-7 vị trí công việc cụ thể phù hợp với năng lực hiện tại.
   - Giải thích ngắn gọn lý do tại sao họ phù hợp.

---
Nội dung Hồ sơ/CV:
${cvText}
---
`;

    console.log("🔄 Đang gọi Gemini API...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response || !response.text) {
      throw new Error("API trả về response trống");
    }

    console.log("✅ Phân tích thành công");
    return response.text;
    
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);
    
    // Xử lý các lỗi cụ thể
    if (error.message?.includes("API key")) {
      throw new Error("❌ API key không hợp lệ hoặc hết hạn. Vui lòng kiểm tra lại.");
    }
    
    if (error.message?.includes("401")) {
      throw new Error("❌ Không được phép (401). API key có thể bị lỗi hoặc hết hạn.");
    }

    if (error.message?.includes("429")) {
      throw new Error("❌ Quá nhiều yêu cầu. Vui lòng chờ vài giây rồi thử lại.");
    }

    throw new Error(`❌ Lỗi AI: ${error.message || "Không xác định được lỗi"}`);
  }
};

export const suggestExploration = async (interests: string[]): Promise<string> => {
  if (!API_KEY) {
    throw new Error("❌ API key chưa được cấu hình.");
  }

  if (!ai) {
    throw new Error("❌ Lỗi khởi tạo AI service.");
  }

  try {
    const prompt = `
Tôi là sinh viên và chưa có định hướng rõ ràng, nhưng tôi có quan tâm đến các lĩnh vực sau: ${interests.join(", ")}.

Hãy đóng vai người cố vấn (Mentor), đưa ra lời khuyên ngắn gọn bằng Tiếng Việt:
1. **Tổng quan**: Những lĩnh vực này làm gì, cơ hội nghề nghiệp ra sao.
2. **Dự án nhập môn**: Đề xuất 3 dự án nhỏ (mini-projects) hoặc chủ đề cụ thể để tôi làm thử xem có hợp không.
3. **Khóa học/Kỹ năng**: Nên bắt đầu học từ khóa nào (keywords) hoặc công cụ gì.

Trả lời định dạng Markdown, thân thiện, khích lệ.
`;
    
    console.log("🔄 Đang gợi ý lộ trình...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response || !response.text) {
      throw new Error("API trả về response trống");
    }

    console.log("✅ Gợi ý thành công");
    return response.text;
    
  } catch (error: any) {
    console.error("❌ Gemini API Error (Exploration):", error);
    throw new Error(`❌ Lỗi gợi ý: ${error.message || "Không xác định được lỗi"}`);
  }
};
