
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  UserRound,
  Calendar,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { localDay, type Profile } from "@/lib/kalolab";

type Message = {
  text: string;
  user: boolean;
  image?: string;
};

const FAQ = [
  "Buổi sáng tôi nên ăn gì?",
  "Tôi nên ăn loại rau nào tốt nhất?",
  "Nên chọn thịt bò hay thịt lợn?",
  "Một ngày tôi cần bao nhiêu calo?",
  "Làm sao để giảm cân lành mạnh?",
  "Ăn gì để tăng cơ hiệu quả?",
];

const INITIAL_AI: Message[] = [
  {
    text:
      "Xin chào! Mình là Kalolab AI 🌱\n\n" +
      "Mình có thể đồng hành cùng bạn trong hành trình ăn uống và sống khỏe:\n\n" +
      "🥗 Gợi ý thực đơn theo mục tiêu.\n" +
      "🔥 Tính toán calo và hàm lượng dinh dưỡng.\n" +
      "📸 Phân tích ảnh bữa ăn của bạn.\n" +
      "💪 Tư vấn giảm cân, tăng cơ và ăn uống cân bằng.\n\n" +
      "Bạn muốn bắt đầu từ đâu hôm nay?",
    user: false,
  },
];

export function Chat({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("AI Kalolab");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [ai, setAi] = useState<Message[]>(INITIAL_AI);

  const [expert, setExpert] = useState<Message[]>([
    {
      text:
        "Chào bạn! Đây là cuộc trò chuyện minh họa với chuyên gia dinh dưỡng. " +
        "Bạn muốn trao đổi về mục tiêu nào?",
      user: false,
    },
  ]);

  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const list = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    list.current?.scrollTo({
      top: list.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ai, expert, tab, open, loading]);

  // Chuyển ảnh thành Base64 để gửi lên API
  function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Không thể đọc ảnh."));
        }
      };

      reader.onerror = () => reject(new Error("Lỗi đọc ảnh."));
      reader.readAsDataURL(file);
    });
  }

  function handleImage(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một hình ảnh.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 8MB.");
      return;
    }

    setImage(file);

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview("");

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  // Gửi tin nhắn tới OpenAI thông qua máy chủ bảo mật
  async function send() {
    if (loading) return;

    const parsed = z.string().trim().max(1000).safeParse(input);
    if (!parsed.success) return;

    const message = parsed.data;
    const currentImage = image;

    if (!message && !currentImage) return;

    // Chế độ chuyên gia giữ nguyên chức năng cũ
    if (tab === "Chuyên gia") {
      setExpert((prev) => [
        ...prev,
        {
          text: message || "Đã gửi một hình ảnh.",
          user: true,
        },
        {
          text:
            "Cảm ơn bạn đã chia sẻ. Đây hiện là khu vực trò chuyện minh họa, " +
            "chưa kết nối chuyên gia thật. Bạn có thể đặt lịch tư vấn 1–1.",
          user: false,
        },
      ]);

      setInput("");
      removeImage();
      return;
    }

    let imageData: string | undefined;

    try {
      setLoading(true);

      if (currentImage) {
        imageData = await readImage(currentImage);
      }

      const userMessage: Message = {
        text: message || "Hãy phân tích bữa ăn trong ảnh này.",
        user: true,
        image: imageData,
      };

      const updatedMessages = [...ai, userMessage];

      setAi(updatedMessages);
      setInput("");
      removeImage();

      const response = await fetch("/api/kalolab-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-15).map((m) => ({
            role: m.user ? "user" : "assistant",
            text: m.text,
          })),
          image: imageData || null,
          profile: profile
            ? {
                // Chỉ bổ sung thông tin hồ sơ nếu bạn đã xác định
                // rõ các trường không nhạy cảm trong Profile.
              }
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Máy chủ AI đang gặp sự cố."
        );
      }

      const data = await response.json();

      if (!data.reply || typeof data.reply !== "string") {
        throw new Error("AI chưa trả về nội dung hợp lệ.");
      }

      setAi((prev) => [
        ...prev,
        {
          text: data.reply,
          user: false,
        },
      ]);
    } catch (error) {
      console.error("Kalolab AI error:", error);

      setAi((prev) => [
        ...prev,
        {
          text:
            "Xin lỗi bạn, mình đang gặp sự cố kết nối. 🌱\n\n" +
            "Tin nhắn của bạn chưa được xử lý thành công. " +
            "Bạn hãy thử gửi lại sau ít giây nhé!",
          user: false,
        },
      ]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể kết nối với AI."
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseFAQ(question: string) {
    setInput(question);
  }

  return (
    <>
      <Button
        className="chat-fab"
        aria-label={open ? "Đóng trò chuyện" : "Chat với Kalolab"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <MessageCircle />}
        <span className="chat-dot" />
      </Button>

      {open && (
        <section
          className="chat-panel"
          aria-label="Trò chuyện Kalolab"
        >
          <div className="chat-header">
            <div>
              <h3>Kalolab luôn ở đây 🌱</h3>
              <small>
                {tab === "AI Kalolab"
                  ? "Trợ lý dinh dưỡng AI thông minh"
                  : "Kết nối chuyên gia dinh dưỡng"}
              </small>
            </div>

            <Button
              size="icon"
              variant="ghost"
              aria-label="Đóng khung chat"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          </div>

          <div className="chat-tabs">
            {["AI Kalolab", "Chuyên gia"].map((t) => (
              <Button
                key={t}
                variant={tab === t ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab(t)}
              >
                {t === "AI Kalolab" ? (
                  <Sparkles />
                ) : (
                  <UserRound />
                )}
                {t}
              </Button>
            ))}
          </div>

          {tab === "Chuyên gia" && (
            <div className="expert-profile">
              <div className="avatar">
                <UserRound />
              </div>
              <div>
                <strong>ThS. Ngọc Anh</strong>
                <small>
                  Chuyên gia dinh dưỡng · Hồ sơ minh họa
                </small>
                <small className="text-primary">
                  Trực tuyến (mô phỏng)
                </small>
              </div>
            </div>
          )}

          <div className="chat-messages" ref={list}>
            {(tab === "AI Kalolab" ? ai : expert).map((m, i) => (
              <div
                key={i}
                className={`chat-message ${m.user ? "user" : ""}`}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt="Ảnh bữa ăn"
                    style={{
                      maxWidth: "220px",
                      width: "100%",
                      borderRadius: "12px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  />
                )}
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {m.text}
                </p>
              </div>
            ))}

            {tab === "AI Kalolab" && ai.length === 1 && (
              <div className="faq-suggestions">
                <small>Gợi ý câu hỏi cho bạn</small>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FAQ.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="faq-chip"
                      onClick={() => chooseFAQ(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "AI Kalolab" && loading && (
              <div className="chat-message">
                <LoaderCircle
                  className="animate-spin inline-block mr-2"
                  size={16}
                />
                Kalolab đang phân tích và suy nghĩ...
              </div>
            )}
          </div>

          {tab === "Chuyên gia" && (
            <Button
              className="mx-3 mb-2"
              variant="outline"
              size="sm"
              onClick={() => setBooking(true)}
            >
              <Calendar />
              Đặt lịch tư vấn 1–1
            </Button>
          )}

          {tab === "AI Kalolab" && imagePreview && (
            <div className="px-3 py-2 flex items-center gap-2">
              <img
                src={imagePreview}
                alt="Ảnh chuẩn bị gửi"
                style={{
                  width: "75px",
                  height: "75px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
              <span className="text-sm flex-1">
                Ảnh bữa ăn đã sẵn sàng
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeImage}
                aria-label="Xóa ảnh"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          )}

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            {tab === "AI Kalolab" && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  hidden
                  onChange={(e) =>
                    handleImage(e.target.files?.[0])
                  }
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Chụp ảnh hoặc chọn ảnh bữa ăn"
                  onClick={() => fileInput.current?.click()}
                  disabled={loading}
                >
                  <ImagePlus />
                </Button>
              </>
            )}

            <input
              className="form-input"
              aria-label="Tin nhắn"
              placeholder={
                tab === "AI Kalolab"
                  ? "Hỏi về dinh dưỡng hoặc gửi ảnh bữa ăn..."
                  : "Nhắn tin cho chuyên gia..."
              }
              maxLength={1000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <Button
              type="submit"
              size="icon"
              aria-label="Gửi tin nhắn"
              disabled={loading || (!input.trim() && !image)}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Send />
              )}
            </Button>
          </form>
        </section>
      )}

      <Dialog open={booking} onOpenChange={setBooking}>
        <DialogContent className="modal-scroll">
          <DialogTitle className="modal-title">
            Lịch tư vấn dinh dưỡng
          </DialogTitle>

          <DialogDescription>
            Chọn lịch để trải nghiệm đặt hẹn. Chưa gửi đến chuyên gia thật.
          </DialogDescription>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();

              if (date < localDay()) {
                toast.error(
                  "Vui lòng chọn hôm nay hoặc ngày tới."
                );
                return;
              }

              toast.success(
                `Đã ghi nhận lịch thử nghiệm: ${date} lúc ${time}.`
              );

              setBooking(false);
            }}
          >
            <label className="form-field">
              <span>Ngày tư vấn</span>
              <input
                type="date"
                className="form-input"
                required
                min={localDay()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Khung giờ</span>
              <select
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {["09:00", "10:00", "14:00", "15:00", "16:00"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  )
                )}
              </select>
            </label>

            <Button type="submit" className="w-full">
              Xác nhận lịch thử nghiệm
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}   
{tab === "Chuyên gia" && (
  <div className="expert-contact-card mx-3 my-3 rounded-xl border p-4">
    <div className="expert-profile flex items-center gap-3">
      <div className="avatar overflow-hidden rounded-full">
        <img
          src="/expert-thien.jpg"
          alt="Chuyên Gia Thiện"
          className="h-full w-full rounded-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-1">
        <strong>Chuyên Gia Thiện</strong>
        <small>Chuyên gia tư vấn dinh dưỡng</small>
        <small className="text-primary">
          Liên hệ trực tiếp qua mạng xã hội
        </small>
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-3">
      <a
        href="https://www.facebook.com/share/1ChHnMkdn5/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white"
      >
        Nhắn tin với Chuyên Gia Thiện qua Facebook
      </a>

      <a
        href="https://www.instagram.com/tskc._vwnthjn?fqnt=MXF2YzcwNjNoYzVlag%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium"
      >
        Liên hệ qua Instagram
      </a>
    </div>

    <p className="mt-3 text-center text-sm text-muted-foreground">
      Hãy kết nối với Chuyên Gia Thiện để được hỗ trợ và tư vấn.
    </p>
  </div>
)}

{tab === "AI Kalolab" && (
  <>
    <div className="chat-messages" ref={list}>
      {ai.map((m, i) => (
        <p
          key={i}
          className={`chat-message ${m.user ? "user" : ""}`}
        >
          {m.text}
        </p>
      ))}
    </div>

    <form
      className="chat-input"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <input
        className="form-input"
        aria-label="Tin nhắn"
        placeholder="Nhắn Kalolab một chút…"
        maxLength={1000}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Button type="submit" size="icon" aria-label="Gửi tin nhắn">
        <Send />
      </Button>
    </form>
  </>
)}
