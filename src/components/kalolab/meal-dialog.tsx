import { useState } from "react";
import { Star, Flame, Minus, Plus, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { customization, money, type Meal, type Profile, type Review } from "@/lib/kalolab";
export function MealDialog({
  meal,
  onClose,
  onAdd,
  reviews,
  profile,
  onReview,
}: {
  meal: Meal;
  onClose: () => void;
  onAdd: (options: string[], quantity: number) => void;
  reviews: Review[];
  profile: Profile | null;
  onReview: (review: Review) => void;
}) {
  const [options, setOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const price = meal.price + (options.includes(customization[3] ?? "") ? 15000 : 0);
  function submitReview() {
    if (!profile) {
      toast.error("Vui lòng đăng nhập để viết đánh giá.");
      return;
    }
    const result = z
      .string()
      .trim()
      .min(5, "Đánh giá cần ít nhất 5 ký tự.")
      .max(600)
      .safeParse(text);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message);
      return;
    }
    onReview({ mealId: meal.id, name: profile.name, rating, text: result.data });
    setText("");
    toast.success("Cảm ơn bạn đã chia sẻ đánh giá!");
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="modal-scroll">
        <DialogTitle className="modal-title">{meal.name}</DialogTitle>
        <DialogDescription>
          {meal.period} ·{" "}
          {meal.servings === 4 ? "Khẩu phần đặc biệt dành cho 4 người" : "Khẩu phần cho 1 người"}
        </DialogDescription>
        <img className="modal-image" src={meal.image} alt={meal.name} />
        <p className="text-sm text-muted-foreground">{meal.ingredients}</p>
        <div className="detail-nutrients">
          {[
            [meal.kcal, "kcal"],
            [meal.protein, "g đạm"],
            [meal.carbs, "g tinh bột"],
            [meal.fat, "g chất béo"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="form-note">
          Dinh dưỡng ước lượng từ ảnh, tính cho{" "}
          {meal.servings === 4 ? "cả set 4 người (~460 kcal/người)" : "một khẩu phần"}. Thành phần
          và khối lượng thực tế có thể khác. Món có thể chứa chất gây dị ứng.
        </p>
        <div>
          <h3 className="subheading">Một chút riêng cho bạn</h3>
          {customization.map((option) => (
            <label className="choice" key={option}>
              <input
                type="checkbox"
                checked={options.includes(option)}
                onChange={(e) =>
                  setOptions((prev) =>
                    e.target.checked ? [...prev, option] : prev.filter((o) => o !== option),
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <div className="quantity">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Giảm số lượng"
              disabled={quantity === 1}
              onClick={() => setQuantity((q) => q - 1)}
            >
              <Minus />
            </Button>
            <span>{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tăng số lượng"
              disabled={quantity === 99}
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus />
            </Button>
          </div>
          <Button
            onClick={() => {
              onAdd(options, quantity);
              onClose();
            }}
          >
            <ShoppingBag /> Thêm vào giỏ · {money(price * quantity)}
          </Button>
        </div>
        <div>
          <h3 className="subheading">
            Đánh giá món ăn · {meal.rating} <Star className="inline size-4 text-orange" />
          </h3>
          <div className="rounded-md bg-muted p-3">
            <strong className="text-xs">Minh Anh · 5/5</strong>
            <p className="form-note mt-1">
              Món ăn tươi, vị vừa miệng. Khẩu phần vừa đủ cho một bữa, đóng gói cẩn thận.
            </p>
            <small className="form-note">Đánh giá minh họa</small>
          </div>
          {reviews
            .filter((r) => r.mealId === meal.id)
            .map((r, i) => (
              <div className="order-entry" key={i}>
                <strong>
                  {r.name} · {r.rating}/5
                </strong>
                <p>{r.text}</p>
              </div>
            ))}
          <h4 className="subheading">Chia sẻ trải nghiệm của bạn</h4>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="star"
                className={n <= rating ? "selected" : ""}
                aria-label={`${n} sao`}
                onClick={() => setRating(n)}
              >
                <Star />
              </Button>
            ))}
          </div>
          <textarea
            className="form-input"
            maxLength={600}
            rows={3}
            placeholder="Bạn thấy món ăn thế nào?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={submitReview} className="mt-2">
            Gửi đánh giá
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
