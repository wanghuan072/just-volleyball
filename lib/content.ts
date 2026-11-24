import skinData from "@/data/skins.json";
import communitySkins from "@/data/community-skins.json";
import updateData from "@/data/updates.json";
import { guides } from "@/data/guides";
import presetEvidence from "@/data/preset-evidence.json";
import portraitRenders from "@/data/portrait-renders.json";
export type PresetEvidence = (typeof presetEvidence)[keyof typeof presetEvidence];
type SkinSource = (typeof skinData)[number] | (typeof communitySkins)[number];
export type Skin = SkinSource & { evidence: PresetEvidence; render: (typeof portraitRenders.items)[number] };
// Publish source-listed looks after package format/resource checks, while
// retaining the independent game-test status instead of conflating the two.
export const skins: Skin[] = [...skinData, ...communitySkins].flatMap((skin) => {
  const evidence = presetEvidence[skin.slug as keyof typeof presetEvidence];
  const render = portraitRenders.items.find(item => item.slug === skin.slug);
  return evidence?.crcValid && evidence.resourceMatch && render ? [{ ...skin, image:render.image, evidence, render }] : [];
});
export const updates = updateData;
export { guides };
export function findSkin(slug: string) {
  return skins.find((s) => s.slug === slug);
}
export function findGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
