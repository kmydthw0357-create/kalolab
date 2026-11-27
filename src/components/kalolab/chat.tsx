import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, UserRound, Calendar } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { chatReply, localDay, type Profile } from "@/lib/kalolab";
type Message = { text: string; user: boolean };
export function Chat({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("AI Kalolab");
  const [input, setInput] = useState("");
  const [ai, setAi] = useState<Message[]>([
    {
      text: "Chào bạn, mình là Kalolab 🌱 Hôm nay bạn muốn ăn gì? Mình có thể gợi ý món và dinh dưỡng theo mục tiêu của bạn.",
      user: false,
    },
  ]);
  const [expert, setExpert] = useState<Message[]>([
    {
      text: "Chào bạn! Đây là cuộc trò chuyện minh họa với chuyên gia dinh dưỡng. Bạn muốn trao đổi về mục tiêu nào?",
      user: false,
    },
  ]);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [ai, expert, tab, open]);
  function send() {
    const parsed = z.string().trim().min(1).max(1000).safeParse(input);
    if (!parsed.success) return;
    const reply =
      tab === "AI Kalolab"
        ? chatReply(parsed.data, profile)
        : "Cảm ơn bạn đã chia sẻ. Hãy chuẩn bị mục tiêu, chế độ ăn hiện tại và thông tin sức khỏe để trao đổi trong buổi tư vấn. Phản hồi này là minh họa, chưa kết nối chuyên gia thật.";
    const setter = tab === "AI Kalolab" ? setAi : setExpert;
    setter((m) => [...m, { text: parsed.data, user: true }, { text: reply, user: false }]);
    setInput("");
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
        <section className="chat-panel" aria-label="Trò chuyện Kalolab">
          <div className="chat-header">
            <div>
              <h3>Kalolab luôn ở đây</h3>
              <small>Ăn lành, sống khỏe cùng bạn</small>
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
                {t === "AI Kalolab" ? <Sparkles /> : <UserRound />}
                {t}
              </Button>
            ))}
          </div>
    
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
