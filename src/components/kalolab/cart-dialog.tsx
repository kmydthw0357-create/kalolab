import { useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Ticket,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  money,
  meals,
  totals,
  baseVoucher,
  profileSchema,
  type Store,
  type Profile,
  type Voucher,
  type Order,
} from "@/lib/kalolab";
export function CartDialog({
  store,
  setStore,
  profile,
  onClose,
  onLogin,
}: {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  profile: Profile | null;
  onClose: () => void;
  onLogin: () => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [payment, setPayment] = useState("Tiền mặt khi nhận hàng");
  const [delivery, setDelivery] = useState({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const total = totals(store.cart, voucher);
  function apply(c: string) {
    const v =
      c.trim().toUpperCase() === baseVoucher.code
        ? baseVoucher
        : store.vouchers.find((v) => v.code === c.trim().toUpperCase());
    if (!v) {
      toast.error("Mã giảm giá không tồn tại hoặc đã dùng.");
      return;
    }
    setVoucher(v);
    setCode(v.code);
    toast.success("Đã áp dụng " + v.label);
  }
  function quantity(key: string, delta: number) {
    setStore((s) => ({
      ...s,
      cart: s.cart
        .map((i) => (i.key === key ? { ...i, quantity: Math.min(99, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    }));
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!profile || !store.cart.length) return;
    const parsed = profileSchema
      .pick({ name: true, phone: true, address: true })
      .safeParse(delivery);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vui lòng kiểm tra thông tin.");
      return;
    }
    const next: Order = {
      id: "KL" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      items: store.cart,
      total: total.total,
      payment,
      ...parsed.data,
      gift: voucher?.kind === "juice",
    };
    setOrder(next);
    setStore((s) => ({
      ...s,
      orders: [next, ...s.orders],
      cart: [],
      vouchers: voucher ? s.vouchers.filter((v) => v.code !== voucher.code) : s.vouchers,
    }));
    setStep("done");
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="modal-scroll">
        <DialogTitle className="modal-title">
          {step === "cart"
            ? "Giỏ hàng của bạn"
            : step === "checkout"
              ? "Thông tin đặt hàng"
              : "Đã ghi nhận đơn thử nghiệm"}
        </DialogTitle>
        <DialogDescription>
          {step === "done" ? "Cảm ơn bạn đã chọn Kalolab." : "Một bữa ăn cân bằng đang chờ bạn."}
        </DialogDescription>
        {step === "done" && order ? (
          <div className="success-state">
            <CheckCircle />
            <h3>Đặt món thành công!</h3>
            <p className="text-sm">
              Mã đơn: <strong>{order.id}</strong>
            </p>
            <p className="text-primary font-semibold mt-3">{money(order.total)}</p>
            <p className="form-note my-4">
              Đơn thử nghiệm đã lưu vào lịch sử trên thiết bị này. Không có giao hàng hoặc thanh
              toán thật.
            </p>
            <Button onClick={onClose}>Tiếp tục chọn món</Button>
          </div>
        ) : !store.cart.length ? (
          <div className="empty-state">
            <ShoppingBag />
            <h3>Giỏ hàng đang trống</h3>
            <p className="text-xs mb-4">Chọn một món ngon cho bữa ăn hôm nay nhé.</p>
            <Button onClick={onClose}>Khám phá thực đơn</Button>
          </div>
        ) : (
          <>
            {step === "cart" ? (
              <>
                {store.cart.map((item) => {
                  const meal = meals.find((m) => m.id === item.mealId);
                  if (!meal) return null;
                  return (
                    <div className="cart-line" key={item.key}>
                      <img src={meal.image} alt={meal.name} />
                      <div className="min-w-0">
                        <h3>{meal.name}</h3>
                        <p>{item.options.join(" · ") || "Chế biến tiêu chuẩn"}</p>
                        <div className="quantity">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Giảm ${meal.name}`}
                            onClick={() => quantity(item.key, -1)}
                          >
                            <Minus />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Tăng ${meal.name}`}
                            disabled={item.quantity === 99}
                            onClick={() => quantity(item.key, 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="meal-price">
                          {money(
                            (meal.price +
                              (item.options.some((o) => o.startsWith("Cheatmeal")) ? 15000 : 0)) *
                              item.quantity,
                          )}
                        </span>
                        <Button
                          className="block ml-auto mt-3"
                          variant="ghost"
                          size="icon"
                          aria-label={`Xóa ${meal.name}`}
                          onClick={() =>
                            setStore((s) => ({
                              ...s,
                              cart: s.cart.filter((i) => i.key !== item.key),
                            }))
                          }
                        >
                          <Trash2 className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div>
                  <h3 className="subheading">
                    <Ticket className="inline size-4" /> Ưu đãi của bạn
                  </h3>
                  <div className="flex gap-2">
                    <input
                      className="form-input"
                      aria-label="Mã giảm giá"
                      placeholder="Nhập mã KALOLAB20"
                      maxLength={40}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={() => apply(code)}>
                      Áp dụng
                    </Button>
                  </div>
                  {store.vouchers.map((v) => (
                    <div className="voucher-ticket" key={v.code}>
                      <Ticket />
                      <div>
                        <strong>{v.label}</strong>
                        <small>{v.code}</small>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => apply(v.code)}>
                        Chọn
                      </Button>
                    </div>
                  ))}
                  {voucher && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-primary">{voucher.label}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVoucher(null);
                          setCode("");
                        }}
                      >
                        Bỏ mã
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="justify-start w-fit"
                  onClick={() => setStep("cart")}
                >
                  <ArrowLeft /> Quay lại giỏ hàng
                </Button>
                <form id="checkout-form" onSubmit={submit} className="space-y-3">
                  {(["name", "phone", "address"] as const).map((k) => (
                    <label className="form-field" key={k}>
                      <span>
                        {k === "name"
                          ? "Người nhận"
                          : k === "phone"
                            ? "Số điện thoại"
                            : "Địa chỉ giao hàng"}
                      </span>
                      <input
                        className="form-input"
                        type={k === "phone" ? "tel" : "text"}
                        required
                        maxLength={k === "address" ? 300 : 100}
                        value={delivery[k]}
                        onChange={(e) => setDelivery({ ...delivery, [k]: e.target.value })}
                      />
                    </label>
                  ))}
                  <h3 className="subheading">Phương thức thanh toán</h3>
                  {["Tiền mặt khi nhận hàng", "Chuyển khoản ngân hàng"].map((p) => (
                    <label className="choice" key={p}>
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p}
                        onChange={() => setPayment(p)}
                      />
                      {p.startsWith("Tiền") ? (
                        <Banknote className="size-4" />
                      ) : (
                        <CreditCard className="size-4" />
                      )}
                      {p}
                    </label>
                  ))}
                  {payment === "Chuyển khoản ngân hàng" && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs">
                        Ngân hàng trong hồ sơ: {profile?.bank || "Chưa cung cấp"}
                      </p>
                      <p className="text-xs">Số tài khoản: {profile?.account || "Chưa cung cấp"}</p>
                      <p className="form-note mt-2">
                        Chưa có tài khoản nhận tiền của Kalolab. Đây là lựa chọn mô phỏng; không
                        chuyển khoản thật.
                      </p>
                    </div>
                  )}
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                </form>
              </>
            )}
            <div>
              <div className="total-line">
                <span>Tạm tính</span>
                <strong>{money(total.subtotal)}</strong>
              </div>
              <div className="total-line">
                <span>Phí giao hàng</span>
                <span>{money(total.shipping)}</span>
              </div>
              {total.discount > 0 && (
                <div className="total-line text-primary">
                  <span>Giảm giá</span>
                  <span>−{money(total.discount)}</span>
                </div>
              )}
              {voucher?.kind === "juice" && (
                <p className="text-xs text-primary">+ Tặng 1 chai nước ép</p>
              )}
              <div className="total-line grand">
                <span>Tổng cộng</span>
                <span className="text-primary">{money(total.total)}</span>
              </div>
            </div>
            {step === "cart" ? (
              <Button
                key="continue"
                className="w-full"
                onClick={() => {
                  if (!profile) {
                    onLogin();
                    return;
                  }
                  setStep("checkout");
                }}
              >
                {" "}
                {profile ? "Tiến hành đặt hàng" : "Đăng nhập để đặt hàng"}
              </Button>
            ) : (
              <Button key="submit" type="submit" form="checkout-form" className="w-full">
                Xác nhận đặt hàng thử nghiệm
              </Button>
            )}
            <p className="form-note text-center">Bản trải nghiệm · Chưa tiếp nhận đơn hàng thật</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
export function OrdersDialog({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="modal-scroll">
        <DialogTitle className="modal-title">Lịch sử đơn hàng</DialogTitle>
        <DialogDescription>Các đơn thử nghiệm trên thiết bị này.</DialogDescription>
        {!orders.length ? (
          <div className="empty-state">
            <ShoppingBag />
            <h3>Chưa có đơn hàng</h3>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-entry" key={order.id}>
              <div className="flex justify-between gap-3">
                <strong>{order.id}</strong>
                <strong className="text-primary">{money(order.total)}</strong>
              </div>
              <p>{new Date(order.date).toLocaleString("vi-VN")} · Đã ghi nhận</p>
              <p>
                {order.items
                  .map((i) => `${i.quantity} × ${meals.find((m) => m.id === i.mealId)?.name}`)
                  .join(", ")}
              </p>
              <p>
                {order.name} · {order.phone} · {order.address}
              </p>
              <p>
                {order.payment}
                {order.gift ? " · Tặng 1 chai nước ép" : ""}
              </p>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
}
