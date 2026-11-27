import { useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import { UserRound, LogOut, HeartPulse, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  profileSchema,
  passwordHash,
  bmi,
  bmiAdvice,
  type Profile,
  type Store,
} from "@/lib/kalolab";
const blank: Profile = {
  name: "",
  phone: "",
  address: "",
  bank: "",
  account: "",
  height: 165,
  weight: 55,
  health: "Bình thường",
};
export function ProfileFields({
  value,
  onChange,
}: {
  value: Profile;
  onChange: (p: Profile) => void;
}) {
  return (
    <div className="form-grid">
      {[
        ["name", "Họ và tên", "text"],
        ["phone", "Số điện thoại", "tel"],
        ["address", "Địa chỉ giao hàng", "text"],
        ["bank", "Tên ngân hàng (không bắt buộc)", "text"],
        ["account", "Số tài khoản (không bắt buộc)", "text"],
        ["height", "Chiều cao (cm)", "number"],
        ["weight", "Cân nặng (kg)", "number"],
      ].map(([key, label, type]) => {
        if (!key) return null;
        const k = key as keyof Profile;
        return (
          <label className={`form-field ${k === "address" ? "col-span-2" : ""}`} key={key}>
            <span>{label}</span>
            <input
              className="form-input"
              type={type}
              required={!["bank", "account"].includes(key)}
              maxLength={k === "address" ? 300 : 100}
              min={k === "height" ? 80 : k === "weight" ? 20 : undefined}
              max={k === "height" ? 250 : k === "weight" ? 300 : undefined}
              value={value[k]}
              onChange={(e) =>
                onChange({
                  ...value,
                  [k]: type === "number" ? Number(e.target.value) : e.target.value,
                })
              }
            />
          </label>
        );
      })}
      <label className="form-field col-span-2">
        <span>Tình trạng sức khỏe / dị ứng</span>
        <select
          className="form-input"
          value={value.health}
          onChange={(e) => onChange({ ...value, health: e.target.value })}
        >
          {[
            "Bình thường",
            "Tiểu đường",
            "Huyết áp cao",
            "Dị ứng hải sản",
            "Đau dạ dày",
            "Khác",
          ].map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
export function AccountDialog({
  store,
  setStore,
  profile,
  onClose,
}: {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  profile: Profile | null;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">(
    store.accounts.length ? "login" : "register",
  );
  const [value, setValue] = useState(profile ?? blank);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (profile) {
      const parsed = profileSchema.safeParse(value);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Kiểm tra thông tin.");
        return;
      }
      setStore((s) => ({
        ...s,
        accounts: s.accounts.map((a) =>
          a.phone === s.session ? { ...a, profile: parsed.data } : a,
        ),
      }));
      toast.success("Đã cập nhật hồ sơ.");
      onClose();
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const result = profileSchema.safeParse(value);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "Thông tin không hợp lệ.");
          return;
        }
        if (store.accounts.some((a) => a.phone === value.phone)) {
          setError("Số điện thoại đã đăng ký. Vui lòng đăng nhập.");
          return;
        }
        const salt = crypto.randomUUID();
        const hash = await passwordHash(password, salt);
        setStore((s) => ({
          ...s,
          accounts: [...s.accounts, { phone: value.phone, hash, salt, profile: result.data }],
          session: value.phone,
        }));
      } else {
        const account = store.accounts.find((a) => a.phone === phone);
        if (!account || (await passwordHash(password, account.salt)) !== account.hash) {
          setError("Số điện thoại hoặc mật khẩu không đúng.");
          return;
        }
        setStore((s) => ({ ...s, session: phone }));
      }
      toast.success(mode === "register" ? "Chào mừng bạn đến Kalolab!" : "Đăng nhập thành công.");
      onClose();
    } catch {
      setError("Không thể lưu tài khoản trên trình duyệt này.");
    } finally {
      setBusy(false);
    }
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
          {profile ? "Hồ sơ của bạn" : "Chào mừng đến Kalolab"}
        </DialogTitle>
        <DialogDescription>Bữa ăn ngon bắt đầu từ việc hiểu cơ thể bạn.</DialogDescription>
        {!profile && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </Button>
            <Button
              variant={mode === "register" ? "default" : "outline"}
              onClick={() => setMode("register")}
            >
              Đăng ký
            </Button>
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          {profile || mode === "register" ? (
            <>
              <h3 className="subheading">
                <UserRound className="inline size-4 mr-1" /> Thông tin cá nhân
              </h3>
              <ProfileFields value={value} onChange={setValue} />
              <div className="rounded-md bg-secondary p-3">
                <HeartPulse className="inline size-4 text-primary mr-2" />
                <strong className="text-xs">BMI: {bmi(value.height, value.weight)}</strong>
                <p className="form-note mt-1">
                  {bmiAdvice(bmi(value.height, value.weight))} Chỉ mang tính tham khảo, không thay
                  thế chẩn đoán y khoa.
                </p>
              </div>
            </>
          ) : (
            <label className="form-field">
              <span>Số điện thoại</span>
              <input
                className="form-input"
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          )}
          {!profile && (
            <label className="form-field">
              <span>Mật khẩu</span>
              <input
                className="form-input"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button className="w-full" type="submit" disabled={busy}>
            <CheckCircle />
            {busy
              ? "Đang xử lý…"
              : profile
                ? "Lưu hồ sơ"
                : mode === "login"
                  ? "Đăng nhập"
                  : "Tạo tài khoản"}
          </Button>
          <p className="form-note">
            Tài khoản chạy thử chỉ lưu trên trình duyệt này, không đồng bộ thiết bị. Không nhập mật
            khẩu hoặc thông tin ngân hàng thật.
          </p>
        </form>
        {profile && (
          <Button
            variant="outline"
            onClick={() => {
              setStore((s) => ({ ...s, session: null }));
              onClose();
              toast.success("Đã đăng xuất.");
            }}
          >
            <LogOut /> Đăng xuất
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
