type LookConfig = Record<string, unknown>;
export type AccessoryCategory = "head" | "face" | "extra";

export function tryOnAccessory(config: LookConfig, id: string, category: AccessoryCategory) {
  const raw = config.acc;
  const entries = raw && typeof raw === "object" && !Array.isArray(raw) ? Object.entries(raw) : [];
  const accessories = Object.fromEntries(entries.filter(([, item]) =>
    item && typeof item === "object" && typeof item.id === "string" && item.id,
  ));
  if (Object.values(accessories).some(item => item.id === id)) {
    return { config, replaced: false };
  }
  const slots = [category, `${category}2`, `${category}3`];
  const slot = slots.find(key => !Object.hasOwn(accessories, key));
  const target = Object.keys(accessories).length < 12 ? slot ?? slots[2] : slots.findLast(key => Object.hasOwn(accessories, key));
  if (!target) return null;
  return {
    config: { ...config, acc: { ...accessories, [target]: { id } } },
    replaced: Object.hasOwn(accessories, target),
  };
}

export function shopHref(look?: string, item?: string) {
  const query = new URLSearchParams();
  if (look) query.set("look", look);
  if (item) query.set("item", item);
  return query.size ? `/characters/shop/?${query}` : "/characters/shop/";
}

export function lockerHref(code?: string, item?: string) {
  const query = new URLSearchParams();
  if (code) query.set("code", code);
  if (item) query.set("item", item);
  return query.size ? `/tools/locker/?${query}` : "/tools/locker/";
}
