# Fix: 413 Payload Too Large + Fabric clearRect crash in surgery form

## Problem
Two compounding bugs confirmed while using the Surgery form:

1. **413 Payload Too Large** on `POST /api/clinical/encounter` — Nest default JSON body limit is **100 kb**; the autosave sends the *entire* encounter (all `sectionData`, surgery `unifiedDetails` including OD/OS tables + custom rows, and fabric diagram JSON blobs), so the payload crosses the limit and every save fails (console spam).
2. **fabric.js `clearRect` on undefined context** — fabric `dispose()`/`clear()`/`renderAll()` called after the `<canvas>` DOM was detached/replaced throws `TypeError: Cannot read properties of undefined` at `clearContext`.
3. **409 Conflict (race)** — concurrent in-flight `saveEncounter` POSTs (autosave timer + tab-change flush + unmount flush) collide in the upsert/insert path.
4. **Bonus: SurgeryModal rules-of-hooks violation** — `if (!open) return null;` sits before the `useState` calls, so the hook list changes 0→2 hooks when the modal opens; causes unstable mounting that triggers the crash cycle.

## Decisions (from user)
- Body limit: **25 mb**.
- Scope: **all four fixes**.

## Changes

### 1. `api/src/main.ts` — raise body limit
```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Clinical encounters carry large payloads (diagram JSON, surgery forms).
  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
```

### 2. `client/src/store/useEncounterStore.ts` — single-flight save
- Module-level queue before the store creator:
  ```ts
  let saveQueue: Promise<unknown> = Promise.resolve();
  ```
- In `saveEncounter`, wrap the network call so saves run strictly one-at-a-time and the chain survives failures:
  ```ts
  const run = () => api.post('/clinical/encounter', payload, { toast: opts?.toast });
  const result = saveQueue.then(run, run);
  saveQueue = result.catch(() => undefined);
  await result;
  ```
- Payload still built from the *latest* store state at call time, so the final queued save wins.

### 3. Fabric lifecycle hardening
Files: `client/src/features/AnteriorSegmentEvaluationView.tsx` and `client/src/features/PosteriorSegmentEvaluationView.tsx`.

- Add a shared dispose helper inside each view (or module scope):
  ```ts
  const disposeCanvas = (ref: React.MutableRefObject<fabric.Canvas | null>) => {
    const c = ref.current;
    if (c) {
      c.off();
      if (!(c as any).disposed) { try { c.dispose(); } catch { /* ctx already gone */ } }
      ref.current = null;
    }
  };
  ```
- In `DrawingCanvas`/`FundusCanvas` `useEffect`:
  - Replace manual `canvas.dispose(); fabricRef.current = null;` in cleanup with the guarded helper.
  - Guard the init-time `if (fabricRef.current) fabricRef.current.dispose();` the same way.
  - `persist` callback: `if ((canvas as any).disposed) return;` before `JSON.stringify(canvas.toJSON())`.
  - `loadFromJSON` callback: add `&& !(canvas as any).disposed` to the existing `canvas === fabricRef.current` check.
- In `AnteriorSegmentEvaluationView.handleClearAll`:
  ```ts
  const handleClearAll = () =>
    [odFabricRef, osFabricRef].forEach(ref => {
      const c = ref.current;
      const el = (c as any)?.lowerCanvasEl as HTMLCanvasElement | undefined;
      if (c && !(c as any).disposed && el && el.isConnected) { c.clear(); c.renderAll(); }
    });
  ```

### 4. `client/src/features/SurgeryModal.tsx` — fix hooks order
Move the two `useState` calls above `if (!open) return null;`:
```ts
export const SurgeryModal: React.FC<Props> = ({ ... }) => {
  const [activeSurgeryId, setActiveSurgeryId] = useState<string | null>(...);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  if (!open) return null;
  // ... rest unchanged
};
```

## Verification
- `cd client && npx tsc -b && npx vite build`
- `cd api && npm run build`
- Manual: open Surgery form, type in several fields, confirm saves return 200 (not 413) and no `clearRect`/hook errors in console; switch tabs back to Diagram canvases and click Clear All without error.