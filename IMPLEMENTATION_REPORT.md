# تقرير التنفيذ — تحدي مشلي الخريف

> **تاريخ التقرير:** 11 يوليو 2026  
> **الغرض:** توثيق ما تم بناؤه حالياً لمراجعة سبب عدم تطابق الخط والتصميم وإحساس اللعب مع الاتجاه المطلوب.  
> **ملاحظة:** هذا التقرير وصفي فقط — لم يُجرَ أي تعديل على الكود.

---

## 1. الملخص التنفيذي (Executive Summary)

### ماذا تم بناؤه؟

تم بناء **لعبة ويب تفاعلية** باسم **«تحدي مشلي الخريف»** باستخدام:

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (لحركة التأرجح والسقوط)

اللعبة عبارة عن mini-game بثيم **خريف صلالة (Khareef Salalah)**: جوزة/مشلي معلّقة تتأرجح، واللاعب يمرّر إصبعه (swipe) لقطعها حتى يصل التقدم إلى 100%، ثم تسقط وتنتقل لمرحلة تالية.

### مسار اللعب الحالي (Current Game Flow)

```
شاشة البداية (StartScreen)
    ↓  [ابدأ اللعب]
شاشة اللعب (GameStage) — تبدأ تلقائياً عند الدخول
    ↓  swipe على الجوزة
تقدم القطع يزيد (0% → 100%)
    ↓  عند 100%
سقوط الجوزة (drop animation) → نافذة إكمال المرحلة (LevelCompleteModal)
    ↓  [المرحلة التالية]
مرحلة جديدة بصعوبة أعلى
    ↓  عند تجاوز maxMisses
نافذة انتهاء اللعبة (GameOverModal) → [العب مرة ثانية]
    ↓  أو
زر [رجوع] → العودة لشاشة البداية
```

### ما يعمل حالياً؟

| الميزة | الحالة |
|--------|--------|
| شاشة بداية عربية RTL | ✅ |
| حركة تأرجح pendulum للجوزة | ✅ |
| اكتشاف swipe وخط القطع | ✅ |
| collision detection بين الخط والجوزة | ✅ |
| شريط تقدم القطع (cutProgress) | ✅ |
| نظام نقاط وجودة القطع (clean/edge/weak) | ✅ |
| عداد أخطاء (misses) و game over | ✅ |
| مراحل متعددة مع صعوبة متزايدة | ✅ |
| حفظ أفضل نتيجة في `localStorage` | ✅ |
| تأثيرات مطر وضباب وأوراق (CSS) | ✅ |
| سقوط الجوزة عند إكمال المرحلة | ✅ |
| تصميم mobile-first (`dvh`, `touch-action: none`) | ✅ |

### ما لم يُنفَّذ بعد؟

| الميزة | الحالة |
|--------|--------|
| شجرة جوز حقيقية/مرسومة في مشهد اللعب | ❌ |
| جبال خضراء في الخلفية | ❌ |
| صور/أصول فنية (assets) حقيقية | ❌ |
| تأثيرات رياح متقطعة (`windGusts`) | ❌ (مُعرَّفة في الكود لكن غير مستخدمة) |
| اختفاء تدريجي لخطوط القطع (`SLASH_FADE_MS`) | ❌ (ثابت موجود لكن غير موصول) |
| Leaderboard / قاعدة بيانات | ❌ (غير مطلوب) |
| صوتيات (SFX / موسيقى) | ❌ |
| اهتزاز haptic feedback | ❌ |
| شاشة تعليمات / onboarding | ❌ |
| انتقالات سينمائية بين الشاشات | ❌ |
| رسوم قطع متقدمة على الجوزة | ⚠️ جزئي (3 خطوط SVG بسيطة فقط) |

---

## 2. الملفات المُنشأة / المُعدَّلة (Files Created / Modified)

### طبقة التطبيق (App Layer)

#### `app/layout.tsx`
- **الوظيفة:** الـ root layout للتطبيق.
- **المكوّنات الرئيسية:**
  - تحميل خط **Cairo** عبر `next/font/google`
  - تعيين `lang="ar"` و `dir="rtl"`
  - `metadata` بعنوان «تحدي مشلي الخريف»
  - `viewport` مع `maximumScale: 1` و `userScalable: false` (مناسب للموبايل)
- **سبب الإنشاء:** إعداد اللغة العربية والخط والـ SEO.
- **الربط:** يغلّف كل الصفحات عبر `app/page.tsx`.

#### `app/page.tsx`
- **الوظيفة:** نقطة الدخول الرئيسية — يدير التنقل بين شاشتين.
- **المكوّنات الرئيسية:**
  - `screen` state: `"start" | "playing"`
  - `bestScore` من `localStorage`
  - `handleStart` / `handleExit`
- **سبب الإنشاء:** فصل شاشة البداية عن شاشة اللعب.
- **الربط:** يستخدم `GameShell`، `StartScreen`، `GameStage`، `RainEffect`، `FogOverlay`.

#### `app/globals.css`
- **الوظيفة:** أنماط عامة، متغيرات ألوان Khareef، و keyframes للحركات.
- **المكوّنات الرئيسية:**
  - CSS variables: `--khareef-deep`, `--khareef-green`, `--coconut-brown`, إلخ
  - `@theme inline` لربط الألوان بـ Tailwind
  - animations: `rain`, `fog-drift`, `leaf-sway`, `score-pop`
  - `touch-action: none` على `body`
- **سبب الإنشاء:** توحيد الثيم البصري وحركات الخلفية.
- **الربط:** يُستورد من `layout.tsx`؛ تستخدمه كل المكوّنات عبر classes مثل `bg-khareef-deep`.

---

### طبقة التخطيط (Layout)

#### `components/layout/GameShell.tsx`
- **الوظيفة:** غلاف fullscreen للعبة.
- **المكوّنات:** `div` بـ `h-dvh`, `overflow-hidden`, `touch-none`, `bg-khareef-deep`.
- **سبب الإنشاء:** ضمان أن اللعبة تأخذ الشاشة كاملة على الموبايل.
- **الربط:** يغلّف المحتوى في `app/page.tsx`.

---

### مكوّنات اللعبة (Game Components)

#### `components/game/StartScreen.tsx`
- **الوظيفة:** شاشة البداية — عنوان، جوزة توضيحية، أفضل نتيجة، زر البدء.
- **المكوّنات:**
  - تاج شجرة CSS (دوائر `rounded-full` خضراء)
  - عنوان «تحدي مشلي الخريف»
  - جوزة placeholder من CSS gradient (ليست SVG)
  - `Button` → `onStart`
- **سبب الإنشاء:** نقطة دخول المستخدم.
- **الربط:** يُعرض من `app/page.tsx` عند `screen === "start"`.

#### `components/game/GameStage.tsx`
- **الوظيفة:** المشهد الرئيسي للعب — يجمع كل شيء.
- **المكوّنات:**
  - `useGameEngine()` — منطق اللعب
  - معالجات `onPointerDown/Move/Up` للـ swipe
  - `coconutRef` لـ `getBoundingClientRect()`
  - HUD: `MissCounter`, `LevelBadge`, `ScoreBoard`, `CutProgress`
  - `HangingCoconut`, `SlashLayer`, modals
  - خلفية gradient + `RainEffect` + `FogOverlay` + `LeavesOverlay`
- **سبب الإنشاء:** مركز تجربة اللعب.
- **الربط:** يُستدعى من `app/page.tsx` عند `screen === "playing"`.

#### `components/game/HangingCoconut.tsx`
- **الوظيفة:** الجوزة المعلّقة مع حركة التأرجح والسقوط.
- **المكوّنات:**
  - `motion.div` من Framer Motion
  - حبل/ساق: `div` gradient رفيع (`w-0.5 h-16`)
  - جوزة SVG: `ellipse` + `radialGradient` + خطوط قطع مرحلية
  - `cutStage` (0–3) حسب `cutProgress`
  - `forwardRef` لربط hitbox
- **سبب الإنشاء:** العنصر المركزي التفاعلي.
- **الربط:** يستقبل قيم من `useGameEngine` state؛ ref يُمرَّر لـ collision.

#### `components/game/SlashLayer.tsx`
- **الوظيفة:** رسم خطوط القطع فوق المشهد.
- **المكوّنات:**
  - SVG fullscreen overlay
  - `slashGlow` filter
  - خطوط مكتملة (ذهبي `#FACC15`, opacity 0.6)
  - خط نشط أثناء السحب (أبيض كريمي `#FFF7E6`)
- **سبب الإنشاء:** feedback بصري للـ swipe.
- **الربط:** يقرأ `slashLines` و `activeSlash` من engine state.

#### `components/game/CutProgress.tsx`
- **الوظيفة:** شريط تقدم القطع 0–100%.
- **المكوّنات:** label «تقدم القطع» + bar gradient ذهبي/أخضر.
- **الربط:** `progress={state.cutProgress}`.

#### `components/game/ScoreBoard.tsx`
- **الوظيفة:** عرض النقاط الحالية في HUD.

#### `components/game/LevelBadge.tsx`
- **الوظيفة:** عرض رقم المرحلة «المرحلة {level}».

#### `components/game/MissCounter.tsx`
- **الوظيفة:** نقاط حمراء/رمادية تمثل الأخطاء المتبقية.

#### `components/game/LevelCompleteModal.tsx`
- **الوظيفة:** نافذة عند إكمال المرحلة.
- **المكوّنات:** emoji 🥥، «الجوزة طاحت!»، مكافأة، زر «المرحلة التالية».
- **الربط:** `open={state.status === "levelComplete" && !state.isDropping}`.

#### `components/game/GameOverModal.tsx`
- **الوظيفة:** نافذة عند انتهاء اللعبة.
- **المكوّنات:** النتيجة، أفضل نتيجة، المرحلة، «رقم قياسي جديد»، «العب مرة ثانية».

#### `components/game/RainEffect.tsx`
- **الوظيفة:** 30 قطعة مطر CSS (`w-px` خطوط زرقاء) مع `animate-rain`.

#### `components/game/FogOverlay.tsx`
- **الوظيفة:** طبقات ضباب gradient + blur مع `animate-fog-drift`.

#### `components/game/LeavesOverlay.tsx`
- **الوظيفة:** 4 أوراق CSS (`rounded-full` خضراء) في أعلى الشاشة مع `animate-leaf-sway`.

---

### مكوّنات UI عامة

#### `components/ui/Button.tsx`
- **الوظيفة:** زر قابل لإعادة الاستخدام.
- **variants:** `primary` (ذهبي), `secondary` (أخضر), `ghost`.
- **الأنماط:** `rounded-2xl`, `px-8 py-4`, `font-bold`, `active:scale-95`.

#### `components/ui/Modal.tsx`
- **الوظيفة:** overlay مع backdrop blur.
- **ملاحظة:** يستخدم classes `animate-in fade-in zoom-in` — قد لا تعمل بدون plugin إضافي.

#### `components/ui/Card.tsx`
- **الوظيفة:** بطاقة زجاجية للنوافذ المنبثقة (`backdrop-blur-md`, `border-white/20`).

---

### منطق اللعب (Game Logic)

#### `lib/hooks/useGameEngine.ts`
- **الوظيفة:** محرك اللعب المركزي — `useReducer` لإدارة الحالة.
- **المكوّنات:**
  - `gameReducer` — يعالج كل الأحداث
  - `createInitialState`, `applyDifficulty`
  - actions: `START_GAME`, `POINTER_DOWN/MOVE/UP`, `NEXT_LEVEL`, `DROP_COMPLETE`, `CLEAR_SLASH_LINES`
  - exports: handlers + state
- **سبب الإنشاء:** فصل منطق اللعب عن العرض.
- **الربط:** يُستهلك حصرياً من `GameStage`.

#### `lib/game/types.ts`
- **الوظيفة:** TypeScript types — `GameState`, `GameAction`, `DifficultyConfig`, `CutQuality`, `SlashLine`, `Point`.

#### `lib/game/constants.ts`
- **الوظيفة:** ثوابت — `MIN_SWIPE_LENGTH`, `SLASH_FADE_MS`, `DROP_DURATION_MS`, `STORAGE_KEYS`.

#### `lib/game/difficulty.ts`
- **الوظيفة:** `calculateDifficulty(level)` — يُرجع إعدادات كل مرحلة.

#### `lib/game/collision.ts`
- **الوظيفة:** هندسة التصادم.
- **المكوّنات:**
  - `HIT_PADDING = 12`
  - `lineIntersectsRect` — تقاطع خط مع مستطيل موسَّع
  - `pointInRect`, `getSwipeLength`, `calculateDistanceFromCenter`

#### `lib/game/scoring.ts`
- **الوظيفة:** حساب الضرر والنقاط.
- **المكوّنات:**
  - `calculateCutDamage` — ضرر حسب طول swipe وقرب المركز
  - `calculateSlashScore` — نقاط القطعة
  - `calculateLevelCompleteBonus` — مكافأة إكمال المرحلة
  - `calculateMissPenalty` — خصم 20 نقطة

#### `lib/game/storage.ts`
- **الوظيفة:** `localStorage` لأفضل نتيجة (`khareef_best_score`).

---

## 3. التصميم البصري / UI الحالي (Current UI / Visual Design)

### الخط المستخدم (Font)

| البند | القيمة |
|-------|--------|
| الخط | **Cairo** من Google Fonts |
| التحميل | `next/font/google` في `app/layout.tsx` |
| الأوزان | `400`, `700`, `900` |
| المتغير | `--font-cairo` على عنصر `<html>` |
| التطبيق | `font-family: var(--font-cairo), Arial, sans-serif` في `globals.css` |
| Tailwind | `--font-sans: var(--font-cairo)` في `@theme inline` |

**ملاحظة:** `<body>` لا يحمل class `font-sans` صراحةً — يعتمد على CSS في `globals.css` مباشرة.

### لوحة الألوان الحالية (Color Palette)

| الاسم | القيمة | الاستخدام |
|-------|--------|-----------|
| `khareef-deep` | `#163D2C` | خلفية أساسية |
| `khareef-green` | `#4A7C59` | أوراق، شارات |
| `khareef-mist` | `#A8D5BA` | نصوص ثانوية، ضباب |
| `khareef-cream` | `#FFF7E6` | نصوص رئيسية |
| `coconut-brown` | `#7A4E2D` | الجوزة |
| `coconut-light` | `#A0714F` | إضاءة الجوزة |
| `rain-blue` | `#8EC5D6` | قطرات المطر |
| `gold` | `#FACC15` | أزرار، خطوط قطع، نقاط |
| `warning-red` | `#EF4444` | أخطاء |

### نمط الخلفية (Background Style)

- **Gradient عمودي:** `from-[#1a4a35] via-khareef-deep to-[#0f2a1e]`
- **طبقة أرضية:** `h-1/3` gradient أخضر شفاف من الأسفل (في `GameStage` فقط)
- **مطر:** 30 خط عمودي CSS متحرك
- **ضباب:** gradients شفافة + `blur-2xl` / `blur-3xl`
- **أوراق:** 4 أشكال `rounded-full` في الأعلى
- **لا توجد:** صور جبال، صور شجر، أو panorama

### نمط الأزرار (Button Style)

- `rounded-2xl`, padding كبير
- Primary: خلفية ذهبية `bg-gold`، نص أخضر داكن
- `shadow-lg`, `active:scale-95`
- بدون أيقونات أو texture

### نمط النوافذ المنبثقة (Modal Style)

- Overlay: `bg-black/60 backdrop-blur-sm`
- Card: `rounded-3xl`, `bg-khareef-deep/80`, `backdrop-blur-md`
- محتوى نصي مركزي + emoji 🥥
- بدون illustration مخصصة

### نمط الجوزة / الشجرة (Coconut / Tree Visual Style)

| العنصر | التنفيذ |
|--------|---------|
| الشجرة في اللعب | **غير موجودة** — فقط حبل رفيع + أوراق CSS في الأعلى |
| الجوزة | SVG inline بسيط: `ellipse` بني + highlight + 3 خطوط texture |
| الساق/الحبل | `div` gradient (`from-khareef-green to-amber-800`) |
| علامات القطع | 3 خطوط SVG بيضاء/ذهبية تظهر عند 15% / 40% / 75% |
| شاشة البداية | جوزة CSS `rounded-full` gradient (مختلفة عن SVG اللعب) |

### تأثيرات المطر / الضباب / الأوراق

| التأثير | التقنية | التقييم |
|---------|---------|---------|
| المطر | 30 `div` بـ `animate-rain` | بسيط، خطوط رفيعة |
| الضباب | gradients + blur + drift animation | خفيف |
| الأوراق | `rounded-full` ملونة + sway | placeholder وليس أوراق حقيقية |

### الأصول: صور حقيقية vs CSS/SVG

| العنصر | النوع |
|--------|-------|
| الجوزة في اللعب | **SVG inline** (كود) |
| الجوزة في البداية | **CSS gradient** |
| الشجرة | **CSS shapes** (دوائر) |
| الأوراق | **CSS shapes** |
| المطر | **CSS divs** |
| الضباب | **CSS gradients** |
| الخلفية | **CSS gradients** |
| صور في `public/` | فقط أيقونات Next الافتراضية (`next.svg`, `vercel.svg`, …) — **غير مستخدمة في اللعبة** |

---

## 4. آليات اللعب الحالية (Current Gameplay Mechanics)

### كيف تتحرك الجوزة؟

- تُعلَّق من أعلى المشهد (`absolute top-0 left-1/2`).
- `motion.div` من Framer Motion يُطبّق `rotate: [-swingAmplitude, swingAmplitude]`.
- `transformOrigin: "top center"` — التأرجح من نقطة التعليق.
- `repeat: Infinity`, `repeatType: "reverse"`, `ease: "easeInOut"`.

### كيف يُنفَّذ تأرجح البندول (Pendulum Swing)؟

- **ليس فيزياء pendulum حقيقية** — مجرد oscillation خطي في الزاوية عبر Framer Motion.
- لا يوجد `:sin(time)` يدوي — Framer يُ interpol بين `-amplitude` و `+amplitude`.
- `swingSpeed` = **مدة دورة نصف التأرجح بالثواني** (`duration` في transition) — **كلما قلّ الرقم، زادت السرعة**.

### قيم swingSpeed

| المرحلة | swingSpeed (ثوانٍ) |
|---------|-------------------|
| 1 | 2.8 |
| 2 | 2.2 |
| 3 | 1.8 |
| 4 | 1.5 |
| 5+ | 1.2 |

### قيم swingAmplitude (بالدرجات)

| المرحلة | swingAmplitude |
|---------|----------------|
| 1 | 12° |
| 2 | 15° |
| 3 | 18° |
| 4 | 20° |
| 5+ | 22° |

### كيف تؤثر المراحل على الحركة؟

| المعامل | التغيير مع المرحلة |
|---------|-------------------|
| `swingSpeed` | يقل (أسرع) |
| `swingAmplitude` | يزيد (تأرجح أوسع) |
| `coconutScale` | يصغر قليلاً (0.9 عند 3، 0.85 عند 5) |
| `damageMultiplier` | يقل (قطع أصعب) |
| `maxMisses` | 5 → 4 (مرحلة 3) → 3 (مرحلة 5) |
| `windGusts` | `true` من مرحلة 4 — **لكن غير مُطبَّق بصرياً أو ميكانيكياً** |

### كيف يعمل اكتشاف الـ Swipe؟

1. `GameStage` يستمع لـ `onPointerDown/Move/Up/Cancel` على الـ container الكامل.
2. `setPointerCapture` عند الضغط.
3. `POINTER_DOWN` → يبدأ `activeSlash` بنقطة البداية.
4. `POINTER_MOVE` → يحدّث نقطة النهاية.
5. `POINTER_UP` → يُنهي السحب ويُقيّم القطع.

**لا يوجد:** حد أدنى لطول السحب لاعتباره swipe (يُحسب فقط في الضرر).

### كيف يُرسم خط القطع (Slash Line)؟

- أثناء السحب: خط أبيض كريمي `strokeWidth="4"` في `SlashLayer`.
- بعد الإفلات: يُضاف لـ `slashLines` (حد أقصى 6 خطوط).
- الخطوط القديمة: ذهبية `opacity="0.6"` مع `slashGlow` filter.
- **لا يوجد fade-out** — الخطوط تبقى حتى تُستبدل.

### كيف يعمل Collision Detection؟

1. عند `POINTER_UP`، يُؤخذ `coconutRef.getBoundingClientRect()`.
2. يُختبر `lineIntersectsRect(start, end, rect)`:
   - يوسّع المستطيل بـ `HIT_PADDING = 12px`.
   - يتحقق إن كانت البداية/النهاية داخل المستطيل.
   - أو إن تقاطع الخط مع أي ضلع من المستطيل.
3. إذا `coconutRect === null` → يُحسب miss.

### كيف يزيد cutProgress؟

```
newProgress = min(100, cutProgress + damage)
```

- `damage` من `calculateCutDamage()` — عادة بين ~5 و ~25+ حسب الجودة.
- عند `>= 100` → `status = "levelComplete"`, `isDropping = true`.

### كيف يُحسب الضرر (Damage)؟

```
length = مسافة بين start و end

إذا length < MIN_SWIPE_LENGTH (20px):
  damage = 5 × damageMultiplier, quality = "weak"

وإلا:
  mid = نقطة منتصف الخط
  proximity = 1 - (distFromCenter / maxDist)  // 0 إلى 1
  lengthFactor = min(length / 150, 1)
  damage = (8 + proximity × 22) × lengthFactor × damageMultiplier

  إذا proximity > 0.65 و length > 80:
    damage = max(damage, 25 × multiplier), quality = "clean"
  وإلا إذا proximity > 0.35:
    damage = max(damage, 12 × multiplier), quality = "edge"
  وإلا:
    damage = max(damage, 5 × multiplier), quality = "weak"
```

### كيف تُحسب الأخطاء (Misses)؟

- miss عند: لا تقاطع مع الجوزة، أو `coconutRect === null`.
- `missCount++`
- `score -= 20` (بحد أدنى 0)
- `lastCutQuality = "miss"`
- عند `missCount >= maxMisses` → `gameOver`

### كيف يحدث Game Over؟

- `status = "gameOver"`
- `saveLocalBestScore(score)` يُحفظ في localStorage
- `GameOverModal` يظهر مع النتيجة وأفضل نتيجة

### كيف يحدث Level Complete؟

1. `cutProgress` يصل 100.
2. `status = "levelComplete"`, `isDropping = true`.
3. Framer Motion: `{ y: 400, rotate: 45, opacity: 0 }` خلال 0.8 ثانية.
4. `onAnimationComplete` → `DROP_COMPLETE` → `isDropping = false`.
5. `LevelCompleteModal` يفتح عندما `levelComplete && !isDropping`.
6. «المرحلة التالية» → `NEXT_LEVEL` → يعيد `cutProgress` و `missCount` ويُطبّق صعوبة جديدة.

---

## 5. قيم اللعبة / الثوابت الحالية (Current Game Values / Constants)

### المرحلة 1

| الثابت | القيمة |
|--------|--------|
| swingSpeed | 2.8 ثانية |
| swingAmplitude | 12° |
| coconutScale | 1.0 |
| damageMultiplier | 1.0 |
| maxMisses | 5 |
| windGusts | false |

### جدول الصعوبة الكامل

| المرحلة | swingSpeed | swingAmplitude | scale | damageMult | maxMisses | windGusts |
|---------|-----------|----------------|-------|------------|-----------|-----------|
| 1 | 2.8 | 12 | 1.0 | 1.0 | 5 | false |
| 2 | 2.2 | 15 | 1.0 | 1.0 | 5 | false |
| 3 | 1.8 | 18 | 0.9 | 0.85 | 4 | false |
| 4 | 1.5 | 20 | 0.9 | 0.75 | 4 | true* |
| 5+ | 1.2 | 22 | 0.85 | 0.65 | 3 | true* |

*\*windGusts مُعرَّف لكن غير مُنفَّذ.*

### Hitbox Padding

- `HIT_PADDING = 12` بكسل (في `collision.ts`)

### نطاقات الضرر (Damage Ranges)

| الحالة | الضرر التقريبي |
|--------|----------------|
| weak (قصير/بعيد) | 5 × multiplier |
| edge | 12+ × multiplier |
| clean (مركز + swipe طويل) | 25+ × multiplier |
| أقصى نظري تقريباً | ~(8+22) × 1 × 1 ≈ 30 قبل التقريب |

### معادلة النقاط (Score Formula)

```
slashScore = round(damage × 10) + (level × 5)
  + 50 إذا clean
  + 15 إذا edge

levelCompleteBonus = 100 + (level × 50)

missPenalty = 20
```

### تقدم الصعوبة (Difficulty Progression)

- كل مرحلة: أسرع، أوسع تأرجح، أصغر جوزة، ضرر أقل، أخطاء أقل مسموحة.
- لا يوجد حد أقصى للمراحل — يستمر التصاعد من مرحلة 5 فصاعداً بنفس قيم 5.

### سلوك زيادة cutProgress

- تراكمي: كل قطعة ناجحة تضيف `damage`.
- يتطلب عادة **4–8 قطعات** نظيفة للوصول لـ 100% (حسب جودة السحب).
- قطعة weak قصيرة تضيف ~5 فقط → قد تحتاج 20+ قطعة.

### مدة خط القطع (Slash Line Duration)

- `SLASH_FADE_MS = 400` — **مُعرَّف لكن غير مستخدم**
- فعلياً: الخطوط تبقى حتى يصل العدد 6 ثم الأقدم يُحذف

### مدد الحركة (Animation Durations)

| الحركة | المدة |
|--------|-------|
| Pendulum swing | `swingSpeed` ثانية (2.8–1.2) |
| Drop | 0.8 ثانية (`easeIn`) |
| Cut progress bar | `transition-all duration-200` |
| Score pop feedback | 0.6 ثانية |
| Rain drop | 0.6–1.05 ثانية (متفاوت) |
| Fog drift | 8–10 ثانية |
| Leaf sway | 4–5 ثانية |
| Button press | 150ms |
| Modal (مُخطَّط) | `duration-200` |

---

## 6. المشاكل الحالية / نقاط الضعف المحتملة (Current Problems / Possible Weak Areas)

### لماذا قد يبدو الخط خاطئاً؟

1. **Cairo عام** — ليس خطاً playful/premium مخصصاً للألعاب؛ يشبه تطبيقات الويب أكثر من mini-game.
2. **أوزان محدودة** (400/700/900) — لا يوجد وزن 800 أو display font للعناوين.
3. **لا يوجد تخصيص typography** — لا letter-spacing عربي مدروس، لا أحجام responsive دقيقة.
4. **`tracking-widest` على `#خلاـ الخريف`** — قد يبدو غريباً بالعربية.
5. **نص فرعي فارغ** في `StartScreen` (سطر `<p>` بدون محتوى).
6. **README لا يزال يذكر Geist** — لكن التطبيق يستخدم Cairo (تناقض توثيقي).

### لماذا قد يبدو التصميم ضعيفاً أو غير مصقول؟

1. **لا توجد أصول فنية** — كل شيء CSS/SVG بدائي.
2. **لا شجرة حقيقية** في مشهد اللعب — فقط حبل رفيع.
3. **لا جبال** — عنصر أساسي في ثيم صلالة مفقود.
4. **الأوراق عبارة عن دوائر** — لا تشبه أوراق نخيل/جوز.
5. **الخلفية gradient مسطحة** — بدون عمق أو parallax.
6. **HUD generic** — بطاقات `bg-black/30` قياسية.
7. **Modal بسيط** مع emoji بدل illustration.
8. **تناقض بصري** بين جوزة البداية (CSS) وجوزة اللعب (SVG).

### لماذا قد يبدو اللعب غير مُرضٍ (unsatisfying)؟

1. **لا feedback قوي عند القطع** — فقط `+!` ذهبي بسيط.
2. **لا صوت ولا اهتزاز**.
3. **القطع لا يشعر بـ «شق» حقيقي** — خطوط SVG ثابتة على 3 مراحل فقط.
4. **السقوط بسيط** — translateY + rotate بدون فيزياء أو bounce.
5. **windGusts غير مُنفَّذ** — الرياح لا تؤثر فعلياً.
6. **قد تحتاج قطعات كثيرة** إذا كانت السحبات weak.

### هل الجوزة بسيطة جداً بصرياً؟

**نعم.** SVG ellipse بني مع 3 خطوط texture — بعيدة عن illustration احترافية أو sprite مفصّل.

### هل خط القطع أساسي جداً؟

**نعم.** خط SVG مستقيم بلون ذهبي — بدون particles، بدون trail، بدون fade، بدون تأثير «سكين».

### هل cut detection صارم جداً أم متساهلاً؟

**متساهل نسبياً:**
- `HIT_PADDING = 12px` يوسّع منطقة الإصابة.
- أي تقاطع خط مع المستطيل يكفي — لا يُشترط زاوية معينة.
- لكن **rect يتأرجح** — قد يشعر اللاعب أحياناً أن القطع أخطأ أو أصاب بشكل غير متوقع بسبب حركة hitbox.

### هل تقدم المراحل سريع أم بطيء؟

- **المراحل 1–2:** معتدلة (5 أخطاء، ضرر كامل).
- **من مرحلة 3:** يصبح أصعب بسرعة (ضرر أقل، 4 أخطاء).
- **مرحلة 5:** 3 أخطاء فقط + ضرر 0.65 — قفزة حادة.

### هل الـ UI عام جداً (generic)؟

**نعم.** يشبه dashboard/mobile app أكثر من لعبة موبايل مصقولة — أزرار Tailwind، بطاقات شفافة، بدون brand identity بصري قوي.

### هل قريب من إحساس اللعبة المرجعية (eid-knife-game)؟

**بعيد نسبياً.** البنية الأساسية (swing + slash + progress) موجودة، لكن الجودة البصرية والـ juice والشعور بالقطع والسقوط أضعف بكثير.

---

## 7. المقارنة مع الاتجاه المطلوب (Comparison With Intended Direction)

| المتطلب | التقييم | الملاحظات |
|---------|---------|-----------|
| جوزة/مشلي واحدة معلقة من شجرة جوز | **جزئياً** | جوزة موجودة لكن **لا شجرة** — حبل رفيع فقط |
| تأرجح pendulum بسبب رياح الخريف | **جزئياً** | تأرجح موجود لكن ليس فيزياء pendulum؛ `windGusts` غير مُنفَّذ |
| اللاعب يمرّر إصبعه عبرها | **منجز جيداً** | pointer events تعمل على كامل الشاشة |
| خط القطع يظهر بوضوح | **جزئياً** | يظهر لكن بسيط جداً بدون polish |
| كل قطعة ناجحة تزيد التقدم 0%→100% | **منجز جيداً** | `cutProgress` يعمل بشكل صحيح |
| عند 100% تسقط الجوزة بشكل مُرضٍ | **جزئياً** | سقوط موجود لكن بسيط — ليس satisfying |
| ثيم خريف صلالة: ضباب، مطر، جبال خضراء، نخيل | **جزئياً** | مطر+ضباب+أوراق CSS ✅ — **جبال ❌** — **نخيل/شجر حقيقي ❌** |
| واجهة عربية playful وpremium | **يحتاج تحسين** | عربية RTL ✅ — لكن الخط والتصميم أساسيان وليسا premium |

---

## 8. قائمة فحص لقطات الشاشة (Screenshots Checklist)

يُنصح بالتقاط هذه الشاشات للمراجعة (على متصفح موبايل أو DevTools بعرض iPhone):

| # | الشاشة | ماذا تُظهر للمراجع |
|---|--------|-------------------|
| 1 | **Start screen** | الخط، العنوان، جوزة CSS، زر البدء، الخلفية |
| 2 | **Game screen قبل swipe** | HUD، الجوزة SVG، الحبل، الخلفية، الأوراق |
| 3 | **Game screen أثناء swipe** | الخط النشط الأبيض، موقع الإصبع |
| 4 | **بعد قطع ناجح** | شريط التقدم، feedback الذهبي، خطوط القطع المتبقية |
| 5 | **Level complete** | نافذة «الجوزة طاحت!»، المكافأة |
| 6 | **Game over** | النتيجة، أفضل نتيجة، زر إعادة اللعب |
| 7 | **Mobile viewport** | الشاشة كاملة على 390×844 (أو جهاز فعلي) |
| 8 | **مرحلة 3+** | سرعة التأرجح الأعلى، حجم الجوزة الأصغر |
| 9 | **cutProgress ~50%** | مرحلة القطع الوسطى على الجوزة SVG |

**طريقة الالتقاط:**
```bash
npm run dev
# افتح http://localhost:3000
# DevTools → Toggle device toolbar → iPhone 14 Pro
```

---

## 9. الإصلاحات المُوصى بها (Recommended Next Fixes)

> **تنبيه:** هذه توصيات فقط — لم يُنفَّذ أي منها.

### الخط والطباعة العربية (Font and Arabic Typography)

1. استبدال أو دمج Cairo مع خط display عربي playful (مثل: **Lalezar**, **Changa**, **Tajawal Black** للعناوين).
2. إنشاء نظام typography: عنوان / فرعي / HUD / أرقام.
3. إزالة `tracking-widest` من النص العربي.
4. إضافة `font-sans` صراحة على `body` للاتساق مع Tailwind.
5. ملء النص الفارغ في `StartScreen` بنص توضيحي جذاب.

### التصميم البصري (Visual Design)

1. إضافة طبقة جبال SVG/صورة في الخلفية مع parallax خفيف.
2. توحيد شكل الجوزة بين Start screen و Game screen.
3. تصميم HUD بأسلوب لعبة (إطارات خشبية/استوائية) بدل `bg-black/30`.
4. إضافة texture للخلفية (ضوضاء، تدرجات متعددة الطبقات).
5. إصلاح `animate-in fade-in zoom-in` في Modal أو استبدالها بـ Framer Motion.

### رسم الجوزة / الشجرة (Coconut / Tree Illustration)

1. رسم شجرة جوز كاملة (جذع + تاج + حبل + جوزة) كـ SVG أو sprite.
2. تحسين illustration الجوزة: شقوق، ظل، highlight، لون أغمق/أفتح.
3. ربط مراحل القطع بصرياً بـ «عمق الشق» وليس 3 خطوط فقط.
4. إضافة أوراق نخيل حقيقية الشكل بدل `rounded-full`.

### تأثير القطع / Slash (Slash / Cut Effect)

1. تفعيل `SLASH_FADE_MS` — اختفاء تدريجي للخطوط.
2. إضافة particles عند القطع الناجح (رقائق جوز، شرارات ذهبية).
3. trail متعدد النقاط بدل خط مستقيم من نقطتين فقط.
4. خط سميك متدرج يتبع سرعة الإصبع.
5. flash/screen shake خفيف عند clean cut.

### إحساس اللعب (Gameplay Feel)

1. تنفيذ `windGusts` — تغيير مفاجئ في `swingAmplitude` أو `swingSpeed`.
2. ضبط `damage` ليحتاج 5–7 قطعات جيدة بدل 10+.
3. إضافة combo multiplier للقطعات المتتالية النظيفة.
4. slow-motion قصير عند الوصول لـ 100%.
5. فيزياء سقوط أفضل (bounce, rotation عشوائي).

### تجربة الموبايل (Mobile UX)

1. زيادة حجم hitbox على الشاشات الصغيرة.
2. منع scroll/zoom بشكل أفضل على iOS Safari.
3. زر pause أو تأكيد قبل الخروج.
4. safe-area-inset للأجهزة ذات الـ notch.
5. اختبار على أجهزة حقيقية (Android + iOS).

### صقل الحركات (Animation Polish)

1. انتقال سلس بين Start → Game.
2. دخول/خروج Modal بـ spring animation.
3. تحسين `score-pop` ليعرض رقم النقاط الفعلي وليس `+!` فقط.
4. مطر أكثر كثافة مع طبقات depth.
5. ضباب يتحرك ببطء مع تأرجح الجوزة.

---

## 10. الأوامر الدقيقة (Exact Commands)

### تشغيل المشروع (Development)

```bash
cd /Users/ahmed/Desktop/salala
npm install        # إذا لم تُثبَّت الحزم بعد
npm run dev
```

ثم افتح: **http://localhost:3000**

### البناء للإنتاج (Production Build)

```bash
npm run build
npm start          # يشغّل على المنفذ 3000
```

### الفحص (Lint)

```bash
npm run lint
```

### التحذيرات / المشاكل المعروفة

| البند | التفاصيل |
|-------|----------|
| Build | ✅ ينجح بدون أخطاء TypeScript |
| `npm warn Unknown env config "devdir"` | تحذير بيئة npm — لا يؤثر على المشروع |
| `animate-in fade-in zoom-in` | classes في Modal قد لا تُفعِّل animation بدون `tailwindcss-animate` |
| `SLASH_FADE_MS` / `clearSlashLines` | مُعرَّفة لكن غير موصولة في UI |
| `windGusts` | مُعرَّف في difficulty لكن غير مستخدم |
| `DROP_DURATION_MS` | ثابت 800ms — Framer يستخدم 0.8 يدوياً (متطابق لكن غير مربوط بالثابت) |
| README | يذكر Geist بينما المشروع يستخدم Cairo |
| لا صور لعبة | مجلد `public/` يحتوي فقط أيقونات Next الافتراضية |

### هيكل التبعيات (Dependencies)

```json
{
  "next": "16.2.10",
  "react": "19.2.4",
  "framer-motion": "^12.42.2",
  "tailwindcss": "^4"
}
```

---

## ملحق: خريطة الربط بين الملفات

```
app/page.tsx
├── GameShell
├── StartScreen → Button
└── GameStage
    ├── useGameEngine
    │   ├── collision.ts
    │   ├── difficulty.ts
    │   ├── scoring.ts
    │   └── storage.ts
    ├── HangingCoconut (Framer Motion)
    ├── SlashLayer
    ├── CutProgress / ScoreBoard / LevelBadge / MissCounter
    ├── RainEffect / FogOverlay / LeavesOverlay
    ├── LevelCompleteModal → Modal + Card + Button
    └── GameOverModal → Modal + Card + Button
```

---

*نهاية التقرير — جاهز للمراجعة.*
