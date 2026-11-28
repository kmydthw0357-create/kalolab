import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  UserRound,
  Calendar,
  RotateCcw,
  Loader2,
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
import { chatReply, localDay, type Profile } from "@/lib/kalolab";

type TabType = "ai" | "expert";

type Message = {
  id: string;
  text: string;
  role: "user" | "assistant";
  time: string;
};

const messageSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập nội dung tin nhắn")
  .max(1000, "Tin nhắn tối đa 1000 ký tự");

const bookingSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày tư vấn"),
  time: z.string().min(1, "Vui lòng chọn khung giờ"),
  note: z.string().max(300).optional(),
});

const QUICK_PROMPTS = [
  "Gợi ý thực đơn hôm nay",
  "Bữa tối dưới 500 kcal",
  "Đồ ăn vặt lành mạnh",
  "Cách tăng lượng đạm",
];

const TIME_SLOTS = ["09:00", "10:30", "14:00", "16:00", "19:30"];

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const INITIAL_AI_MESSAGES: Message[] = [
  {
    id: "ai-welcome",
    text: "Chào bạn, mình là trợ lý AI Kalolab 🌱 Hôm nay bạn muốn ăn gì? Mình có thể gợi ý món ăn, tính calo hoặc điều chỉnh dinh dưỡng theo hồ sơ của bạn.",
    role: "assistant",
    time: nowTime(),
  },
];

const INITIAL_EXPERT_MESSAGES: Message[] = [
  {
    id: "expert-welcome",
    text: "Chào bạn! Bạn có thể để lại câu hỏi hoặc đặt lịch tư vấn trực tiếp 1-1 với chuyên gia dinh dưỡng Kalolab.",
    role: "assistant",
    time: nowTime(),
  },
];

/**
 * Gọi API AI thật (nếu bạn đã cấu hình endpoint /api/chat),
 * nếu chưa có backend sẽ tự động fallback về hàm chatReply() cục bộ.
 */
async function fetchAIReply(
  prompt: string,
  history: Message[],
  profile: Profile | null,
  apiEndpoint?: string
): Promise<string> {
  if (apiEndpoint) {
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          profile,
          history: history.slice(-6).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (typeof data.reply === "string" && data.reply.trim()) {
        return data.reply;
      }
    } catch {
      // Fallback sang logic local nếu gọi API lỗi
    }
  }

  // Tạo độ trễ tự nhiên cho trải nghiệm chat AI
  await new Promise((resolve) => setTimeout(resolve, 450));
  return chatReply(prompt, profile);
}

interface ChatProps {
  profile: Profile | null;
  /** Truyền URL backend AI nếu muốn dùng LLM thật (VD: "/api/chat") */
  apiEndpoint?: string;
}

export function Chat({ profile, apiEndpoint }: ChatProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("ai");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [aiMessages, setAiMessages] = useState<Message[]>(INITIAL_AI_MESSAGES);
  const [expertMessages, setExpertMessages] = useState<Message[]>(
    INITIAL_EXPERT_MESSAGES
  );

  // State đặt lịch chuyên gia
  const [bookingOpen, setBookingOpen] = useState(false);
  const [date, setDate] = useState(() => localDay());
  const [time, setTime] = useState("09:00");
  const [note, setNote] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMessages = tab === "ai" ? aiMessages : expertMessages;

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [aiMessages, expertMessages, tab, open, loading]);

  // Tự động focus ô nhập khi mở khung chat
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, tab]);

  async function sendMessage(rawText?: string) {
    if (loading) return;

    const textToSend = rawText ?? input;
    const parsed = messageSchema.safeParse(textToSend);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Tin nhắn không hợp lệ");
      return;
    }

    const userMsg: Message = {
      id: createId(),
      text: parsed.data,
      role: "user",
      time: nowTime(),
    };

    const activeTab = tab;
    const setter = activeTab === "ai" ? setAiMessages : setExpertMessages;

    setter((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let replyText: string;

      if (activeTab === "ai") {
        replyText = await fetchAIReply(
          parsed.data,
          aiMessages,
          profile,
          apiEndpoint
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
        replyText =
          "Cảm ơn bạn đã chia sẻ. Hãy bấm nút \"Đặt lịch\" phía trên để chọn khung giờ phù hợp và chuẩn bị thông tin mục tiêu sức khỏe cho buổi tư vấn nhé.";
      }

      const botMsg: Message = {
        id: createId(),
        text: replyText,
        role: "assistant",
        time: nowTime(),
      };

      setter((prev) => [...prev, botMsg]);
    } catch {
      toast.error("Không thể phản hồi lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage();
  }

  function handleReset() {
    if (tab === "ai") {
      setAiMessages([
        {
          ...INITIAL_AI_MESSAGES[0],
          id: createId(),
          time: nowTime(),
        },
      ]);
    } else {
      setExpertMessages([
        {
          ...INITIAL_EXPERT_MESSAGES[0],
          id: createId(),
          time: nowTime(),
        },
      ]);
    }
    toast.success("Đã làm mới cuộc trò chuyện");
  }

  function handleBookingSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = bookingSchema.safeParse({ date, time, note });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ");
      return;
    }

    if (parsed.data.date < localDay()) {
      toast.error("Vui lòng chọn ngày từ hôm nay trở đi");
      return;
    }

    setBookingOpen(false);
    setExpertMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        time: nowTime(),
        text: `Đã ghi nhận yêu cầu đặt lịch tư vấn vào ${parsed.data.time} ngày ${parsed.data.date}${
          parsed.data.note ? ` (Ghi chú: ${parsed.data.note})` : ""
        }. Chuyên gia sẽ sớm liên hệ xác nhận với bạn!`,
      },
    ]);
    setNote("");
    toast.success("Đặt lịch tư vấn thành công!");
  }

  return (
    <>
      {/* Nút mở chat nổi */}
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng trò chuyện" : "Chat với Kalolab"}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        )}
      </Button>

      {/* Khung chat */}
      {open && (
        <section
          aria-label="Trò chuyện Kalolab"
          className="fixed bottom-24 right-5 z-50 flex h-[540px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                Kalolab AI Assistant
              </h3>
              <p className="text-xs opacity-85">
                {tab === "ai"
                  ? "Tư vấn dinh dưỡng thông minh 24/7"
                  : "Kết nối chuyên gia dinh dưỡng"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15"
                aria-label="Làm mới đoạn chat"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15"
                aria-label="Đóng khung chat"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thanh chuyển tab */}
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 p-2">
            <div className="flex flex-1 gap-1">
              <Button
                type="button"
                size="sm"
                variant={tab === "ai" ? "secondary" : "ghost"}
                className="flex-1 gap-1.5 text-xs"
                onClick={() => setTab("ai")}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Kalolab
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tab === "expert" ? "secondary" : "ghost"}
                className="flex-1 gap-1.5 text-xs"
                onClick={() => setTab("expert")}
              >
                <UserRound className="h-3.5 w-3.5" />
                Chuyên gia
              </Button>
            </div>

            {tab === "expert" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => setBookingOpen(true)}
              >
                <Calendar className="h-3.5 w-3.5" />
                Đặt lịch
              </Button>
            )}
          </div>

          {/* Danh sách tin nhắn */}
          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {currentMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>
                  {tab === "ai"
                    ? "Kalolab AI đang suy nghĩ..."
                    : "Đang gửi tin nhắn..."}
                </span>
              </div>
            )}
          </div>

          {/* Gợi ý nhanh cho tab AI */}
          {tab === "ai" && !loading && (
            <div className="flex gap-1.5 overflow-x-auto border-t bg-muted/20 px-3 py-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t bg-background p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={1000}
              placeholder={
                tab === "ai"
                  ? "Hỏi về món ăn, calo, dinh dưỡng..."
                  : "Nhắn tin cho chuyên gia..."
              }
              className="flex-1 rounded-full border bg-muted/40 px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      )}

      {/* Dialog đặt lịch chuyên gia */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogTitle>Đặt lịch tư vấn dinh dưỡng</DialogTitle>
          <DialogDescription>
            Chọn ngày và khung giờ phù hợp để trao đổi 1-1 với chuyên gia Kalolab.
          </DialogDescription>

          <form onSubmit={handleBookingSubmit} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="booking-date">
                Ngày tư vấn
              </label>
              <input
                id="booking-date"
                type="date"
                min={localDay()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium">Khung giờ</span>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    size="sm"
                    variant={time === slot ? "default" : "outline"}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="booking-note">
                Mục tiêu / ghi chú (không bắt buộc)
              </label>
              <textarea
                id="booking-note"
                rows={2}
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Giảm 3kg trong 1 tháng, ăn chay trường..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBookingOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Xác nhận đặt lịch</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
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
