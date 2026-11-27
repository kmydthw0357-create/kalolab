
import { createFileRoute } from "@tanstack/react-router";
import OpenAI from "openai";

export const Route = createFileRoute("/api/kalolab-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.OPENAI_API_KEY;

          if (!apiKey) {
            return Response.json(
              { error: "Máy chủ chưa cấu hình OpenAI API Key." },
              { status: 500 }
            );
          }

          const body = await request.json();
          const messages = body.messages;
          const image = body.image;

          if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json(
              { error: "Tin nhắn không hợp lệ." },
              { status: 400 }
            );
          }

          if (
            image &&
            (typeof image !== "string" ||
              !/^data:image\/(jpeg|png|webp);base64,/.test(image))
          ) {
            return Response.json(
              { error: "Định dạng ảnh không được hỗ trợ." },
              { status: 400 }
            );
          }

          const openai = new OpenAI({ apiKey });

          const safeMessages = messages.slice(-15);

          const input = safeMessages.map((m: any, index: number) => {
            const isLast = index === safeMessages.length - 1;
            const isUser = m.role === "user";

            if (isLast && isUser && image) {
              return {
                role: "user" as const,
                content: [
                  {
                    type: "input_text" as const,
                    text: String(m.text || "Phân tích bữa ăn này."),
                  },
                  {
                    type: "input_image" as const,
                    image_url: image,
                    detail: "high" as const,
                  },
                ],
              };
            }

            return {
              role: isUser ? "user" as const : "assistant" as const,
              content: String(m.text || "").slice(0, 4000),
            };
          });

          const result = await openai.responses.create({
            model: "gpt-4.1-mini",
            instructions: `
Bạn là Kalolab AI, trợ lý dinh dưỡng thông minh của ứng dụng Kalolab.

PHONG CÁCH:
- Trò chuyện tự nhiên, thân thiện, linh hoạt và dễ hiểu.
- Không trả lời máy móc, không lặp lại câu trả lời.
- Luôn trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.
- Giải thích rõ ràng, có cấu trúc và phù hợp với câu hỏi.
- Không tự nhận mình là bác sĩ hoặc chuyên gia y tế có giấy phép.

CHỨC NĂNG DINH DƯỠNG:
1. Đề xuất bữa sáng, trưa, tối và đồ ăn nhẹ.
2. So sánh thực phẩm như thịt bò, thịt lợn, cá, trứng, rau củ.
3. Ước tính calo, protein, carbohydrate, chất béo và chất xơ.
4. Hỗ trợ mục tiêu giảm cân, tăng cân, tăng cơ và duy trì sức khỏe.
5. Đưa ra thực đơn phù hợp với ngân sách và sở thích.
6. Giải thích lợi ích và hạn chế của các loại thực phẩm.

PHÂN TÍCH ẢNH:
- Khi người dùng gửi ảnh bữa ăn, hãy nhận diện những món ăn nhìn thấy.
- Ước tính khẩu phần dựa trên hình ảnh.
- Ước tính tổng lượng calo và các chất dinh dưỡng.
- Trình bày kết quả theo từng món và tổng bữa ăn.
- Nêu rõ đây là số liệu ước tính, không phải kết quả xét nghiệm.
- Nếu không xác định được món ăn hoặc khẩu phần, hãy hỏi thêm thay vì bịa số liệu.
- Không khẳng định chính xác khối lượng thực phẩm chỉ từ ảnh.

AN TOÀN SỨC KHỎE:
- Không chẩn đoán bệnh hoặc kê đơn thuốc.
- Không khuyến khích nhịn ăn cực đoan hay chế độ giảm cân nguy hiểm.
- Với bệnh lý, dị ứng hoặc tình trạng sức khỏe đặc biệt, khuyên người dùng tham khảo chuyên gia phù hợp.
- Không đưa ra kết luận chắc chắn khi thiếu thông tin.

CÁCH TRẢ LỜI:
- Đi thẳng vào câu hỏi.
- Có thể dùng bảng, danh sách và biểu tượng phù hợp.
- Đưa ra lời khuyên thực tế, dễ áp dụng.
- Khi thiếu thông tin, chỉ hỏi những gì thực sự cần thiết.
- Không bịa nguồn, số liệu hoặc thành phần dinh dưỡng.
            `,
            input,
            max_output_tokens: 1200,
          });

          const reply = result.output_text?.trim();

          if (!reply) {
            throw new Error("AI không tạo được câu trả lời.");
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("Kalolab API error:", error);

          return Response.json(
            {
              error: "Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
