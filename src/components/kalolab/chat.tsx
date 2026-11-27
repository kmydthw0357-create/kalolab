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
            <div className="expert-profile">
              <div className="avatar">
                <UserRound />
              </div>
              <div>
                <strong>ThS. Ngọc Anh</strong>
                <small>Chuyên gia dinh dưỡng · Hồ sơ minh họa</small>
                <small className="text-primary">Trực tuyến (mô phỏng)</small>
              </div>
            </div>
          )}
          <div className="chat-messages" ref={list}>
            {(tab === "AI Kalolab" ? ai : expert).map((m, i) => (
              <p key={i} className={`chat-message ${m.user ? "user" : ""}`}>
                {m.text}
              </p>
            ))}
          </div>
          {tab === "Chuyên gia" && (
            <Button
              className="mx-3 mb-2"
              variant="outline"
              size="sm"
              onClick={() => setBooking(true)}
            >
              <Calendar /> Đặt lịch tư vấn 1–1
            </Button>
          )}
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
        </section>
      )}
      <Dialog open={booking} onOpenChange={setBooking}>
        <DialogContent className="modal-scroll">
          <DialogTitle className="modal-title">Lịch tư vấn dinh dưỡng</DialogTitle>
          <DialogDescription>
            Chọn lịch để trải nghiệm đặt hẹn. Chưa gửi đến chuyên gia thật.
          </DialogDescription>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (date < localDay()) {
                toast.error("Vui lòng chọn hôm nay hoặc ngày tới.");
                return;
              }
              toast.success(`Đã ghi nhận lịch thử nghiệm: ${date} lúc ${time}.`);
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
              <select className="form-input" value={time} onChange={(e) => setTime(e.target.value)}>
                {["09:00", "10:00", "14:00", "15:00", "16:00"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
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
