import { useState, type Dispatch, type SetStateAction } from "react";
import { Gift, Ticket, Check, Leaf, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { prizes, localDay, checkInReward, type Store } from "@/lib/kalolab";
export function RewardsDialog({
  store,
  setStore,
  onClose,
}: {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("Điểm danh");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const today = localDay();
  const checked = store.checkins.includes(today);
  const cycle = store.checkins.length % 7;
  function checkin() {
    if (checked) return;
    setStore((s) => {
      if (s.checkins.includes(today)) return s;
      const days = [...s.checkins, today];
      const reward = checkInReward(days.length);
      return { ...s, checkins: days, vouchers: reward ? [...s.vouchers, reward] : s.vouchers };
    });
    toast.success(
      (store.checkins.length + 1) % 7 === 0 ? "Bạn nhận voucher 20.000đ!" : "Điểm danh thành công!",
    );
  }
  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult("");
    const n = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const index = n % prizes.length;
    const current = rotation % 360;
    const target = (360 - (index * 60 + 30)) % 360;
    setRotation(rotation + 1800 + ((target - current + 360) % 360));
    setTimeout(() => {
      const prize = prizes[index];
      if (!prize) {
        setSpinning(false);
        return;
      }
      setResult(prize.label);
      if (prize.value > 0 || prize.kind === "shipping" || prize.kind === "juice") {
        setStore((s) => ({
          ...s,
          vouchers: [
            ...s.vouchers,
            { ...prize, code: "KL" + crypto.randomUUID().slice(0, 8).toUpperCase() },
          ],
        }));
        toast.success("Quà đã được thêm vào ví voucher!");
      }
      setSpinning(false);
    }, 4100);
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !spinning) onClose();
      }}
    >
      <DialogContent className="modal-scroll">
        <DialogTitle className="modal-title">Một chút may mắn, một ngày khỏe hơn</DialogTitle>
        <DialogDescription>Quà tặng thử nghiệm dành cho hành trình ăn lành.</DialogDescription>
        <div className="grid grid-cols-3 gap-2">
          {["Điểm danh", "Vòng quay", "Ví voucher"].map((t) => (
            <Button
              size="sm"
              key={t}
              variant={tab === t ? "default" : "outline"}
              disabled={spinning}
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>
        {tab === "Điểm danh" ? (
          <div>
            <h3 className="subheading">
              <CalendarCheck className="inline size-4" /> 7 ngày ăn lành
            </h3>
            <p className="form-note">
              Mỗi ngày điểm danh một lần. Tích lũy đủ 7 ngày nhận voucher 20.000đ; không yêu cầu
              liên tiếp.
            </p>
            <div className="checkin-grid">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div
                  key={n}
                  className={`checkin-day ${n <= cycle || (cycle === 0 && store.checkins.length > 0) ? "checked" : ""}`}
                >
                  <span>Ngày {n}</span>
                  {n === 7 ? <Gift /> : n <= cycle ? <Check /> : <Leaf />}
                  <span>{n === 7 ? "20.000đ" : "+1 ngày"}</span>
                </div>
              ))}
            </div>
            <p className="form-note mb-4">Đã điểm danh: {store.checkins.length} ngày</p>
            <Button disabled={checked} className="w-full" onClick={checkin}>
              <Check />
              {checked ? "Hôm nay đã điểm danh" : "Điểm danh hôm nay"}
            </Button>
          </div>
        ) : tab === "Vòng quay" ? (
          <div className="text-center">
            <div className="wheel-wrap">
              <div className="wheel-pointer" />
              <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                {["10K", "20K", "50K", "Freeship", "Nước ép", "Lần sau"].map((t, i) => (
                  <span key={t} style={{ transform: `rotate(${i * 60 + 30}deg)` }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="wheel-center">
                <Leaf />
              </div>
            </div>
            <Button onClick={spin} disabled={spinning}>
              <Gift />
              {spinning ? "Đang quay…" : "Quay may mắn"}
            </Button>
            {result && (
              <p className="text-primary font-semibold mt-4" role="status">
                {result}
              </p>
            )}
            <p className="form-note mt-4">
              Mỗi ô có cơ hội bằng nhau. Quà chỉ có giá trị trong bản chạy thử.
            </p>
          </div>
        ) : (
          <div>
            {!store.vouchers.length ? (
              <div className="empty-state">
                <Ticket />
                <h3>Ví voucher đang trống</h3>
                <p className="text-xs">Điểm danh hoặc quay để nhận quà nhé!</p>
              </div>
            ) : (
              store.vouchers.map((v) => (
                <div className="voucher-ticket" key={v.code}>
                  <Ticket />
                  <div>
                    <strong>{v.label}</strong>
                    <small>{v.code}</small>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Sao chép ${v.code}`}
                    onClick={() => {
                      navigator.clipboard
                        .writeText(v.code)
                        .then(() => toast.success("Đã sao chép mã."))
                        .catch(() => toast.info(v.code));
                    }}
                  >
                    <Ticket />
                  </Button>
                </div>
              ))
            )}
            <p className="form-note">Bạn cũng có thể dùng KALOLAB20 để giảm 20% tại giỏ hàng.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
