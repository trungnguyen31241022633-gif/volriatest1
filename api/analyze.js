// api/analyze.js
import { GoogleGenAI } from "@google/genai";

// Lấy tất cả API keys từ environment variables
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4
].filter(Boolean); // Lọc bỏ các giá trị undefined/null

console.log(`✅ Loaded ${API_KEYS.length} API keys`);

if (API_KEYS.length === 0) {
  console.error("❌ No API keys found in environment variables");
}

// Biến đếm để xoay vòng keys
let currentKeyIndex = 0;

// Hàm lấy API key theo vòng quay
const getNextApiKey = () => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

// Hàm thử gọi API với retry logic
const callGeminiWithRetry = async (prompt, modelName = 'gemini-2.5-flash') => {
  let lastError = null;
  const maxRetries = API_KEYS.length; // Thử tất cả keys một lần

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getNextApiKey();
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries} - Using key index: ${currentKeyIndex === 0 ? API_KEYS.length : currentKeyIndex}`);
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      if (response && response.text) {
        console.log(`✅ Success with key index: ${currentKeyIndex === 0 ? API_KEYS.length : currentKeyIndex}`);
        return response.text;
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Key ${currentKeyIndex === 0 ? API_KEYS.length : currentKeyIndex} failed:`, error.message);
      
      // Nếu lỗi không phải do rate limit, dừng ngay
      if (!error.message.includes('429') && !error.message.includes('quota')) {
        throw error;
      }
      
      // Chờ 1 giây trước khi thử key tiếp theo
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Nếu tất cả keys đều fail
  throw new Error(`All API keys exhausted. Last error: ${lastError?.message || 'Unknown error'}`);
};

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (API_KEYS.length === 0) {
    return res.status(500).json({ 
      error: '❌ AI service không được khởi tạo. Kiểm tra GEMINI_API_KEY trong Vercel Environment Variables.' 
    });
  }

  try {
    const { cvText, targetField, type } = req.body;

    if (!cvText) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    let prompt = '';

    if (type === 'analyze') {
      const targetContext = targetField 
        ? `\n\n📢 **LƯU Ý QUAN TRỌNG**: Ứng viên này đang mong muốn phát triển sự nghiệp theo hướng: **"${targetField}"**. Hãy tập trung đánh giá sự phù hợp của hồ sơ với hướng đi này.` 
        : "";

      prompt = `
Bạn là một chuyên gia tư vấn nghề nghiệp và tuyển dụng (HR Specialist). Hãy phân tích hồ sơ năng lực (CV) sau đây và đưa ra nhận xét chi tiết bằng **Tiếng Việt**.

${targetContext}

Nhiệm vụ của bạn là cung cấp một báo cáo gồm 4 phần chính, sử dụng định dạng Markdown:

1. 🌟 **Điểm mạnh (Strengths)**
   - Liệt kê 5-7 điểm mạnh nổi bật nhất về kỹ năng, kinh nghiệm hoặc tư duy của ứng viên.
   ${targetField ? `- Đánh giá xem những điểm mạnh này có hỗ trợ tốt cho mục tiêu "${targetField}" hay không.` : ""}

2. 📉 **Điểm yếu & Cải thiện (Weaknesses)**
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
    } else if (type === 'explore') {
      const interests = cvText;
      prompt = `
Tôi là sinh viên và chưa có định hướng rõ ràng, nhưng tôi có quan tâm đến các lĩnh vực sau: ${interests.join(", ")}.

Hãy đóng vai người cố vấn (Mentor), đưa ra lời khuyên ngắn gọn bằng Tiếng Việt:
1. **Tổng quan**: Những lĩnh vực này làm gì, cơ hội nghề nghiệp ra sao.
2. **Dự án nhập môn**: Đề xuất 3 dự án nhỏ (mini-projects) hoặc chủ đề cụ thể để tôi làm thử xem có hợp không.
3. **Khóa học/Kỹ năng**: Nên bắt đầu học từ khóa nào (keywords) hoặc công cụ gì.

Trả lời định dạng Markdown, thân thiện, khích lệ.
`;
    }

    console.log("📤 Gọi Gemini API với key rotation...");

    const text = await callGeminiWithRetry(prompt);

    console.log("✅ Phân tích thành công");
    return res.status(200).json({ text });

  } catch (error) {
    console.error("❌ Backend Error:", error);

    const errorMessage = error?.message || "Không xác định được lỗi";
    
    if (errorMessage.includes("API key")) {
      return res.status(500).json({ 
        error: "❌ API key không hợp lệ hoặc hết hạn. Liên hệ quản trị viên." 
      });
    }

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return res.status(429).json({ 
        error: "❌ Tất cả API keys đã đạt giới hạn. Vui lòng thử lại sau." 
      });
    }

    return res.status(500).json({ 
      error: `Lỗi: ${errorMessage}` 
    });
  }
};
