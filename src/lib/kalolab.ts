import { z } from "zod";
import a1806 from "@/assets/meal-1806.jpeg.asset.json";
import a1808 from "@/assets/meal-1808.jpeg.asset.json";
import a1809 from "@/assets/meal-1809.jpeg.asset.json";
import a1812 from "@/assets/meal-1812.jpeg.asset.json";
import a1813 from "@/assets/meal-1813.jpeg.asset.json";
import a1814 from "@/assets/meal-1814.jpeg.asset.json";
import a1815 from "@/assets/meal-1815.jpeg.asset.json";
import a1816 from "@/assets/meal-1816.jpeg.asset.json";
import a1817 from "@/assets/meal-1817.jpeg.asset.json";

export type Meal = {
  id: number;
  name: string;
  image: string;
  period: string;
  goals: string[];
  price: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  rating: number;
  reviews: number;
  ingredients: string;
  badge: string;
  servings: number;
};

export const meals: Meal[] = [
  {
    id: 1,
    name: "Bánh mì bơ & tôm áp chảo",
    image: a1806.url,
    period: "Bữa sáng",
    goals: ["Giữ dáng", "Tăng cơ"],
    price: 69000,
    kcal: 385,
    protein: 27,
    carbs: 36,
    fat: 15,
    rating: 4.9,
    reviews: 86,
    ingredients: "Bánh mì nguyên cám, tôm áp chảo, bơ, nho xanh, việt quất và sữa chua ngũ cốc.",
    badge: "Được yêu thích",
    servings: 1,
  },
  {
    id: 2,
    name: "Bánh mì nguyên cám mứt dâu",
    image: a1808.url,
    period: "Bữa sáng",
    goals: ["Ăn chay", "Giữ dáng"],
    price: 39000,
    kcal: 285,
    protein: 8,
    carbs: 48,
    fat: 7,
    rating: 4.8,
    reviews: 64,
    ingredients: "Bánh mì nguyên cám, mứt dâu, mứt quả mọng, dâu tây và việt quất.",
    badge: "Nhẹ nhàng buổi sáng",
    servings: 1,
  },
  {
    id: 3,
    name: "Sữa chua granola & trái cây",
    image: a1809.url,
    period: "Bữa sáng",
    goals: ["Ăn chay", "Giảm cân"],
    price: 49000,
    kcal: 310,
    protein: 14,
    carbs: 42,
    fat: 10,
    rating: 4.9,
    reviews: 112,
    ingredients: "Sữa chua, granola yến mạch, dâu tây, mâm xôi, việt quất và nho đỏ.",
    badge: "Bán chạy",
    servings: 1,
  },
  {
    id: 4,
    name: "Cá hồi áp chảo & bơ tươi",
    image: a1812.url,
    period: "Bữa trưa",
    goals: ["Tăng cơ", "Giữ dáng"],
    price: 119000,
    kcal: 520,
    protein: 38,
    carbs: 24,
    fat: 30,
    rating: 4.9,
    reviews: 128,
    ingredients: "Cá hồi áp chảo, trứng lòng đào, bơ, đậu nành Nhật, củ dền và dâu tây.",
    badge: "Giàu Omega-3",
    servings: 1,
  },
  {
    id: 5,
    name: "Set dinh dưỡng cho 4 người",
    image: a1813.url,
    period: "Bữa trưa",
    goals: ["Tăng cơ", "Giữ dáng"],
    price: 329000,
    kcal: 1840,
    protein: 148,
    carbs: 188,
    fat: 56,
    rating: 5.0,
    reviews: 42,
    ingredients:
      "Bốn phần ăn với ức gà, cơm gạo lứt, trứng, bông cải, đậu que, bắp, dưa leo và rau xanh.",
    badge: "Set 4 người",
    servings: 4,
  },
  {
    id: 6,
    name: "Gà nghệ & cơm gạo lứt",
    image: a1814.url,
    period: "Bữa trưa",
    goals: ["Tăng cơ", "Giữ dáng"],
    price: 79000,
    kcal: 465,
    protein: 35,
    carbs: 48,
    fat: 15,
    rating: 4.8,
    reviews: 95,
    ingredients: "Gà ướp nghệ, cơm gạo lứt, trứng lòng đào, cà rốt, đậu que và rau xanh.",
    badge: "Đủ chất, tròn vị",
    servings: 1,
  },
  {
    id: 7,
    name: "Ức gà nướng & rau củ",
    image: a1815.url,
    period: "Bữa tối",
    goals: ["Giảm cân", "Bệnh lý"],
    price: 79000,
    kcal: 410,
    protein: 36,
    carbs: 38,
    fat: 12,
    rating: 4.9,
    reviews: 106,
    ingredients: "Ức gà nướng, cơm gạo lứt, súp lơ, dưa leo, cà rốt và rau cải.",
    badge: "Ít chất béo",
    servings: 1,
  },
  {
    id: 8,
    name: "Ức gà luộc & khoai lang",
    image: a1816.url,
    period: "Bữa tối",
    goals: ["Giảm cân", "Tăng cơ", "Bệnh lý"],
    price: 75000,
    kcal: 395,
    protein: 34,
    carbs: 40,
    fat: 11,
    rating: 4.8,
    reviews: 73,
    ingredients: "Ức gà luộc, khoai lang vàng, trứng luộc, xà lách và cà rốt.",
    badge: "Thanh đạm",
    servings: 1,
  },
  {
    id: 9,
    name: "Bowl bò & rau xanh",
    image: a1817.url,
    period: "Bữa tối",
    goals: ["Tăng cơ", "Giữ dáng"],
    price: 89000,
    kcal: 450,
    protein: 32,
    carbs: 28,
    fat: 23,
    rating: 4.9,
    reviews: 91,
    ingredients: "Thịt bò, trứng, bơ, bí đỏ, cà chua, dưa leo, rong biển và rau xanh.",
    badge: "Giàu chất đạm",
    servings: 1,
  },
];

export const customization = [
  "Ít muối",
  "Ít đường",
  "Ăn kiêng nghiêm ngặt",
  "Cheatmeal (+15.000đ)",
  "Không hành tỏi",
];

export const money = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export const bmi = (height: number, weight: number) =>
  height > 0 && weight > 0 ? Math.round((weight / (height / 100) ** 2) * 10) / 10 : 0;

export function bmiAdvice(value: number) {
  if (!value) return "Hoàn thiện hồ sơ để nhận gợi ý riêng.";
  if (value < 18.5) return "BMI thấp · Ưu tiên bữa ăn đủ năng lượng và đạm.";
  if (value < 25) return "BMI trong khoảng tham khảo · Duy trì bữa ăn cân bằng.";
  return "BMI cao · Ưu tiên rau xanh, chất đạm và khẩu phần phù hợp.";
}

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự").max(100),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại cần 10 chữ số, bắt đầu bằng 0"),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ đầy đủ").max(300),
  bank: z.string().max(80),
  account: z.string().regex(/^\d{0,20}$/, "Số tài khoản chỉ gồm chữ số"),
  height: z.number().min(80).max(250),
  weight: z.number().min(20).max(300),
  health: z.string().max(300),
});

export type Profile = z.infer<typeof profileSchema>;
export type CartItem = { key: string; mealId: number; quantity: number; options: string[] };
export type Voucher = {
  code: string;
  label: string;
  kind: "amount" | "percent" | "shipping" | "juice";
  value: number;
};

export const baseVoucher: Voucher = {
  code: "KALOLAB20",
  label: "Giảm 20% đơn hàng",
  kind: "percent",
  value: 20,
};

export const prizes: Omit<Voucher, "code">[] = [
  { label: "Giảm 10.000đ", kind: "amount", value: 10000 },
  { label: "Giảm 20.000đ", kind: "amount", value: 20000 },
  { label: "Giảm 50.000đ", kind: "amount", value: 50000 },
  { label: "Miễn phí giao hàng", kind: "shipping", value: 0 },
  { label: "Tặng 1 chai nước ép", kind: "juice", value: 0 },
  { label: "May mắn lần sau", kind: "amount", value: 0 },
];

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => {
    const m = meals.find((m) => m.id === item.mealId);
    return (
      sum +
      (m ? m.price + (item.options.includes(customization[3] ?? "") ? 15000 : 0) : 0) *
        item.quantity
    );
  }, 0);
}

export function totals(cart: CartItem[], voucher: Voucher | null) {
  const subtotal = cartTotal(cart);
  const shipping = subtotal === 0 ? 0 : voucher?.kind === "shipping" ? 0 : 15000;
  const discount =
    voucher?.kind === "percent"
      ? Math.round((subtotal * voucher.value) / 100)
      : voucher?.kind === "amount"
        ? Math.min(subtotal, voucher.value)
        : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}

export const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function checkInReward(count: number): Voucher | null {
  return count > 0 && count % 7 === 0
    ? { code: `DIEMDANH${count}`, label: "Quà 7 ngày: giảm 20.000đ", kind: "amount", value: 20000 }
    : null;
}

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  payment: string;
  name: string;
  address: string;
  phone: string;
  gift: boolean;
};

export type Review = { mealId: number; name: string; rating: number; text: string };
export type Account = { phone: string; hash: string; salt: string; profile: Profile };
export type Store = {
  accounts: Account[];
  session: string | null;
  cart: CartItem[];
  orders: Order[];
  vouchers: Voucher[];
  checkins: string[];
  reviews: Review[];
};

export const initialStore: Store = {
  accounts: [],
  session: null,
  cart: [],
  orders: [],
  vouchers: [],
  checkins: [],
  reviews: [],
};

const voucherSchema = z.object({
  code: z.string(),
  label: z.string(),
  kind: z.enum(["amount", "percent", "shipping", "juice"]),
  value: z.number().nonnegative(),
});

const itemSchema = z.object({
  key: z.string(),
  mealId: z.number().int().min(1).max(9),
  quantity: z.number().int().min(1).max(99),
  options: z.array(z.string()),
});

export const storeSchema = z.object({
  accounts: z.array(
    z.object({ phone: z.string(), hash: z.string(), salt: z.string(), profile: profileSchema }),
  ),
  session: z.string().nullable(),
  cart: z.array(itemSchema),
  orders: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      items: z.array(itemSchema),
      total: z.number(),
      payment: z.string(),
      name: z.string(),
      address: z.string(),
      phone: z.string(),
      gift: z.boolean(),
    }),
  ),
  vouchers: z.array(voucherSchema),
  checkins: z.array(z.string()),
  reviews: z.array(
    z.object({
      mealId: z.number(),
      name: z.string(),
      rating: z.number().min(1).max(5),
      text: z.string().max(600),
    }),
  ),
});

export async function passwordHash(password: string, salt: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function chatReply(text: string, profile: Profile | null) {
  const t = text.toLowerCase();
  if (
    /tiểu đường|huyết áp|dị ứng|bệnh/.test(t) ||
    profile?.health.toLowerCase().includes("tiểu đường")
  )
    return "Với bệnh lý hoặc dị ứng, bạn nên trao đổi với bác sĩ/chuyên gia trước khi chọn món. Bạn có thể tham khảo ức gà luộc, chọn ít muối và ít đường; hãy xác nhận thành phần với bếp. Đây không phải tư vấn y khoa.";
  if (/bmi|giảm|cân/.test(t))
    return `${profile ? `BMI của bạn là ${bmi(profile.height, profile.weight)}. ${bmiAdvice(bmi(profile.height, profile.weight))}` : "Bạn có thể cập nhật chiều cao và cân nặng trong hồ sơ."} Gợi ý: Ức gà nướng & rau củ (khoảng 410 kcal), hoặc ức gà luộc & khoai lang (395 kcal).`;
  if (/đạm|gym|cơ|protein/.test(t))
    return "Cá hồi áp chảo có khoảng 38g đạm; ức gà nướng có khoảng 36g đạm. Kết hợp vận động và khẩu phần phù hợp với bạn nhé.";
  if (/calo|kcal|thực đơn|món/.test(t))
    return "Bữa sáng: granola & trái cây ~310 kcal. Bữa trưa: gà nghệ & cơm gạo lứt ~465 kcal. Bữa tối: ức gà luộc & khoai lang ~395 kcal. Các số liệu là ước lượng.";
  return "Chào bạn! Bạn muốn chọn bữa sáng, trưa hay tối? Mình có thể gợi ý món, lượng calo hoặc bữa ăn theo mục tiêu của bạn.";
}

// ================== GEMINI AI CHAT (GIAO TIẾP TỰ NHIÊN) ==================

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type KalolabNutrition = {
  foodName: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: "Rất tốt" | "Cân bằng" | "Nên ăn vừa phải";
  advice: string;
};

export type KalolabAIResponse = {
  reply: string;
  nutrition?: KalolabNutrition;
};

// Key chạy test trên Lovable Preview (nên chuyển sang backend / Edge Function và đổi key mới trước khi Publish công khai)
const FALLBACK_DEV_KEY = "AQ.Ab8RN6K3MtXr7bP7anyRldtIllp0O5l0cW1Cyu_ORLfgbQsbIg";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
];

function getGeminiApiKey(): string {
  const envKey = (import.meta.env as Record<string, string | undefined>).VITE_GEMINI_API_KEY;
  const localKey =
    typeof window !== "undefined" ? localStorage.getItem("kalolab_gemini_key") || "" : "";
  return (envKey || localKey || FALLBACK_DEV_KEY).trim();
}

  let lastError = "Không tìm thấy model phù hợp hoặc API Key không hợp lệ.";

  const userParts: Array<
    { text: string } | { inline_data: { mime_type: string; data: string } }
  > = [{ text: userPrompt }];

  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      userParts.push({
        inline_data: {
          mime_type: match[1],
          data: match[2],
        },
      });
    }
  }

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: userParts,
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  };

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, usedModel: model };
        lastError = `Model ${model} trả về nội dung rỗng.`;
        continue;
      }

      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}`;
      lastError = `[${model}] ${errMsg}`;

      if (response.status === 401 || response.status === 403) {
        throw new Error(`API Key bị từ chối (${response.status}): ${errMsg}`);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        lastError = `[${model}] Hết thời gian chờ (30s).`;
        continue;
      }
      if (err instanceof Error && err.message.startsWith("API Key bị từ chối")) {
        throw err;
      }
      lastError = err instanceof Error ? `[${model}] ${err.message}` : lastError;
    }
  }

  throw new Error(lastError);
};


const KALOLAB_SYSTEM_PROMPT = `Bạn là Kalolab — chuyên gia dinh dưỡng AI trẻ trung, tinh tế, nói tiếng Việt tự nhiên như một người bạn am hiểu sức khỏe (xưng "mình", gọi người dùng là "bạn").

PHONG CÁCH GIAO TIẾP:
1. Tự nhiên, đời thường, ứng biến linh hoạt, không máy móc hay giáo điều. Khi người dùng chào hỏi, than mệt, tâm sự chuyện ăn uống ("trời mưa thèm lẩu quá", "nay lỡ ăn hơi nhiều"), hãy đồng cảm, trò chuyện thân thiện/dí dỏm trước rồi mới tư vấn thực tế.
2. Trả lời linh hoạt mọi câu hỏi ngẫu nhiên hằng ngày lẫn chuyên sâu về dinh dưỡng (giảm mỡ, tăng cơ, tính calo/macro, đồ ăn ngoài quán Việt Nam, dạ dày, tập gym, ăn chay, giấc ngủ...).
3. Ngắn gọn, dễ đọc (3–6 dòng cho câu hỏi thường; chi tiết hơn khi người dùng xin thực đơn hoặc phân tích sâu). Khi hợp lý, kết thúc bằng 1 câu hỏi gợi mở tự nhiên để nối mạch trò chuyện.
4. Nếu người dùng hỏi chuyện ngoài lề dinh dưỡng, vẫn trò chuyện duyên dáng vài câu chứ không từ chối cứng nhắc, rồi khéo léo kết nối lại với sức khỏe nếu phù hợp.
5. Tự cá nhân hóa theo Hồ sơ & Chỉ số BMI được cung cấp mà không đọc lại nguyên xi số liệu trừ khi cần thiết.

ĐẦU RA BẮT BUỘC LÀ JSON HỢP LỆ THEO ĐÚNG CẤU TRÚC:
{
  "reply": "Nội dung trả lời tự nhiên bằng tiếng Việt (dùng \\n để xuống dòng)",
  "nutrition": null hoặc {
    "foodName": "Tên món ăn cụ thể",
    "servingSize": "Khẩu phần ước tính (VD: 1 tô vừa ~500g)",
    "calories": 450,
    "protein": 25,
    "carbs": 50,
    "fat": 15,
    "fiber": 4,
    "healthScore": "Rất tốt" | "Cân bằng" | "Nên ăn vừa phải",
    "advice": "1-2 câu góp ý thực tế cho bữa ăn này"
  }
}

QUY TẮC CHO "nutrition":
- Điền đầy đủ khi người dùng gửi ẢNH MÓN ĂN hoặc hỏi trực tiếp calo/dinh dưỡng của 1 món cụ thể.
- Để null khi trò chuyện bình thường, tâm sự, gợi ý nhiều món hoặc ảnh không phải đồ ăn.`;

export async function askKalolabAI(params: {
  message: string;
  image: string | null;
  profile: Profile | null;
  history: ChatHistoryItem[];
  apiEndpoint?: string;
  signal?: AbortSignal;
}): Promise<KalolabAIResponse> {
  const { message, image, profile, history, apiEndpoint, signal } = params;
  const geminiKey = getGeminiApiKey();

  // 1. Nếu không có Gemini key ở frontend nhưng có backend riêng
  if (!geminiKey && apiEndpoint) {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({ message, image, profile, history }),
    });
    if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.reply) throw new Error("Empty backend reply");
    return {
      reply: String(data.reply).trim(),
      nutrition: data.nutrition ?? undefined,
    };
  }

  if (!geminiKey) {
    throw new Error("Chưa gắn VITE_GEMINI_API_KEY");
  }

  // 2. Chuẩn hóa lịch sử chat (Gemini yêu cầu lượt đầu tiên là "user" và xen kẽ user/model)
  const contents: Array<{
    role: "user" | "model";
    parts: Array<Record<string, unknown>>;
  }> = [];

  for (const item of history.slice(-10)) {
    const role = item.role === "user" ? "user" : "model";
    const text = item.content?.trim();
    if (!text) continue;
    if (contents.length === 0 && role === "model") continue;

    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts.push({ text });
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  if (contents[contents.length - 1]?.role === "user") {
    contents.pop();
  }

  // Đính kèm hồ sơ + chỉ số BMI tính từ hàm có sẵn
  let profileContext = "";
  if (profile) {
    const bmiVal = bmi(profile.height, profile.weight);
    profileContext = `[Hồ sơ: tên=${profile.name}, cao=${profile.height}cm, nặng=${profile.weight}kg, BMI=${bmiVal} (${bmiAdvice(bmiVal)}), tình trạng sức khỏe=${profile.health || "không ghi nhận"}]`;
  }

  const userParts: Array<Record<string, unknown>> = [
    {
      text: [
        profileContext,
        message || "Phân tích món ăn trong ảnh này giúp mình nhé.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  if (image && image.startsWith("data:image/")) {
    const [meta, base64] = image.split(",");
    const mimeType = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
    userParts.push({
      inline_data: { mime_type: mimeType, data: base64 },
    });
  }

  contents.push({ role: "user", parts: userParts });

  // 3. Thử lần lượt các model Gemini (truyền key qua header x-goog-api-key cho tương thích key AQ.)
  let lastError = "Không thể kết nối Gemini API";

  for (const model of GEMINI_MODELS) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: KALOLAB_SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      lastError = `${model} HTTP ${res.status}: ${errText}`;
      console.warn("[Kalolab AI]", lastError);
      continue;
    }

    const data = await res.json();
    const parts: Array<{ text?: string; thought?: boolean }> =
      data?.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts
      .filter((p) => typeof p.text === "string" && !p.thought)
      .map((p) => p.text)
      .join("")
      .trim();

    if (!rawText) {
      lastError = `${model} trả về rỗng`;
      continue;
    }

    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        reply: String(parsed.reply || rawText).trim(),
        nutrition: parsed.nutrition ?? undefined,
      };
    } catch {
      return { reply: rawText };
    }
  }

  throw new Error(lastError);
}
