# sculptura design theme

## overview
sculptura uses a refined, editorial aesthetic grounded in warm neutrals with spring-meadows palette accents. the design feels tactile, artisanal, and human — never cold or purely digital.

---

## typography

| role | font | tailwind class | usage |
|------|------|----------------|-------|
| display / hero headings | Tiempos (light serif) | `font-serif` | h1, section headings, hero titles |
| body / UI text | Bricolage Grotesque | `font-sans` | all general text, paragraphs, labels, buttons |
| wordmark only | Morphosa | `font-wordmark` | logo "sculptura" text only |
| monospace / code | DM Mono | `font-mono` | access keys, code snippets, section labels (uppercase eyebrow tags) |
| handwritten | Caveat | `font-hand` | decorative use only |

### typographic rules
- **page titles (h1)**: always `font-serif text-2xl md:text-4xl font-light tracking-tight lowercase`
- **section headings (h2/h3)**: `font-serif text-xl md:text-3xl font-light tracking-tight`
- **eyebrow labels** (e.g. "for designers", "latest drops"): `text-[10px] tracking-widest font-mono uppercase text-muted-foreground/50`
- **body text**: `text-sm font-light leading-relaxed tracking-wide text-muted-foreground`
- **lowercase**: all UI text, labels, and headings use lowercase
- **NO em dashes** (`—`): never use em dashes anywhere in the UI. use a comma, period, colon, or rewrite the sentence instead.

---

## color palette

### semantic tokens (used in tailwind classes)
| token | light value | dark value | use |
|-------|-------------|------------|-----|
| `background` | warm off-white `hsl(38 28% 94%)` | near-black `hsl(224 16% 10%)` | page background |
| `foreground` | dark warm brown `hsl(28 18% 12%)` | warm off-white `hsl(38 18% 90%)` | primary text |
| `card` | white `hsl(38 22% 99%)` | dark card `hsl(224 14% 14%)` | card/panel backgrounds |
| `muted-foreground` | mid warm gray | mid warm gray | secondary text |
| `border` | warm light gray | dark gray | borders |
| `primary` | horizon teal `hsl(195 28% 47%)` | lighter teal | primary actions |
| `secondary` | warm light `hsl(38 20% 89%)` | dark gray | secondary backgrounds |
| `accent` | spanish green `hsl(140 20% 44%)` | green | accent elements |
| `destructive` | terracotta `hsl(12 48% 52%)` | same | errors/destructive |

### spring meadows named accents (use via CSS variables or inline styles)
| name | hex | tailwind | use |
|------|-----|----------|-----|
| horizon | `#558E9B` | `text-horizon` | primary accent, tags, links |
| spanish green | `#84A48B` | `text-spanish-green` | creator/design theme |
| dusty lavender | `#A386A9` | `text-lavender` | collector/buyer theme |
| terracotta | `#C96349` | `text-terracotta` | destructive, warm cta |
| neptune | `#7BB2BA` | `text-neptune` | cool secondary accent |
| rose | `#E89B85` | `text-rose` | soft warm highlight |
| sweet mint | `#AECBB8` | `text-sweet-mint` | success, earnings |
| dewpoint | `#C1D8DF` | `text-dewpoint` | soft blue highlights |
| buttercup | `#E1CA7A` | `text-buttercup` | in-review / pending |
| pancake | `#F0D58F` | `text-pancake` | light gold |
| wisteria | `#C8B3CA` | `text-wisteria` | soft purple |
| fairytale | `#F8D0D0` | `text-fairytale` | light pink |
| tumbleweed | `#D2A996` | `text-tumbleweed` | warm brown |
| herald | `#A36361` | `text-herald` | muted red |
| olive | `#888958` | `text-olive` | olive green |

---

## spacing and layout

- **max content width**: `max-w-7xl mx-auto` (outer), `max-w-5xl` or `max-w-3xl` for narrow content
- **page padding**: `px-6 py-10`
- **section spacing**: `py-16` with `border-t border-border/40` between sections
- **card padding**: `p-5` (small), `p-6` (standard), `p-8` (large)

---

## border radius

- **cards / panels**: `rounded-[20px]` or `rounded-[24px]`
- **inner elements / tags**: `rounded-[14px]` or `rounded-[18px]`
- **buttons**: `rounded-full` for all pill buttons
- **inputs**: `rounded-xl`
- **small badges/pills**: `rounded-full`

---

## shadows
| class | use |
|-------|-----|
| `shadow-paper` | standard card shadow |
| `shadow-paper-hover` | card hover state |
| `shadow-paper-lg` | hero/featured card |

---

## buttons
- **primary action**: `bg-foreground text-background hover:bg-foreground/90 rounded-full tracking-wider`
- **secondary/outline**: `border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full`
- **ghost/nav**: `hover:bg-secondary hover:text-foreground rounded-full`
- **destructive**: `border-red-200 text-red-600 hover:bg-red-50`
- all buttons use `text-xs` or `text-sm` with `tracking-wider`

---

## status badges (pills)
```
published   → text-emerald-600 bg-emerald-50 border-emerald-200
pending     → text-amber-600   bg-amber-50   border-amber-200
rejected    → text-red-600     bg-red-50     border-red-200
draft       → text-muted-foreground bg-secondary border-border
archived    → text-muted-foreground bg-secondary border-border
placed      → text-blue-600    bg-blue-50    border-blue-200
shipped     → text-purple-600  bg-purple-50  border-purple-200
delivered   → text-emerald-600 bg-emerald-50 border-emerald-200
cancelled   → text-red-600     bg-red-50     border-red-200
```
all badges: `text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border`

---

## cards
- background: `bg-card`
- border: `border border-border/50`
- radius: `rounded-[20px]` standard, `rounded-[14px]` compact
- shadow: `shadow-paper`
- hover: `hover:shadow-paper-hover transition-shadow`
- colored corner accent pattern: absolute div `top-0 right-0 w-16 h-16 rounded-bl-[18px] opacity-20` with palette color

---

## headers / nav bars (standalone pages without AppLayout)
```jsx
<header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border/40 px-6 py-4 flex items-center gap-4">
  <span className="font-wordmark text-xl text-foreground">sculptura</span>
  ...
</header>
```

---

## icons
- library: `lucide-react` only
- size: `w-4 h-4` standard, `w-3.5 h-3.5` small, `w-5 h-5` medium
- color: `text-muted-foreground/50` default, accent color for emphasis

---

## form inputs
- background: `bg-card` (on dark bg) or `bg-background` (inside card)
- border: `border-border/60`
- radius: `rounded-xl`
- text: `text-sm tracking-wide`
- label: `text-[11px] tracking-widest text-muted-foreground/50 uppercase`

---

## tab / filter pills
```jsx
// active
"bg-foreground text-background border-foreground"
// inactive
"bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
// base
"px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all"
```

---

## writing style rules
1. all UI text is **lowercase** unless it is an eyebrow label (uppercase + font-mono)
2. **no em dashes** (`—`) anywhere. ever. rewrite or use punctuation alternatives
3. no exclamation marks in UI copy
4. sentence fragments are fine for descriptions
5. prefer brevity: short labels, concise descriptions
6. "sculptura" is always lowercase

---

## dark mode
- toggled via the moon/sun button in the header
- persisted to `localStorage` with key `theme`
- class `dark` is added to `document.documentElement`
- initialized before React loads via inline script in `index.html` to prevent flash
- all colors use CSS variables that respect `.dark` class automatically