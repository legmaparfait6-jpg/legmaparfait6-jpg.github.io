/**
 * Construction du visage hors du fil principal : téléchargement du maillage
 * et de la photo, tirage des particules, puis renvoi des tableaux (transférés,
 * sans copie). La page reste fluide pendant le calcul, même sur téléphone.
 */
import { buildPortrait, type PortraitRig } from "./portrait-build";

self.onmessage = async (event: MessageEvent<{ count: number }>) => {
  try {
    const rig = (await fetch("/profile/portrait-rig.json").then((r) => r.json())) as PortraitRig;
    const blob = await fetch(rig.source).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);
    const [x, y, w, h] = rig.crop;
    const canvas = new OffscreenCanvas(w, h);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("canvas 2d");
    context.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
    bitmap.close();
    const data = buildPortrait(rig, context.getImageData(0, 0, w, h), event.data.count);
    const transfer = [data.position, data.color, data.intensity, data.jaw, data.shape, data.blink, data.head, data.kind,
      data.wire.position, data.wire.jaw, data.wire.shape, data.wire.blink].map((a) => a.buffer);
    self.postMessage(data, { transfer });
  } catch {
    self.postMessage(null);
  }
};
