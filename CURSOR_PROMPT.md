# Upmate: Wayk-lignende vekkerklokke-app (iOS, Expo), research + Cursor-prompt

## 1. Hva Wayk er

**Wayk: Alarm Clock to Wake Up** (Dialed Labs Inc.) er en «mission alarm»: alarmen stopper ikke før du har fullført et oppdrag.

- **Eksempler på oppdrag:** pushups, re opp sengen, ta bilde av himmelen. Appen sjekker med kamera at oppdraget faktisk er gjort.
- **Forretningsmodell:** gratis å laste ned, men full funksjon krever et abonnement etter en gratis prøveperiode. Ifølge en konkurrent koster det rundt $9.99 per måned og $19.99–59.99 per år.
- **Onboarding:** svært lang, i quiz-stil (rundt 100 skjermer), med paywall til slutt. Appen omsetter rundt $75k i måneden.
- **Krav:** iOS 17+, og appen er cirka 275 MB, noe som tyder på at ML-modeller er bygd inn i appen.

**Konkurrent å følge med på:** *WakeMate* (Groove Logic, lansert mai 2026) er en sosial alarmapp der venner setter alarmer for hverandre. Den har gratis 1 venn, akkurat som Upmate. Sjekk om den har oppdrag med kamerasjekk. Hvis ikke, er kombinasjonen oppdrag + buddy det som skiller Upmate ut.

## 2. Det vanskeligste er å få alarmen til å ringe på iOS

iOS lar ikke tredjepartsapper styre en alarm fritt. Det finnes tre måter å gjøre det på:

| Metode | iOS-versjon | Fordeler | Ulemper |
|---|---|---|---|
| **AlarmKit** (Apple, WWDC 2025) | 26+ | Ekte systemalarm: ringer gjennom lydløs modus og Fokus, viser fullskjerm på låseskjermen og i Dynamic Island | Krever en egen native Swift-modul og en Widget/Live Activity-extension. Du kan ikke hindre brukeren i å trykke «Stopp». |
| **Lokale varsler med lyd**, lenket etter hverandre | Alle versjoner | Enkelt å lage med `expo-notifications` | Lyden varer maks 30 sekunder, og varslene ringer ikke i lydløs modus eller Fokus. Du må planlegge mange varsler etter hverandre for å «mase». |
| **Critical Alerts** | Alle versjoner | Ringer gjennom lydløs modus | Krever at Apple godkjenner en egen tillatelse (entitlement). Det får en vekkerklokke-app nesten aldri. |

**Anbefaling:** Bruk AlarmKit på iOS 26+ og lenkede varsler som reserve på iOS 17–25. Når brukeren trykker «Stopp», åpnes appen rett i oppdraget. Hvis oppdraget ikke blir fullført innen 1–2 minutter, planlegger appen en ny alarm. Det er slik du håndhever oppdraget i praksis, for selve stoppknappen kan ingen blokkere.

## 3. Hvorfor Expo fortsatt fungerer, men ikke Expo Go

Dere har brukt Expo før, og kan fortsette med det, men da med **development builds** (EAS Build) i stedet for Expo Go:

- **AlarmKit:** det finnes ingen ferdig, moden Expo-pakke. `expo-alarm` har bare en plassholder for AlarmKit. Lag derfor en lokal Expo-modul i Swift (`npx create-expo-module --local`).
- **Live Activity og Widget-extension:** bruk `@bacons/apple-targets` med en config plugin. AlarmKit trenger dette for nedtellingen og Dynamic Island-visningen.
- **Kamera-oppdrag:** bruk `react-native-vision-camera` og Apple Vision-rammeverket via den samme native modulen. Vision har `VNDetectHumanBodyPoseRequest` for pushups/squats, `VNClassifyImageRequest` for å kjenne igjen himmel og seng, og `VNGenerateImageFeaturePrintRequest` for å sammenligne med et referansebilde.
- **Abonnement:** RevenueCat (`react-native-purchases` og `react-native-purchases-ui`). Superwall er et alternativ hvis dere vil A/B-teste paywallen.

## 4. Hva dere trenger

- Apple Developer Program ($99 i året) og en EAS-konto. Det er greit å ha en Mac med Xcode 26 for å feilsøke Swift-koden.
- En **fysisk iPhone med iOS 26**. Alarmer og kamera kan ikke testes ordentlig i simulatoren.
- App Store Connect med abonnementsprodukter og en introduksjonstilbud med gratis prøveperiode, i tillegg til personvernetiketter (kamera, bevegelse).
- Egne lyder (.caf/.wav under 30 sekunder for varsler) og eget navn og design. **Ikke kopier Wayks navn, ikon eller grafikk.**
- Et realistisk anslag for MVP er 6–10 uker for én erfaren utvikler, der AlarmKit og kamera-oppdragene er det mest risikable. Buddy-funksjonen legger til 1–2 uker.
- For Buddy-funksjonen: et Supabase-prosjekt (gratisnivået holder i starten), et eget domene for invitasjonslenker og to iPhoner til testing.

---

## 5. Cursor-prompt (lim inn i Cursor Agent)

> Prompten er på engelsk fordi Cursor og kodekommentarer fungerer best slik. Appen heter **Upmate**. Bytt ut `<domain>` når dere har kjøpt domenet (f.eks. upmate.app).

```text
You are a senior React Native / Expo + Swift engineer. Build an iOS-first "mission alarm" app called **Upmate** (get *up* with your *mate*): the alarm only stops once the user completes a wake-up mission (e.g. push-ups verified by camera, photographing the sky, scanning a QR code in the bathroom, solving math). Its key differentiator is the **Wake-up Buddy**: friends who are notified whether you actually got up, can wake you remotely, and share a streak with you. Work in phases, and stop after each phase so I can test on a real device. Don't skip ahead.

## Tech stack (do not deviate without asking)
- Latest stable Expo SDK, TypeScript strict, expo-router (file-based routing), New Architecture.
- Development builds via EAS (eas.json with development / preview / production profiles). Never rely on Expo Go.
- iOS deployment target 17.0. AlarmKit features are gated at runtime on iOS 26+.
- State: zustand + react-native-mmkv for persistence. Data: alarms, missions, wake-up history, streaks.
- UI: react-native-reanimated, expo-haptics, expo-blur, expo-linear-gradient. Dark, bold, playful design. Support Dynamic Type.
- Subscriptions: react-native-purchases + react-native-purchases-ui (RevenueCat). Entitlement id "pro".
- Backend (Buddy feature only; the alarm itself must work fully offline): Supabase (Sign in with Apple, Postgres with Row Level Security, Edge Functions, pg_cron). Client: @supabase/supabase-js + expo-apple-authentication.
- Remote push: expo-notifications + Expo Push Service, sent only from Edge Functions.
- Analytics: PostHog (posthog-react-native), behind a small `analytics.ts` wrapper.
- Camera: react-native-vision-camera. Sensors: expo-sensors (Pedometer, Accelerometer).
- Notifications fallback: expo-notifications with custom bundled sounds (<30s .caf).
- Native code: a LOCAL Expo module at `modules/alarm-kit` (Swift, Expo Modules API) and a widget/Live Activity target via `@bacons/apple-targets` in `targets/alarm-widget`.
- App name "Upmate", URL scheme `upmate`, bundle id `com.<team>.upmate`.
- Lint/format: eslint (expo config) + prettier. Tests: jest + @testing-library/react-native for pure logic.

## Architecture
- `src/features/alarms`: alarm model, scheduler abstraction, repeat rules (weekdays), snooze rules.
- `src/features/missions`: one folder per mission type, each implementing:
  `interface Mission { id; title; icon; difficulty: 1|2|3; requiresPro: boolean; component: React.FC<{ onComplete(): void; onFail?(): void; config }> }`
- `src/features/paywall`, `src/features/onboarding`, `src/features/stats`, `src/features/buddy`.
- `supabase/` folder with migrations, RLS policies, seed and Edge Functions (checked in, deployable with the Supabase CLI).
- `AlarmScheduler` interface with two implementations, chosen at runtime:
  1. `AlarmKitScheduler` (iOS 26+): calls the native module.
  2. `NotificationScheduler` (iOS 17–25 fallback): schedules a chain of up to ~60 local notifications 30s apart with a loud custom sound, cancelled the moment the mission is completed.

## Native module `modules/alarm-kit` (Swift)
- Info.plist: `NSAlarmKitUsageDescription` (add via config plugin), plus camera and motion usage strings.
- Expose to JS:
  `isSupported(): boolean`, `requestAuthorization(): Promise<'authorized'|'denied'|'notDetermined'>`,
  `scheduleAlarm({ id, hour, minute, weekdays[], title, soundName, snoozeMinutes? }): Promise<void>`,
  `scheduleOneOff({ id, date, ... })`, `cancel(id)`, `listScheduled()`,
  and an event `onAlarmStateChange({ id, state: 'scheduled'|'countdown'|'paused'|'alerting' })` backed by `AlarmManager.shared.alarmUpdates`.
- Use `AlarmManager.AlarmConfiguration` with `AlarmPresentation.Alert` (stop button labelled "Start mission").
- The stop intent must be an AppIntent with `openAppWhenRun = true` that deep-links to `upmate://mission/<alarmId>`. Also add a secondary snooze button only if the alarm allows snooze.
- Verify every AlarmKit API name against the iOS 26 SDK in Xcode before using it (`stopIntent`/`secondaryIntent` vs `secondaryButtonBehavior`). Don't guess.
- Also add a Swift `VisionHelper` in the same module:
  `classifyImage(uri) -> [{label, confidence}]` (VNClassifyImageRequest),
  `featurePrintDistance(uriA, uriB) -> number` (VNGenerateImageFeaturePrintRequest),
  and a VisionCamera frame-processor plugin `detectBodyPose(frame)` returning key joints (VNDetectHumanBodyPoseRequest).

## Mission enforcement (important: iOS cannot block the stop button)
- When an alarm fires and the user taps stop, the app opens on the mission screen (full-screen, no back gesture, keeps the alarm sound looping with expo-av/expo-audio while the app is in the foreground and the screen awake via expo-keep-awake).
- On alarm fire, immediately schedule a "nag" backup alarm +2 min. Cancel it only when the mission completes. If the user leaves the app, the backup rings again.
- Log every wake-up: fired time, mission completed time, attempts, snoozes. This feeds streaks and stats.
- If the user has buddies, every wake-up is also synced to the backend (queued offline, retried later). A missing network must never block or delay the alarm or the mission.

## Missions for the MVP
1. Math (free): N problems, difficulty-scaled.
2. Push-ups / squats (pro): VisionCamera + body pose. Count reps from shoulder/hip vertical displacement with hysteresis. Show the live rep counter and a skeleton overlay.
3. Photo mission (pro): "photograph the sky" (classifier labels like sky/cloud above threshold) OR "photograph your made bed / bathroom sink" (user takes a reference photo during setup, then the morning photo must be within feature-print distance threshold).
4. QR/barcode scan (free): user registers a code (e.g. toothpaste barcode) during setup. Use VisionCamera's code scanner.
5. Steps (pro): walk N steps (Pedometer).
6. Shake (free): N shakes (Accelerometer).
Every mission has a "Can't do it" emergency path that requires a long delay (e.g. 60s hold) and is logged, so users never get stuck.

## Wake-up Buddy (key differentiator)
Purpose: iOS can't block the stop button, so add a social consequence that can't be bypassed.
- Data model (Postgres, RLS so users only see their own rows and their buddies' wake events):
  - `profiles(id, display_name, avatar_emoji, push_token, timezone)`
  - `buddy_pairs(id, user_a, user_b, status: pending|active, created_at)`. Free: 1 active buddy. Pro: up to 5 (a "squad").
  - `wake_events(id, user_id, alarm_id, scheduled_for, deadline, fired_at, completed_at, mission_type, mission_summary, status: pending|done|missed|excused)`
  - `buddy_streaks(pair_id, current, best, last_success_date)`
- Pairing: invite via universal link `https://<domain>/invite/<code>` or QR (expo-linking + associated domains). Accepting creates an active pair. Buddies can be removed instantly from Settings.
- Deadline: per alarm, an optional "Be up by" time (default alarm time + 15 min). When the alarm is scheduled for the day, insert a `pending` wake_event with that deadline.
- On mission complete: mark the event `done`. The Edge Function `notify-buddies` pushes "<name> is up ✅ 06:32 · 15 push-ups" to buddies.
- Missed: a pg_cron job every minute runs `check-deadlines`, marks overdue events as `missed` and pushes "<name> is still in bed 😴" to buddies with a "Wake them up" action button (notification category).
- "Wake them up": calls the Edge Function `poke`, rate-limited to 1 per 3 min per pair and max 5 per morning. It sends a time-sensitive push (`interruptionLevel: timeSensitive`; add the Time Sensitive Notifications entitlement via config plugin) with a loud sound. When the sleeper opens it, the app opens the mission runner and schedules a new AlarmKit alarm +1 min.
- The "Can't do it" emergency path marks the event `excused` and tells buddies honestly ("<name> skipped today").
- Shared streak: increments only when both buddies are `done` on days they both had an alarm. Show it on Home, on a Buddy screen (today's status for each buddy, live via Supabase Realtime) and in the widget.
- Privacy: share only name, time and mission type. Photos never leave the device. Add in-app account deletion (App Review 5.1.1(v)), and a block/report option.
- Sign-in is only required when the user turns on Buddy. Everything else works without an account.

## Screens
- Onboarding (long quiz-style funnel, ~15–25 screens): goals (wake earlier, stop snoozing, morning routine), current wake time, snooze habit, target wake time, pick first mission, "Who should keep you honest?" (invite a buddy, skippable), permission primers (notifications/AlarmKit, camera, motion) BEFORE the system prompts, a "your plan" summary, then the paywall with a free-trial CTA. Track each step in analytics.
- Home: next alarm countdown, list of alarms (toggle, edit, delete), streak badge.
- Alarm editor: time, repeat days, label, sound, mission(s) + difficulty, snooze on/off.
- Mission runner (deep-link target).
- Buddy: today's status for each buddy, shared streak, invite button, "Wake them up" button when a buddy has missed.
- Stats: streak, average wake-up delay, mission success rate (simple charts).
- Settings: account (sign in/out, delete account), buddies (remove, block), subscription management/restore, sounds, test alarm (fires in 10 s), privacy, support.

## Paywall rules
- RevenueCat offering with weekly/annual (annual with free trial). Restore purchases button. Clear trial terms text (App Store Review Guideline 3.1.2).
- Free tier: 1 alarm, math/QR/shake missions, 1 buddy. Pro: unlimited alarms, camera missions, stats, buddy squads (up to 5).

## Phases (stop after each one and give me a test checklist)
1. Scaffold: Expo app, router, theming, eslint/prettier, EAS config, state + persistence, alarm CRUD UI with mock scheduler.
2. NotificationScheduler fallback + mission runner + math/shake missions + deep link handling, end to end on device.
3. Local Expo module with AlarmKit + widget target, runtime switch between schedulers, nag-backup logic.
4. Camera missions (VisionCamera + Vision helpers): QR, photo, push-ups.
5. Wake-up Buddy: Supabase project + migrations/RLS, Sign in with Apple, invite links, wake_event sync, Edge Functions (notify-buddies, check-deadlines, poke), push + time-sensitive entitlement, Buddy screen, shared streak. Test with two physical iPhones.
6. Onboarding funnel (incl. buddy invite step) + RevenueCat paywall + analytics.
7. Stats/streaks, settings, app icon/splash, App Store prep (privacy manifest PrivacyInfo.xcprivacy, usage strings, screenshots list).

## Constraints
- Never reference or copy the "Wayk" name, assets, or copy text. Original branding only.
- Keep native code minimal and documented. Every native API must be wrapped in a typed TS module with graceful fallback when unsupported.
- No secrets in the repo. Only the Supabase anon key may ship in the app; the service role key lives in Edge Function secrets. RevenueCat/PostHog/Supabase keys come from `app.config.ts` + EAS env vars.
- Write a README with how to run a dev build on a physical iPhone and how to test alarms quickly.
```

## Kilder
- Wayk-oppføring og -data: [screensdesign.com](https://screensdesign.com/apps/wayk-alarm-clock-to-wake-up/), [AppBrain](https://www.appbrain.com/appstore/wayk-alarm-clock-to-wake-up/ios-6758021281), [mwm.ai](https://mwm.ai/apps/wayk-wake-up-early/6758021281), [Google Play](https://play.google.com/store/apps/details?id=mg.WaykUp&hl=en_US), [Mornio-anmeldelse (konkurrent)](https://mornioapp.com/guides/wayk-review)
- AlarmKit: [Nil Coalescing – Countdown timer with AlarmKit](https://nilcoalescing.com/blog/CountdownTimerWithAlarmKit/), [axiom AlarmKit ref](https://skills.cat/skills/charleswiltgen/axiom/axiom-alarmkit-ref)
- Expo og alarmer: [expo-alarm (AlarmKit er bare en plassholder)](https://github.com/vall370/expo-alarm), [expo-alarm-module](https://npmjs.com/package/expo-alarm-module)
