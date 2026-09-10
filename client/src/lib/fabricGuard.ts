import type { Canvas } from 'fabric';

export function disposeFabricCanvas(ref: { current: Canvas | null }) {
  const canvas = ref.current;
  if (!canvas) return;
  ref.current = null;
  try {
    canvas.off();
    canvas.dispose();
  } catch {
    // Canvas may already be disposed or detached from the DOM.
  }
}

export function isFabricCanvasLive(canvas: Canvas): boolean {
  const el = (canvas as any).lowerCanvasEl as HTMLCanvasElement | undefined;
  return !!el && el.isConnected;
}

export function flushCanvasJson(canvas: Canvas): string {
  try {
    return JSON.stringify(canvas.toJSON());
  } catch {
    return '';
  }
}