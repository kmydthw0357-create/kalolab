import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Leaf,
  ShoppingBag,
  UserRound,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Flame,
  Star,
  Plus,
  Search,
  Sunrise,
  Sun,
  Moon,
  Gift,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  History,
  HeartPulse,
  Sprout,
  Wheat,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MealDialog } from "@/components/kalolab/meal-dialog";
import { AccountDialog } from "@/components/kalolab/account-dialog";
import { CartDialog, OrdersDialog } from "@/components/kalolab/cart-dialog";
import { RewardsDialog } from "@/components/kalolab/rewards-dialog";
import { Chat } from "@/components/kalolab/chat";
import { useKalolab } from "@/hooks/use-kalolab";
import { meals, money, bmi, bmiAdvice, type Meal } from "@/lib/kalolab";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalolab | Thực đơn healthy mỗi ngày" },
      {
        name: "description",
        content:
          "Chọn bữa sáng, trưa, tối tại Kalolab, bếp dinh dưỡng cá nhân hóa ở Huế. Thực đơn healthy với dinh dưỡng ước lượng và tùy chọn chế biến.",
      },
      { property: "og:title", content: "Kalolab — Bếp dinh dưỡng cá nhân hóa" },
      {
        property: "og:description",
        content:
          "Bữa ăn tươi ngon, cân bằng dinh dưỡng. Khám phá thực đơn healthy sáng, trưa, tối của Kalolab.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Logo() {
  return (
    <a href="#top" className="logo" aria-label="Kalolab trang chủ">
      <Sprout className="logo-icon" strokeWidth={2} />
      <div>
        kalolab<small>BẾP DINH DƯỠNG CÁ NHÂN HÓA</small>
      </div>
    </a>
  );
}
function Stars() {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} />
      ))}
    </div>
  );
}
function Index() {
  const { store, setStore, profile } = useKalolab();
  const [period, setPeriod] = useState("Tất cả");
  const [goal, setGoal] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Meal | null>(null);
  const [modal, setModal] = useState<"account" | "cart" | "rewards" | "orders" | null>(null);
  const filtered = meals.filter(
    (m) =>
      (period === "Tất cả" || m.period === period) &&
      (goal === "Tất cả" || m.goals.includes(goal)) &&
      m.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")),
  );
  const count = store.cart.reduce((n, i) => n + i.quantity, 0);
  function add(meal: Meal, options: string[] = [], quantity = 1) {
    const key = meal.id + ":" + [...options].sort().join("|");
    setStore((s) => ({
      ...s,
      cart: s.cart.some((i) => i.key === key)
        ? s.cart.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i,
          )
        : [...s.cart, { key, mealId: meal.id, quantity, options }],
    }));
    toast.success("Đã thêm " + meal.name + " vào giỏ.");
  }
  return (
    <div id="top">
      <div className="announcement">
        Một bữa ăn lành, ngàn điều tốt đẹp <span className="mx-2">✦</span> Ưu đãi 20% với mã{" "}
        <strong>KALOLAB20</strong>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Logo />
          <nav className="nav-links" aria-label="Điều hướng chính">
            <a className="active" href="#menu">
              Thực đơn
            </a>
            <a href="#about">Về Kalolab</a>
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground px-0"
              onClick={() => setModal("rewards")}
            >
              Ưu đãi & quà tặng
            </Button>
            <a href="#contact">Liên hệ</a>
          </nav>
          <div className="header-actions">
            <Button
              variant="ghost"
              size="sm"
              title="Hồ sơ cá nhân"
              aria-label="Hồ sơ cá nhân"
              onClick={() => setModal("account")}
            >
              <UserRound />
              <span className="account-label">
                {profile ? profile.name.split(" ").at(-1) : "Đăng nhập"}
              </span>
            </Button>
            {profile && (
              <Button
                variant="ghost"
                size="icon"
                title="Lịch sử đơn hàng"
                aria-label="Lịch sử đơn hàng"
                onClick={() => setModal("orders")}
              >
                <History />
              </Button>
            )}
            <Button data-cart onClick={() => setModal("cart")} size="sm">
              <ShoppingBag />
              <span>Giỏ hàng</span>
              <span className="cart-count">{count}</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="shell">
        <section className="hero" aria-label="Kalolab bếp dinh dưỡng">
          <img
            className="hero-image"
            src={meals[3]?.image}
            alt="Cá hồi áp chảo, bơ tươi, trứng và rau xanh tại Kalolab"
          />
          <div className="hero-content">
            <div className="eyebrow">
              <Leaf className="size-3" /> Tươi ngon mỗi ngày · Dinh dưỡng cho riêng bạn
            </div>
            <h1>
              Kalolab
              <br />
              Ăn lành. <span>Sống khỏe.</span>
            </h1>
            <p>
              Những bữa ăn tươi ngon, cân bằng dinh dưỡng — được chuẩn bị bằng sự thấu hiểu cơ thể
              bạn.
            </p>
            <div className="hero-actions">
              <Button
                onClick={() =>
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Khám phá thực đơn <ArrowRight />
              </Button>
              <Button variant="outline" onClick={() => setModal("account")}>
                <HeartPulse /> Hồ sơ sức khỏe
              </Button>
            </div>
          </div>
          <div className="hero-sticker">
            <ShieldCheck className="size-6" />
            <div>
              <strong>Ngon lành từ nguyên liệu</strong>
              <span>Tươi sạch · Đủ chất · Trọn vị</span>
            </div>
          </div>
        </section>
        <section className="benefits" aria-label="Cam kết Kalolab">
          {[
            [Leaf, "Nguyên liệu tươi sạch", "Chọn lọc kỹ, chuẩn bị mỗi ngày"],
            [Heart, "Dinh dưỡng cân bằng", "Ăn ngon theo mục tiêu của bạn"],
            [ShieldCheck, "Cá nhân hóa bữa ăn", "Một chút riêng cho từng người"],
            [Truck, "Giao tận nơi", "Bữa ăn ngon đến ngay cửa nhà"],
          ].map(([Icon, title, subtitle]) => {
            const I = Icon as typeof Leaf;
            return (
              <div className="benefit" key={String(title)}>
                <I />
                <div>
                  <strong>{String(title)}</strong>
                  <span>{String(subtitle)}</span>
                </div>
              </div>
            );
          })}
        </section>
        {profile && (
          <div className="profile-banner">
            <HeartPulse className="size-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <strong>
                Chào {profile.name}, hôm nay ăn lành nhé! · BMI{" "}
                {bmi(profile.height, profile.weight)}
              </strong>
              <p>
                {bmiAdvice(bmi(profile.height, profile.weight))}{" "}
                {profile.health !== "Bình thường"
                  ? "Với bệnh lý, hãy xác nhận món ăn cùng chuyên gia."
                  : ""}
              </p>
            </div>
          </div>
        )}
        <section id="menu">
          <div className="menu-heading">
            <div className="min-w-0">
              <div className="section-kicker">THỰC ĐƠN KALOLAB</div>
              <h2>Hôm nay, bạn muốn ăn gì?</h2>
              <p className="section-subtitle">
                Chọn bữa ăn phù hợp, để Kalolab chăm chút phần còn lại.
              </p>
            </div>
            <label className="search-box">
              <Search className="size-4 shrink-0" />
              <input
                aria-label="Tìm món ăn"
                placeholder="Tìm món bạn yêu thích…"
                value={search}
                maxLength={100}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <div className="period-tabs" role="tablist" aria-label="Chọn bữa ăn">
            {[
              [Leaf, "Tất cả"],
              [Sunrise, "Bữa sáng"],
              [Sun, "Bữa trưa"],
              [Moon, "Bữa tối"],
            ].map(([Icon, title]) => {
              const I = Icon as typeof Leaf;
              const text = String(title);
              return (
                <Button
                  key={text}
                  role="tab"
                  aria-selected={period === text}
                  variant="nav"
                  data-active={period === text}
                  onClick={() => setPeriod(text)}
                >
                  <I className="size-4" />
                  {text}
                </Button>
              );
            })}
          </div>
          <div className="goal-filters" aria-label="Mục tiêu dinh dưỡng">
            {["Tất cả", "Giảm cân", "Tăng cơ", "Giữ dáng", "Ăn chay", "Bệnh lý"].map((g) => (
              <Button
                key={g}
                variant="filter"
                data-active={goal === g}
                aria-pressed={goal === g}
                onClick={() => setGoal(g)}
              >
                {g === "Tất cả" ? "Tất cả mục tiêu" : g === "Bệnh lý" ? "Chế độ đặc biệt" : g}
              </Button>
            ))}
          </div>
          <div className="menu-count">
            <span>
              <strong>{filtered.length}</strong> món ngon dành cho bạn
            </span>
            <span>
              Chuẩn bị tươi mỗi ngày <Leaf className="inline size-3 text-primary ml-1" />
            </span>
          </div>
          {filtered.length ? (
            <div className="menu-grid">
              {filtered.map((meal) => (
                <article className="meal-card" key={meal.id}>
                  <div className="meal-photo">
                    <Button
                      variant="foodImage"
                      aria-label={`Xem ${meal.name}`}
                      onClick={() => setSelected(meal)}
                    >
                      <img src={meal.image} alt={meal.name} loading="lazy" />
                    </Button>
                    <span className="meal-badge">{meal.badge}</span>
                  </div>
                  <div className="meal-body">
                    <div className="meal-rating">
                      <Star />
                      <strong>{meal.rating.toFixed(1)}</strong>
                      <span>({meal.reviews} đánh giá mẫu)</span>
                      <span className="ml-auto">{meal.period}</span>
                    </div>
                    <Button variant="foodTitle" onClick={() => setSelected(meal)}>
                      {meal.name}
                    </Button>
                    <p className="meal-ingredients">{meal.ingredients}</p>
                    <div className="nutrition-row">
                      <span className="calories">
                        <Flame className="size-3" />
                        {meal.kcal} kcal
                      </span>
                      <span>
                        <Sprout className="size-3" />
                        {meal.protein}g đạm
                      </span>
                      <span className="fat">
                        <Wheat className="size-3" />
                        {meal.carbs}g carb
                      </span>
                    </div>
                    <div className="meal-bottom">
                      <div className="meal-price">
                        {money(meal.price)}
                        <small>/{meal.servings === 4 ? "set 4 người" : "phần"}</small>
                      </div>
                      <Button
                        variant="add"
                        size="icon"
                        title="Thêm vào giỏ hàng"
                        aria-label={`Thêm ${meal.name}`}
                        onClick={() => add(meal)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search />
              <h3>Chưa tìm thấy món phù hợp</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setPeriod("Tất cả");
                  setGoal("Tất cả");
                  setSearch("");
                }}
              >
                Xem tất cả món
              </Button>
            </div>
          )}
          <p className="notice">
            Dinh dưỡng được ước lượng theo ảnh và khẩu phần. Các gợi ý không thay thế tư vấn y khoa.
          </p>
        </section>
        <section className="reward-band" id="rewards">
          <div className="reward-copy">
            <Gift className="reward-icon" />
            <div>
              <div className="section-kicker">MỘT CHÚT QUÀ, THÊM NIỀM VUI</div>
              <h3>Ăn lành mỗi ngày, nhận quà mê say</h3>
              <p>Điểm danh 7 ngày và thử vận may để nhận voucher cho bữa ăn tiếp theo.</p>
            </div>
          </div>
          <Button onClick={() => setModal("rewards")}>
            Nhận quà ngay <ArrowRight />
          </Button>
        </section>
        <section className="reviews-section" id="about">
          <div className="review-heading">
            <div>
              <div className="section-kicker">BỮA ĂN NGON, CẢM NHẬN THẬT</div>
              <h2>Khách hàng nói gì về Kalolab?</h2>
            </div>
            <div className="rating-summary">
              <Stars />
              <strong>4.9/5</strong>
              <span className="text-muted-foreground text-xs">· Đánh giá minh họa</span>
            </div>
          </div>
          <div className="review-grid">
            {[
              [
                "MA",
                "Minh Anh",
                "Khách hàng văn phòng",
                "Mình thích nhất là món được ghi rõ dinh dưỡng. Bữa trưa đủ no mà không nặng bụng, rau rất tươi và sốt vừa miệng.",
              ],
              [
                "QH",
                "Quang Huy",
                "Người yêu vận động",
                "Ức gà mềm, không bị khô. Có thể chọn ít muối nên rất hợp với chế độ ăn của mình. Sẽ thử thêm món cá hồi!",
              ],
              [
                "TL",
                "Thảo Linh",
                "Yêu những bữa ăn lành",
                "Bữa sáng granola ngon và đẹp mắt. Cả nhà mình đều thích set 4 người, mỗi người một phần ăn rất tiện.",
              ],
            ].map(([initial, name, role, text]) => (
              <article className="review-card" key={name}>
                <Stars />
                <blockquote>“{text}”</blockquote>
                <div className="review-person">
                  <div className="avatar">{initial}</div>
                  <div>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </div>
                  <ShieldCheck className="size-3 text-primary ml-auto" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer" id="contact">
        <div className="shell">
          <div className="footer-columns">
            <div>
              <Logo />
              <p>
                Bếp dinh dưỡng cá nhân hóa. Từ nguyên liệu tươi sạch đến những bữa ăn cân bằng,
                Kalolab đồng hành cùng bạn trên hành trình sống khỏe.
              </p>
            
<div className="socials">
  {/* Facebook */}
  <Button asChild size="icon" variant="outline">
    <a
      href="https://www.facebook.com/share/1ChHnMkdn5/?mibextid=wwXIfr"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook Kalolab"
    >
      <Facebook />
    </a>
  </Button>

  {/* Instagram */}
  <Button asChild size="icon" variant="outline">
    <a
      href="https://www.instagram.com/tskc._vwnthjn?fqnt=MXF2YzcwNjNoYzVlag%3D%3D&utm_source=qr"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram Kalolab"
    >
      <Instagram />
    </a>
  </Button>
</div>
            </div>
            <div>
              <h3>Ghé bếp Kalolab</h3>
              <a
                className="footer-contact"
                href="https://www.google.com/maps/search/?api=1&query=99%20H%E1%BB%93%20%C4%90%E1%BA%AFc%20Di%2C%20Hu%E1%BA%BF"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin />
                99 Hồ Đắc Di, Phường An Cựu, TP Huế
              </a>
              <a className="footer-contact" href="tel:0345765237">
                <Phone />
                0345 765 237
              </a>
              <div className="footer-contact">
                <Clock />
                07:00 – 20:00 mỗi ngày (giờ mẫu)
              </div>
            </div>
            <div>
              <h3>Chăm sóc riêng cho bạn</h3>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => setModal("account")}
              >
                Hồ sơ sức khỏe
              </Button>
              <br />
              <Button
                variant="link"
                className="p-0 h-auto text-xs mt-3"
                onClick={() => setModal("rewards")}
              >
                Ví voucher & điểm danh
              </Button>
              <br />
              <Button
                variant="link"
                className="p-0 h-auto text-xs mt-3"
                onClick={() => setModal("orders")}
              >
                Lịch sử đơn hàng
              </Button>
              <p>Thông tin mạng xã hội đang chờ cập nhật.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Kalolab. Ăn lành. Sống khỏe.</span>
            <span>Bản trải nghiệm · Tài khoản và đơn hàng chỉ lưu trên trình duyệt</span>
          </div>
        </div>
      </footer>
      <Chat profile={profile} />
      {selected && (
        <MealDialog
          key={selected.id}
          meal={selected}
          onClose={() => setSelected(null)}
          onAdd={(o, q) => add(selected, o, q)}
          reviews={store.reviews}
          profile={profile}
          onReview={(r) => setStore((s) => ({ ...s, reviews: [...s.reviews, r] }))}
        />
      )}
      {modal === "account" && (
        <AccountDialog
          store={store}
          setStore={setStore}
          profile={profile}
          onClose={() => setModal(null)}
        />
      )}{" "}
      {modal === "cart" && (
        <CartDialog
          store={store}
          setStore={setStore}
          profile={profile}
          onClose={() => setModal(null)}
          onLogin={() => setModal("account")}
        />
      )}{" "}
      {modal === "rewards" && (
        <RewardsDialog store={store} setStore={setStore} onClose={() => setModal(null)} />
      )}{" "}
      {modal === "orders" && <OrdersDialog orders={store.orders} onClose={() => setModal(null)} />}
    </div>
  );
}
