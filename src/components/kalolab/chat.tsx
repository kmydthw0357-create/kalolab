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
  ImagePlus,
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
import {
  chatReply,
  localDay,
  askKalolabAI,
  type Profile,
  type KalolabNutrition,
} from "@/lib/kalolab";

type TabType = "ai" | "expert";

type Message = {
  id: string;
  text: string;
  role: "user" | "assistant";
  time: string;
  image?: string;
  nutrition?: KalolabNutrition;
};

const messageSchema = z
  .string()
  .trim()
  .max(1000, "Tin nhắn tối đa 1000 ký tự");

const bookingSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày tư vấn"),
  time: z.string().min(1, "Vui lòng chọn khung giờ"),
  note: z.string().max(300).optional(),
});

const QUICK_PROMPTS = [
  "Gợi ý thực đơn hôm nay",
  "Bữa tối dưới 500 kcal",
  "Trời mưa thèm ăn ngon mà sợ béo",
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

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.readAsDataURL(file);
  });
}

const INITIAL_AI_MESSAGES: Message[] = [
  {
    id: "ai-welcome",
    text: "Chào bạn, mình là trợ lý AI Kalolab 🌱 Hôm nay bạn muốn ăn gì hay có chuyện gì cần tâm sự về ăn uống? Cứ hỏi thoải mái hoặc gửi ảnh bữa ăn để mình xem giúp nhé!",
    role: "assistant",
    time: nowTime(),
  },
];

const INITIAL_EXPERT_MESSAGES: Message[] = [
  {
    id: "expert-welcome",
    text: "Chào bạn! Bạn có thể liên hệ trực tiếp Chuyên Gia Thiện qua Facebook/Instagram bên trên hoặc bấm Đặt lịch để hẹn tư vấn 1-1.",
    role: "assistant",
    time: nowTime(),
  },
];

interface ChatProps {
  profile: Profile | null;
  apiEndpoint?: string;
}

export function Chat({ profile, apiEndpoint }: ChatProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("ai");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleSelectImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB nhé");
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setSelectedImage(dataUrl);
    } catch {
      toast.error("Không đọc được ảnh, bạn thử chọn lại nhé");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function sendMessage(rawText?: string) {
    if (loading) return;

    const textToSend = (rawText ?? input).trim();
    const imageToSend = tab === "ai" ? selectedImage : null;

    if (!textToSend && !imageToSend) {
      toast.error("Vui lòng nhập tin nhắn hoặc chọn ảnh bữa ăn");
      return;
    }

    const parsed = messageSchema.safeParse(textToSend);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Tin nhắn không hợp lệ");
      return;
    }

    const activeTab = tab;
    const setter = activeTab === "ai" ? setAiMessages : setExpertMessages;

    const userMsg: Message = {
      id: createId(),
      text: parsed.data || "Phân tích bữa ăn trong ảnh này giúp mình nhé.",
      role: "user",
      time: nowTime(),
      image: imageToSend ?? undefined,
    };

    const historySnapshot = aiMessages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setter((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      let replyText: string;
      let nutritionInfo: KalolabNutrition | undefined;

      if (activeTab === "ai") {
        try {
          const aiResult = await askKalolabAI({
            message: parsed.data,
            image: imageToSend,
            profile,
            history: historySnapshot,
            apiEndpoint,
          });
          replyText = aiResult.reply;
          nutritionInfo = aiResult.nutrition;
                } catch (err) {
          console.warn("[Kalolab AI fallback]", err);
          const errMsg = err instanceof Error ? err.message : "Lỗi kết nối AI";
          toast.error(`AI tạm chuyển chế độ offline: ${errMsg}`);
          replyText = chatReply(parsed.data, profile);
        }
          await new Promise((resolve) => setTimeout(resolve, 350));
          replyText = chatReply(
            parsed.data || "Phân tích dinh dưỡng bữa ăn",
            profile
          );
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400));
        replyText =
          "Cảm ơn bạn đã chia sẻ. Bạn có thể bấm nút Facebook/Instagram của Chuyên Gia Thiện phía trên hoặc chọn \"Đặt lịch\" để hẹn tư vấn 1-1 nhé.";
      }

      const botMsg: Message = {
        id: createId(),
        text: replyText,
        role: "assistant",
        time: nowTime(),
        nutrition: nutritionInfo,
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
      setSelectedImage(null);
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
        text: `Đã ghi nhận yêu cầu đặt lịch tư vấn với Chuyên Gia Thiện vào ${parsed.data.time} ngày ${parsed.data.date}${
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
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
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
            {/* Thẻ liên hệ Chuyên Gia Thiện */}
            {tab === "expert" && (
              <div className="rounded-xl border bg-card p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img
                      src="/expert-thien.jpg"
                      alt="Chuyên Gia Thiện"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-sm">Chuyên Gia Thiện</strong>
                    <small className="text-xs text-muted-foreground">
                      Chuyên gia tư vấn dinh dưỡng
                    </small>
                    <small className="text-xs font-medium text-primary">
                      Liên hệ trực tiếp qua mạng xã hội
                    </small>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="https://www.facebook.com/share/1ChHnMkdn5/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Nhắn tin với Chuyên Gia Thiện qua Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/tskc._vwnthjn?fqnt=MXF2YzcwNjNoYzVlag%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    Liên hệ qua Instagram
                  </a>
                </div>
              </div>
            )}

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
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Ảnh bữa ăn"
                        className="mb-2 max-h-44 w-full rounded-xl object-cover"
                      />
                    )}
                    {msg.text}

                    {msg.nutrition && (
                      <div className="mt-2.5 rounded-xl border bg-background p-2.5 text-xs text-foreground">
                        <div className="flex items-center justify-between gap-2 font-semibold">
                          <span>{msg.nutrition.foodName}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                            {msg.nutrition.calories} kcal
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {msg.nutrition.servingSize} ·{" "}
                          {msg.nutrition.healthScore}
                        </p>
                        <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[11px]">
                          <div className="rounded bg-muted/60 py-1">
                            <div className="font-semibold">
                              {msg.nutrition.protein}g
                            </div>
                            <div className="text-muted-foreground">Đạm</div>
                          </div>
                          <div className="rounded bg-muted/60 py-1">
                            <div className="font-semibold">
                              {msg.nutrition.carbs}g
                            </div>
                            <div className="text-muted-foreground">Bột</div>
                          </div>
                          <div className="rounded bg-muted/60 py-1">
                            <div className="font-semibold">
                              {msg.nutrition.fat}g
                            </div>
                            <div className="text-muted-foreground">Béo</div>
                          </div>
                          <div className="rounded bg-muted/60 py-1">
                            <div className="font-semibold">
                              {msg.nutrition.fiber}g
                            </div>
                            <div className="text-muted-foreground">Xơ</div>
                          </div>
                        </div>
                        {msg.nutrition.advice && (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            💡 {msg.nutrition.advice}
                          </p>
                        )}
                      </div>
                    )}
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

          {/* Xem trước ảnh bữa ăn đã chọn */}
          {tab === "ai" && selectedImage && (
            <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
              <img
                src={selectedImage}
                alt="Ảnh chuẩn bị gửi"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="flex-1 text-xs text-muted-foreground">
                Ảnh bữa ăn đã sẵn sàng phân tích
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedImage(null)}
                aria-label="Xóa ảnh"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t bg-background p-3"
          >
            {tab === "ai" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => void handleSelectImage(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Gửi ảnh bữa ăn"
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </>
            )}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={1000}
              placeholder={
                tab === "ai"
                  ? "Hỏi bất cứ gì hoặc gửi ảnh bữa ăn..."
                  : "Nhắn tin cho chuyên gia..."
              }
              className="flex-1 rounded-full border bg-muted/40 px-3.5 py-2 text-sm outline-none focus:border-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || (!input.trim() && !selectedImage)}
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
            Chọn ngày và khung giờ phù hợp để trao đổi 1-1 với Chuyên Gia Thiện.
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
