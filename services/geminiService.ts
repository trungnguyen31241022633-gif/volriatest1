import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCV = async (cvText: string, targetField?: string): Promise<string> => {
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể phân tích CV này. Vui lòng thử lại sau.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra lại.");
  }
};

export const suggestExploration = async (interests: string[]): Promise<string> => {
  try {
    const prompt = `
Tôi là sinh viên và chưa có định hướng rõ ràng, nhưng tôi có quan tâm đến các lĩnh vực sau: ${interests.join(", ")}.

Hãy đóng vai người cố vấn (Mentor), đưa ra lời khuyên ngắn gọn bằng Tiếng Việt:
1. **Tổng quan**: Những lĩnh vực này làm gì, cơ hội nghề nghiệp ra sao.
2. **Dự án nhập môn**: Đề xuất 3 dự án nhỏ (mini-projects) hoặc chủ đề cụ thể để tôi làm thử xem có hợp không.
3. **Khóa học/Kỹ năng**: Nên bắt đầu học từ khóa nào (keywords) hoặc công cụ gì.

Trả lời định dạng Markdown, thân thiện, khích lệ.
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể đưa ra gợi ý lúc này.";
  } catch (error) {
    console.error("Gemini API Error (Exploration):", error);
    throw new Error("Có lỗi khi gọi AI tư vấn.");
  }
};
