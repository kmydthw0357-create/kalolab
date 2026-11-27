import { describe, it, expect } from "vitest";
import {
  meals,
  totals,
  baseVoucher,
  bmi,
  checkInReward,
  customization,
  profileSchema,
} from "@/lib/kalolab";
describe("Kalolab rules", () => {
  it("uses the first three photos for breakfast", () => {
    expect(meals.filter((m) => m.period === "Bữa sáng").map((m) => m.id)).toEqual([1, 2, 3]);
  });
  it("splits the other photos evenly between lunch and dinner", () => {
    expect(meals.filter((m) => m.period === "Bữa trưa")).toHaveLength(3);
    expect(meals.filter((m) => m.period === "Bữa tối")).toHaveLength(3);
  });
  it("identifies the four-plate set as four servings", () => {
    expect(meals.find((m) => m.id === 5)?.servings).toBe(4);
  });
  it("KALOLAB20 discounts the meal subtotal by 20 percent", () => {
    expect(baseVoucher.code).toBe("KALOLAB20");
    expect(totals([{ key: "1", mealId: 1, quantity: 1, options: [] }], baseVoucher)).toEqual({
      subtotal: 69000,
      discount: 13800,
      shipping: 15000,
      total: 70200,
    });
  });
  it("adds the 15000 cheatmeal fee per portion", () => {
    expect(
      totals([{ key: "1", mealId: 1, quantity: 2, options: [customization[3] ?? ""] }], null)
        .subtotal,
    ).toBe(168000);
  });
  it("computes BMI from kilograms and centimeters", () => {
    expect(bmi(170, 65)).toBe(22.5);
  });
  it("awards a voucher only at each seven check-ins", () => {
    expect(checkInReward(6)).toBeNull();
    expect(checkInReward(7)?.value).toBe(20000);
    expect(checkInReward(8)).toBeNull();
  });
  it("free shipping removes the shipping fee", () => {
    expect(
      totals([{ key: "1", mealId: 1, quantity: 1, options: [] }], {
        code: "FREE",
        label: "Freeship",
        kind: "shipping",
        value: 0,
      }).total,
    ).toBe(69000);
  });
  it("discount cannot make the total negative", () => {
    expect(
      totals([{ key: "2", mealId: 2, quantity: 1, options: [] }], {
        code: "50K",
        label: "50k",
        kind: "amount",
        value: 50000,
      }),
    ).toEqual({ subtotal: 39000, discount: 39000, shipping: 15000, total: 15000 });
  });
  it("requires a complete profile and a valid Vietnamese phone", () => {
    expect(
      profileSchema.safeParse({
        name: "An",
        phone: "123",
        address: "Huế",
        bank: "",
        account: "",
        height: 170,
        weight: 65,
        health: "Bình thường",
      }).success,
    ).toBe(false);
  });
});
