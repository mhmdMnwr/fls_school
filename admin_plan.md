<USER_REQUEST>
# FLS School - Admin Panel Build Plan (React)

Audience: a developer or AI model that must follow instructions literally.

Rules for the builder:
- Do the phases IN ORDER. Do not start a phase before the previous one passes its checks.
- Do not add libraries, pages, features or colors that are not listed here.
- After each phase run `npm run build` (must pass with zero TypeScript errors) and `npm run lint`.
- All visible text is in FRENCH and hard-coded in the components (no i18n library).
- The backend contract is the source of truth: open `http://localhost:3000/api/docs` (Swagger) and copy the real field names into `src/types/api.ts`. If a field you need is missing, do NOT invent it: use the fallback written in this plan and add a one-line note to `NOTES.md`.
- The look must follow the reference screenshot (dark indigo sidebar, soft pale page background, white rounded cards, colored icon tiles). Layout and widgets may differ, the theme may not.

---

## 0. Decisions (final)

| Topic | Decision |
|---|---|
| Build tool | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS **v3.4** + shadcn/ui (style "default", base color "slate", CSS variables on) |
| Routing | `react-router-dom` v6 (`createBrowserRouter`) |
| Server state | `@tanstack/react-query` v5 |
| HTTP | `axios` |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Charts | `recharts` |
| Icons | `lucide-react` only |
| Dates | `date-fns` with the `fr` locale |
| Toasts | `sonner` |
| Font | `@fontsource-variable/plus-jakarta-sans` (fallback `Inter`, `system-ui`) |
| Auth storage | JWT in `localStorage` key `fls_token` |
| Users | Exactly one: the administrator. No registration, no roles, no "forgot password" |
| Dark mode | NOT included |
| Language | French (`lang="fr"` on `<html>`) |
| Package manager | npm |

shadcn components to install (and no others): `button input label textarea select dialog alert-dialog dropdown-menu popover tabs table badge skeleton sonner switch checkbox command`.

Native inputs are used for dates and times: `<input type="date">`, `<input type="time">`.

### Environment
`.env` and `.env.example`:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 1. Design tokens (put in `tailwind.config.ts` and `src/index.css`)

### 1.1 Colors (hex is the source of truth)

| Token | Hex | Use |
|---|---|---|
| `brand-600` | `#4F46E5` | primary buttons, links, active elements, chart line |
| `brand-700` | `#4338CA` | primary hover |
| `brand-500` | `#6366F1` | focus ring (at 30% opacity) |
| `brand-100` | `#E0E7FF` | soft indigo backgrounds (date badge, selected rows) |
| `brand-50` | `#EEF2FF` | hover on indigo-ish items |
| `sidebar-from` | `#1F1D6B` | sidebar gradient top |
| `sidebar-to` | `#15144D` | sidebar gradient bottom |
| `sidebar-active-from` | `#5B4BF5` | active item gradient start |
| `sidebar-active-to` | `#4F3CE8` | active item gradient end |
| `page-bg` | `#F3F4FB` | page background |
| `card` | `#FFFFFF` | cards |
| `line` | `#E5E7F2` | borders and dividers |
| `line-soft` | `#EEF0F8` | table row separators |
| `ink` | `#1B1B4B` | headings and strong text |
| `body` | `#3F4468` | normal text |
| `muted` | `#6B7194` | secondary text, placeholders, table headers |
| `success` / bg | `#16A34A` / `#DCFCE7` (text `#15803D`) | "Actif", "Présent" |
| `warning` / bg | `#F59E0B` / `#FEF3C7` (text `#B45309`) | "Essai gratuit" |
| `danger` / bg | `#EF4444` / `#FEE2E2` (text `#B91C1C`) | errors, "Absent", delete |
| `neutral-badge` bg/text | `#F1F5F9` / `#64748B` | "Inactif" |

Stat/quick-action icon tiles (background tile + icon color):
| Tile | Tile bg | Icon |
|---|---|---|
| indigo | gradient `#4F46E5 → #6D5BF7`, icon white | Élèves |
| green | `#D1FAE5`, icon `#10B981` | Niveaux |
| purple | gradient `#A855F7 → #7C3AED`, icon white | Matières |
| amber | `#FEF3C7`, icon `#F59E0B` | Profs |

Chart palette (donut, in this order, cycle if more): `#4F46E5`, `#22C55E`, `#EAB308`, `#EF4444`, `#A855F7`, `#06B6D4`.

shadcn CSS variables to set in `:root` (HSL): `--background: 232 49% 97%`, `--foreground: 240 47% 20%`, `--card: 0 0% 100%`, `--primary: 243 75% 59%`, `--primary-foreground: 0 0% 100%`, `--muted-foreground: 231 16% 50%`, `--border: 230 33% 92%`, `--input: 230 33% 90%`, `--ring: 243 75% 59%`, `--destructive: 0 84% 60%`, `--radius: 0.75rem`.

### 1.2 Typography
Font: Plus Jakarta Sans. Sizes: page title 24px/700 `ink`; section/card title 16px/700 `ink`; body 14px/400 `body`; small 12px/500 `muted`; big stat number 28px/700 `ink`.

### 1.3 Shape, spacing, shadow
- Card: white, radius 16px, border `1px solid line` at 60%, shadow `0 1px 2px rgba(16,24,40,.04), 0 6px 20px rgba(67,56,202,.06)`, padding 20px (24px on desktop).
- Buttons/inputs/selects: radius 12px, height 40px (`h-10`).
- Icon tile: 48x48, radius 12px. Small tile (lists): 36x36, radius 10px.
- Page background: `page-bg` with a soft top gradient: `linear-gradient(180deg,#E9EAF8 0, #F3F4FB 260px)`.
- Page padding: `px-4 md:px-6 lg:px-8 py-6`. Grid gaps: 20px (`gap-5`).
- Transitions: 150ms on hover/focus. No other animations except the loading spinner and skeleton pulse.

### 1.4 Shared look of common elements
- **Badge** (status): pill, `px-2.5 py-0.5`, 12px/500. Variants: `success`, `warning`, `danger`, `neutral`, `brand` (bg `brand-100`, text `brand-700`).
- **Table**: no outer border inside the card. Header row bg `#F8F9FD`, text 12px/500 `muted`, not uppercase, height 44px. Body row height 56px, bottom border `line-soft`, hover bg `#F8F9FF`, text 14px. Numbers right-aligned. Action column: a `⋯` icon button (`MoreHorizontal`) opening a dropdown.
- **Avatar initials**: 36px circle (40px on detail pages 64px). Initials = first letter of first name + first letter of last name, uppercase. Background and text color picked deterministically from a hash of the full name over 6 pairs: (`#E0E7FF`,`#4338CA`), (`#DCFCE7`,`#15803D`), (`#FEF3C7`,`#B45309`), (`#FCE7F3`,`#BE185D`), (`#E0F2FE`,`#0369A1`), (`#F3E8FF`,`#7E22CE`).
- **Dialog**: overlay `rgba(21,20,77,.45)` with blur-sm, content white radius 16px padding 24px, max width `max-w-lg` (forms with more than 6 fields: `max-w-2xl`, two columns on `md+`). Title 18px/700. Footer right-aligned: secondary "Annuler" then primary "Enregistrer" (or "Créer" on creation).
- **Form field**: label 14px/500 `ink` above, required marked with a red `*`. Error text 12px `danger` under the field, input border turns `danger`. Optional helper text 12px `muted`.
- **Focus**: 2px ring `brand-500/30` + border `brand-600` on every input, button and link.
- **Empty state** (inside a card): centered, 48px icon tile (`brand-50` bg, `brand-600` icon), title 16px/700, description 14px `muted`, optional primary button.
- **Loading**: skeleton blocks (pulse, `#E9EBF5`) shaped like the final content. Tables show 6 skeleton rows. Buttons show a spinner (`Loader2`, animate-spin) and are disabled while submitting.
- **Error state** (inside a card): `AlertCircle` icon, "Une erreur est survenue lors du chargement.", secondary button "Réessayer" calling `refetch`.
- **Toasts** (sonner, top-right, 4s): success green "Élève ajouté avec succès"; error red with the backend message.

---

## 2. Number, date and text formatting (create `src/lib/format.ts`)

| Function | Output example |
|---|---|
| `formatDate(iso)` | `24/09/2026` |
| `formatLongDate(date)` | `Samedi 3 octobre 2026` (capitalized first letter, `date-fns` `EEEE d MMMM yyyy`, fr) |
| `formatTime(hhmm)` | `08:00` (backend already sends `HH:mm`) |
| `formatTimeRange(a,b)` | `08:00 - 09:30` |
| `formatMoney(n)` | `12 500,00 DA` (`n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' DA'`) |
| `formatNumber(n)` | `1 248` |
| `relativeTime(iso)` | `Il y a 2 heures` (`formatDistanceToNow` fr, first letter capitalized) |
| `fullName(p)` | `Benali Amina` (**lastName firstName**, used in tables), `fullNameNatural(p)` → `Amina Benali` (used in titles and greetings) |
| `ageFromBirthDate(iso)` | `15 ans` |
| `monthLabels` | `['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']` |

Brand constants in `src/config/brand.ts`: `APP_NAME = 'FLS School'`, `APP_SUBTITLE = 'First Line School'`, `TAGLINE = 'Ensemble pour un avenir meilleur'`, `ADMIN_DISPLAY_NAME = 'Admin'`, `ADMIN_ROLE_LABEL = 'Administrateur'`. Logo: if `src/assets/logo.svg` does not exist use the lucide `GraduationCap` icon (white, 28px) in a 40px circle with `rgba(255,255,255,.12)` background.

---

## 3. Project structure (create exactly this)

```
src/
  main.tsx
  App.tsx                      (RouterProvider + QueryClientProvider + Toaster)
  routes.tsx
  index.css
  config/brand.ts
  lib/
    api.ts                     (axios instance + interceptors)
    auth.ts                    (token helpers)
    format.ts
    utils.ts                   (cn, hashString, debounce)
    errors.ts                  (getErrorMessage)
    labels.ts                  (ACTIVITY_LABELS, status labels)
  types/api.ts
  api/                         (one file per resource: levels.ts, classes.ts, subjects.ts, teachers.ts,
                                groups.ts, students.ts, enrollments.ts, sessions.ts, absences.ts,
                                payments.ts, dashboard.ts, activity.ts, auth.ts)
  hooks/
    useDebounce.ts
    useListParams.ts           (sync page/limit/search/filters with the URL query string)
    useAuth.ts
  components/
    ui/                        (shadcn files, do not rewrite)
    layout/ AppLayout.tsx, Sidebar.tsx, Topbar.tsx, GlobalSearch.tsx, NotificationBell.tsx, UserMenu.tsx, PageHeader.tsx, Breadcrumbs.tsx
    common/ DataTable.tsx, Pagination.tsx, FilterBar.tsx, StatusBadge.tsx, InitialsAvatar.tsx, EmptyState.tsx,
            ErrorState.tsx, ConfirmDialog.tsx, FormField.tsx, StatCard.tsx, IconTile.tsx, AsyncCombobox.tsx, PageSkeletons.tsx
  features/
    auth/ LoginPage.tsx
    dashboard/ DashboardPage.tsx + widgets/*
    students/ StudentsPage.tsx, StudentFormDialog.tsx, StudentDetailPage.tsx, tabs/*
    levels/ LevelsPage.tsx, LevelFormDialog.tsx, ClassFormDialog.tsx
    subjects/ SubjectsPage.tsx, SubjectFormDialog.tsx
    teachers/ TeachersPage.tsx, TeacherFormDialog.tsx, TeacherDetailPage.tsx
    groups/ GroupsPage.tsx, GroupFormDialog.tsx, GroupDetailPage.tsx, AddStudentsDialog.tsx
    sessions/ SessionsPage.tsx, SessionFormDialog.tsx, SessionDetailPage.tsx (attendance)
    payments/ PaymentsPage.tsx, PaymentFormDialog.tsx
    settings/ SettingsPage.tsx
    NotFoundPage.tsx
```

---

## 4. Routes

| Path | Page | Protected |
|---|---|---|
| `/login` | LoginPage | no (redirect to `/` if already logged in) |
| `/` | DashboardPage | yes |
| `/eleves` | StudentsPage | yes |
| `/eleves/:id` | StudentDetailPage | yes |
| `/niveaux` | LevelsPage | yes |
| `/matieres` | SubjectsPage | yes |
| `/profs` | TeachersPage | yes |
| `/profs/:id` | TeacherDetailPage | yes |
| `/groupes` | GroupsPage | yes |
| `/groupes/:id` | GroupDetailPage | yes |
| `/seances` | SessionsPage | yes |
| `/seances/:id` | SessionDetailPage | yes |
| `/paiements` | PaymentsPage | yes |
| `/parametres` | SettingsPage | yes |
| `*` | NotFoundPage | yes (inside layout) |

Each page sets `document.title = "<Page> · FLS School"`.

Convention: any list page opens its create dialog automatically when the URL contains `?new=1`, then removes that param (used by the dashboard quick actions).

---

## 5. App shell (applies to every protected page)

### 5.1 Sidebar (`Sidebar.tsx`)
- Fixed left, width **256px**, full height, background gradient `sidebar-from → sidebar-to`, padding `20px 16px`.
- **Top (brand block)**: logo (40px) + to its right two lines: "FLS School" (20px/700 white) and "First Line School" (12px, white 70%). Below: 24px gap.
- **Nav items** (in this order), each 44px high, `px-4`, gap 12px, icon 20px (`lucide`, stroke 1.75), label 14px/500, radius 12px, margin-bottom 6px:
  1. Tableau de bord: `LayoutDashboard` → `/`
  2. Élèves: `Users` → `/eleves`
  3. Niveaux: `Layers` → `/niveaux`
  4. Matières: `BookOpen` → `/matieres`
  5. Professeurs: `GraduationCap` → `/profs`
  6. Groupes: `UsersRound` → `/groupes`
  7. Séances: `CalendarDays` → `/seances`
  8. Paiements: `Wallet` → `/paiements`
  - 1px divider `rgba(255,255,255,.1)` with 12px vertical margin
  9. Paramètres: `Settings` → `/parametres`
- **Inactive**: text white 85%, hover bg `rgba(255,255,255,.08)`.
- **Active** (route starts with the item path; `/` only on exact match): background gradient `sidebar-active-from → sidebar-active-to`, text white, `box-shadow: 0 0 0 1px rgba(255,255,255,.18) inset, 0 8px 24px rgba(91,75,245,.45)`.
- **Bottom block** (pinned to the bottom): centered `GraduationCap` icon (28px, white 70%) and the italic text "Ensemble pour un avenir meilleur" (14px, white 70%, two lines, centered).
- Under 1024px: sidebar is hidden and rendered inside an off-canvas drawer (slides from the left, overlay behind, closes on route change, on overlay click and on Escape), opened by the hamburger button (`Menu` icon) in the topbar.

### 5.2 Topbar (`Topbar.tsx`)
Sticky at the top, height 64px, transparent background with `backdrop-blur`, padding `0 32px` (16px on mobile).
- **Left**: hamburger (only < 1024px) then the **GlobalSearch** input: width up to 420px, height 44px, radius 12px, white 80% background, no border, soft shadow, left `Search` icon in `muted`, placeholder "Rechercher un élève, un professeur...".
- **Right**: notification bell, then user menu, 16px apart.

**GlobalSearch behavior**
- Debounce 300ms; search starts at 2 characters.
- Calls `GET /students?search=&limit=5` and `GET /teachers?search=&limit=5` in parallel.
- Results open in a popover under the input (same width), grouped with small headers "Élèves" and "Professeurs", each row = initials avatar + natural name + muted subline (class name for students, phone/email for teachers). Click → `/eleves/:id` or `/profs/:id`, closes the popover and clears the input.
- Empty: "Aucun résultat pour « terme »". Loading: 3 skeleton rows.
- Keyboard: `/` focuses the input (when no input is focused), `Esc` closes, arrow keys move, `Enter` opens.

**NotificationBell**
- 40px round white button with `Bell` icon (20px). Red dot badge (18px, `#EF4444`, white 11px number, positioned top-right) showing the number of recent activities newer than `localStorage.fls_activity_seen` (max display "9+"). Hidden when 0.
- Click → popover 340px wide: title "Notifications", the last 5 items of `GET /dashboard/recent-activities?limit=5` using the same row component as the dashboard activity widget, footer link "Tout voir" → `/` (dashboard). Opening sets `fls_activity_seen` to now.
- Refetch every 60s.

**UserMenu**
- Button: 40px circle avatar (bg `brand-600`, white initial "A") + two text lines "Admin" (14px/600 `ink`) and "Administrateur" (12px `muted`) hidden below 640px + `ChevronDown`.
- Dropdown (width 220px): header showing the admin email (from `GET /auth/me`, 12px `muted`), item "Paramètres" (`Settings` icon → `/parametres`), separator, item "Se déconnecter" (`LogOut` icon, red text) → clears token, clears the query cache, navigates to `/login`.

### 5.3 Content area
`AppLayout`: `<Sidebar/>` + main column with `lg:pl-64`, `<Topbar/>` and `<Outlet/>` wrapped in `div.max-w-[1400px].mx-auto` with the page padding from section 1.3.

### 5.4 PageHeader (used by every page except the dashboard)
Left: `h1` 24px/700 `ink`, under it a 14px `muted` subtitle. Right: the primary action button (icon `Plus` + label). On detail pages a `Breadcrumbs` line (12px `muted`, separators `/`, last item `ink`) sits above the title.

---

## 6. API layer and shared behavior

### 6.1 axios (`lib/api.ts`)
- `baseURL = import.meta.env.VITE_API_URL`.
- Request interceptor adds `Authorization: Bearer <token>` when a token exists.
- Response interceptor: on 401 for any URL except `/auth/login`: remove token, `queryClient.clear()`, `toast.error('Session expirée, veuillez vous reconnecter')`, redirect to `/login`.

### 6.2 Error messages (`lib/errors.ts`)
Backend errors look like `{ statusCode, message: string | string[], error }`. `getErrorMessage(err)` returns: `message` joined with a line break when it is an array; the string when it is a string; otherwise "Une erreur est survenue. Veuillez réessayer.". Network error (no response): "Impossible de contacter le serveur.".
- 409 on delete → show the backend message in the confirm dialog's toast (e.g. "Level has classes") prefixed by "Suppression impossible : ".
- 400/409 on form submit → toast with the message; never close the dialog on error.

### 6.3 Types (`types/api.ts`)
Create types from Swagger. Expected shapes (adjust to Swagger):
```ts
type Id = string;
interface Paginated<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }
interface Level { id: Id; name: string; position: number; classesCount?: number; studentsCount?: number }
interface SchoolClass { id: Id; name: string; level: Level | Id; studentsCount?: number }
interface Subject { id: Id; name: string; schoolClass: SchoolClass | Id }
interface Teacher { id: Id; firstName: string; lastName: string; phone?: string; email?: string; isActive: boolean; createdAt: string }
interface StudyGroup { id: Id; name: string; subject: Subject; teacher: Teacher; isActive: boolean; studentsCount?: number }
interface Student { id: Id; firstName: string; lastName: string; birthDate: string; phone?: string; email?: string; schoolClass: SchoolClass; isActive: boolean; createdAt: string }
interface Enrollment { id: Id; student: Student | Id; group: StudyGroup | Id; enrolledOn: string; isActive: boolean }
interface Session { id: Id; group: StudyGroup; date: string; startTime: string; endTime: string; isFreeTrial: boolean }
interface AbsenceRecord { id?: Id; student: Student | Id; isPresent: boolean }
interface Payment { id: Id; student: Student | Id; paidOn: string; amount: number; description: string }
interface ActivityLog { id: Id; type: string; title: string; detail: string; createdAt: string }
```
Where a relation may be populated or just an id, write small helper functions (`asObj`) and never assume; if the level of a class is not populated, fetch levels once (`useLevels`, cached) and look it up.

### 6.4 React Query
- One `QueryClient`: `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: true`.
- Query key factory per resource (`['students', params]`, `['student', id]`, ...).
- After every create/update/delete mutation: invalidate that resource's list keys AND `['dashboard']`.
- Lists use `placeholderData: keepPreviousData` so the table does not flash while paging.

### 6.5 List pages: shared mechanics (`useListParams`, `DataTable`, `Pagination`, `FilterBar`)
- Filters, `page`, `limit`, and `search` live in the URL query string (so refresh and back button work).
- Changing any filter or search resets `page` to 1.
- **FilterBar**: a card (padding 16px) with a single row (wraps on small screens): search input (width 280px, `Search` icon left, debounce 400ms), the page-specific selects (width 180px each), and a text button "Réinitialiser les filtres" (`RotateCcw` icon, shown only when a filter is active).
- **DataTable** props: `columns`, `rows`, `isLoading`, `isError`, `onRetry`, `emptyState`. Mobile: the table scrolls horizontally inside the card.
- **Pagination** (footer inside the card, border-top, padding 16px): left text "Affichage de 1 à 10 sur 248" (`muted`); right: page-size select (10 / 20 / 50, label "Par page"), "Précédent" and "Suivant" buttons (secondary, small, disabled at the ends), and numbered buttons (current page filled `brand-600` white text; show first, last, current ±1 and ellipsis).
- **Row actions menu** (`⋯`): "Voir" (only if a detail page exists), "Modifier", separator, "Supprimer" (red). Delete opens `ConfirmDialog`: title "Supprimer cet élément ?", text names the item ("Voulez-vous vraiment supprimer l'élève Amina Benali ? Cette action est irréversible."), buttons "Annuler" and a destructive "Supprimer" with spinner.

### 6.6 Form dialogs: shared mechanics
- One component per resource handles both create and edit (`initialData?` prop). Title: "Ajouter un …" / "Modifier …".
- `react-hook-form` + zod; validate on submit, then on change after the first failed submit.
- Required message: "Ce champ est obligatoire". Email: "Adresse email invalide". Phone (optional): regex `^[0-9+\s().-]{8,20}$`, message "Numéro de téléphone invalide". Max length messages: "100 caractères maximum".
- Trim strings before sending. Send empty optional strings as `undefined`.
- On success: toast, close dialog, invalidate queries.

### 6.7 Dependent selects
A "Niveau" select followed by a "Classe" select: the class select is disabled with placeholder "Choisir d'abord un niveau" until a level is chosen; changing the level clears the class. Class options come from `GET /classes?levelId=`. When a form needs only a class, use a single select with groups (`SelectGroup` label = level name, items = classes).

---

## 7. Pages (precise specification)

### 7.1 Login (`/login`)
- Full screen, two columns on `lg+` (50/50), single column below.
- **Left panel** (hidden below 1024px): sidebar gradient background with two soft blurred circles (`#5B4BF5` at 30%) for depth; centered: logo (64px), "FLS School" 32px/700 white, "First Line School" 14px white 70%; at the bottom, the tagline in italic 18px white 80%.
- **Right panel**: `page-bg`, a white card max width 420px, padding 32px, centered vertically.
  - Title "Connexion" (24px/700), subtitle "Accédez à l'espace administrateur" (`muted`).
  - Field "Adresse email" (type email, autofocus, `Mail` icon left).
  - Field "Mot de passe" (`Lock` icon left, eye toggle on the right to show/hide).
  - Full-width primary button "Se connecter" (height 44px) with spinner while loading.
  - Error banner (red soft bg, `AlertCircle`) above the button on 401: "Email ou mot de passe incorrect".
  - NO register link, NO forgot-password link, NO "remember me".
- Behavior: submit with Enter; on success store token, navigate to the page the user originally wanted (`location.state.from`) or `/`.
- Validation: email valid, password required (min 1).

### 7.2 Dashboard (`/`)
Greeting row, then 3 rows of widgets. API: `/dashboard/*` endpoints from the backend plan. Refetch on focus.

**Greeting row**
- Left: "Bonjour Admin 👋" (28px/700 `ink`) and "Voici un aperçu général de votre école." (14px `muted`).
- Right (hidden below 768px): a white pill showing `CalendarDays` + formatted long date, and a second pill `Clock` + current time `HH:mm` updated every 30 seconds.

**Row 1: 4 stat cards** (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`), each card: 48px icon tile left, then label (14px `body`), big number (28px/700 `ink`), and a subline (12px).
| Card | Tile | Value (from `/dashboard/stats`) | Subline |
|---|---|---|---|
| Total élèves | indigo, `Users` | `students.total` | `↑ +{newThisMonth} ce mois` in green (`ArrowUp` icon) when > 0, otherwise "Aucune nouvelle inscription ce mois" in `muted` |
| Niveaux | green, `Layers` | `levels.total` | "Cycles d'enseignement" |
| Matières | purple, `BookOpen` | `subjects.total` | "Enseignements proposés" |
| Professeurs | amber, `GraduationCap` | `teachers.total` | "Enseignants actifs" |
Each card is clickable (links to `/eleves`, `/niveaux`, `/matieres`, `/profs`) with hover lift (`-translate-y-0.5`, stronger shadow).

**Row 2** (`grid-cols-12`, gap 20px; stacks below `lg`):
1. **Évolution des effectifs** (`lg:col-span-5`): title + a select on the right ("Cette année" / "Année dernière"). Recharts `AreaChart`, height 260px: line `#4F46E5` 2px, visible dots (r=3, filled `#4F46E5`, white stroke), area gradient from `rgba(79,70,229,.18)` to `rgba(79,70,229,0)`, horizontal dashed grid `#E5E7F2`, no vertical grid, Y axis integer ticks, X axis `monthLabels`, custom tooltip card: "Septembre 2026" bold + "248 élèves". Data from `/dashboard/enrollment-evolution?year=`.
2. **Répartition par niveau** (`lg:col-span-4`): Recharts `PieChart` donut (inner radius 60%, outer 90%, padding angle 2, no stroke) on the left 150px; **center label**: total students (22px/700) over "élèves" (12px `muted`); legend on the right: for each level a colored dot (10px), level name, and "72 (29%)" right-aligned. Data from `/dashboard/students-by-level`.
3. **Actions rapides** (`lg:col-span-3`): 4 full-width rows (height 48px, border `line`, radius 12px, hover `brand-50`), each with a 32px colored tile icon, label 14px/500 and `ChevronRight` on the right:
   - "Ajouter un élève" (indigo, `UserPlus`) → `/eleves?new=1`
   - "Ajouter un professeur" (green, `UserPlus`) → `/profs?new=1`
   - "Ajouter une matière" (purple, `BookPlus`) → `/matieres?new=1`
   - "Ajouter un niveau" (amber, `Layers`) → `/niveaux?new=1`

**Row 3** (`grid-cols-12`):
1. **Derniers élèves inscrits** (`lg:col-span-5`): header with title and link "Voir tout →" (`/eleves`). Compact table (rows 52px) columns: "Nom et prénom" (avatar + name, link to detail), "Niveau", "Date d'inscription" (`formatDate`), "Statut" (badge). Shows 5 rows.
2. **Prochains cours** (`lg:col-span-4`): link "Voir tout →" (`/seances`). Each item: left a 44px rounded square (`brand-50` bg) with the day number (16px/700 `brand-600`) over the month abbreviation (11px `muted`, e.g. "Oct"); right: subject (14px/600 `ink`), line 2 "Classe · 08:00 - 09:30" (12px `muted`), line 3 `User` icon + teacher name (12px `body`). Items separated by `line-soft`. 4 items. Item click → `/seances/:id`.
4. **Dernières activités** (`lg:col-span-3`): link "Voir tout →" is NOT shown (no page). Each item: 36px circle icon (see mapping below), title (13px/600 `ink`), detail (12px `muted`), relative time (11px `muted`, right-aligned, top). 5 items.

Activity mapping (`lib/labels.ts`, backend titles are English, translate by `type`):
| type | French title | Icon / circle colors |
|---|---|---|
| `STUDENT_CREATED` | Un nouvel élève a été inscrit | `UserPlus`, bg `#DCFCE7` icon `#16A34A` |
| `TEACHER_CREATED` | Un professeur a été ajouté | `GraduationCap`, bg `#E0E7FF` icon `#4F46E5` |
| `SUBJECT_CREATED` | Une matière a été créée | `BookOpen`, bg `#F3E8FF` icon `#7E22CE` |
| `SUBJECT_UPDATED` | Une matière a été modifiée | `BookOpen`, same colors |
| `LEVEL_CREATED` | Un niveau a été créé | `Layers`, bg `#FEF3C7` icon `#B45309` |
| `SETTINGS_UPDATED` | Paramètres mis à jour | `Settings`, bg `#F1F5F9` icon `#64748B` |
| any other | use backend `title` | `Activity`, gray |
The subtitle is the backend `detail` field.

Every widget has its own loading skeleton, empty state (e.g. "Aucune donnée pour le moment") and error state.

### 7.3 Élèves (`/eleves`)
- **Header**: "Élèves" / "Gérez les élèves inscrits dans votre établissement" / button "Ajouter un élève".
- **Filters**: search ("Rechercher par nom, téléphone..."), Niveau select (all levels, first option "Tous les niveaux"), Classe select (dependent, first option "Toutes les classes"), Statut select ("Tous les statuts", "Actif", "Inactif").
- **API**: `GET /students?search=&levelId=&classId=&isActive=&page=&limit=`.
- **Columns**: Nom et prénom (avatar + `fullName`, name is a link to detail; muted second line = email if any), Niveau (brand badge), Classe, Téléphone (or "—"), Date d'inscription (`formatDate(createdAt)`), Statut (badge), actions.
- **Row menu**: Voir, Modifier, Supprimer.
- **Empty state**: "Aucun élève trouvé" + "Ajouter un élève" button (or "Essayez de modifier vos filtres" when filters are active).
- **StudentFormDialog** (`max-w-2xl`, 2 columns):
  - Prénom* | Nom*
  - Date de naissance* (`type=date`, `max` = today, must be in the past: "La date doit être dans le passé") | Classe* (grouped select by level)
  - Téléphone | Email
  - Statut: `Switch` "Élève actif" (default on)
- **Delete rule**: on backend 409 show "Suppression impossible : cet élève possède des paiements. Désactivez-le plutôt."

### 7.4 Détail élève (`/eleves/:id`)
- Breadcrumbs: "Élèves / Prénom Nom".
- **Profile card**: avatar 64px, name (22px/700), badges (level, class, status), then a 3-column info grid with icons: `Cake` date of birth + age, `Phone`, `Mail`, `CalendarCheck` "Inscrit le …". Right side buttons: "Modifier" (secondary), "Désactiver"/"Activer" (secondary, toggles `isActive` via PATCH), "Supprimer" (destructive outline).
- **Tabs** (shadcn Tabs, underline style: active tab text `brand-600` with 2px bottom bar): 
  1. **Groupes**: table (Matière, Professeur, Groupe, Inscrit le, Statut, actions: "Désactiver/Activer", "Retirer"). Button "Inscrire à un groupe" opens a dialog: select of groups from `GET /groups?classId=<student class>&isActive=true` excluding already enrolled; label shows "Matière — Professeur (nom du groupe)"; submit `POST /enrollments`. Backend 400 message shown as is. Data: `GET /students/:id/enrollments`.
  2. **Présences**: 4 small stat cards from `GET /absences/students/:id/summary` (Séances, Présences, Absences, Taux d'absence in %) then a table (Date, Matière, Horaire, Statut badge "Présent" success / "Absent" danger), paginated 10.
  3. **Paiements**: 3 stat cards from `GET /payments/students/:id/summary` (Total payé, Nombre de paiements, Dernier paiement) then a table (Date, Montant, Description, actions) and button "Ajouter un paiement" (opens `PaymentFormDialog` with the student pre-filled and locked).
- 404 from the API → show an `EmptyState` "Élève introuvable" with a "Retour à la liste" button.

### 7.5 Niveaux (`/niveaux`)
- **Header**: "Niveaux et classes" / "Organisez les niveaux scolaires et leurs classes" / button "Ajouter un niveau".
- **Body**: vertical list of **level cards**, ordered by `position`. Each card (collapsible, first one open by default):
  - Header row: 40px green-tile `Layers` icon, level name (16px/700), muted text "{n} classes · {m} élèves", on the right: icon buttons `Pencil` (edit), `Trash2` (delete), and a `ChevronDown` that rotates when open; header click toggles.
  - Body (when open): a mini table of its classes: Classe, Élèves (count), actions (`Pencil`, `Trash2`); button "Ajouter une classe" (secondary, `Plus`) at the end; each class row has a link "Voir les matières" → `/matieres?classId=<id>`. If the level has no class: muted text "Aucune classe dans ce niveau".
- **LevelFormDialog**: Nom* (placeholder "ex. Secondaire"), Ordre d'affichage (number ≥ 0, default next position).
- **ClassFormDialog**: Niveau* (select, preselected and locked when opened from a level card), Nom* (placeholder "ex. 1ère année scientifique").
- **Delete errors**: level with classes → "Suppression impossible : ce niveau contient des classes." Class with subjects or students → "Suppression impossible : cette classe contient des matières ou des élèves."
- **Data**: `GET /levels` and `GET /classes` (all), grouped client-side by level id.
- **Empty state** (no level): "Aucun niveau créé" + "Ajouter un niveau".

### 7.6 Matières (`/matieres`)
- **Header**: "Matières" / "Les matières enseignées pour chaque classe" / "Ajouter une matière".
- **Filters**: search, Niveau, Classe (dependent). Reads `classId` from the URL when coming from the Niveaux page.
- **API**: `GET /subjects?classId=&search=&page=&limit=`.
- **Columns**: Matière (purple 36px tile with `BookOpen` + name), Classe, Niveau (badge), actions (Modifier, Supprimer).
- **SubjectFormDialog**: Niveau* (select, UI helper only) → Classe* (dependent) → Nom* (placeholder "ex. Mathématiques").
- **Delete error**: "Suppression impossible : cette matière est utilisée par des groupes."
- When editing, preselect the level from the subject's class.

### 7.7 Professeurs (`/profs`)
- **Header**: "Professeurs" / "Gérez votre équipe pédagogique" / "Ajouter un professeur".
- **Filters**: search, Statut.
- **API**: `GET /teachers?search=&isActive=&page=&limit=`.
- **Columns**: Nom et prénom (avatar + name link), Téléphone, Email, Statut, actions (Voir, Modifier, Supprimer).
- **TeacherFormDialog**: Prénom* | Nom* ; Téléphone | Email ; `Switch` "Professeur actif".
- **Delete error**: "Suppression impossible : ce professeur gère des groupes. Désactivez-le plutôt."
- **Detail** (`/profs/:id`): breadcrumbs, profile card (avatar 64px, name, status badge, phone, email, buttons Modifier / Supprimer), then a card "Groupes gérés" with a table (Matière, Classe, Groupe, Élèves, Statut) from the teacher's `groups` (row click → `/groupes/:id`); empty: "Ce professeur ne gère aucun groupe."

### 7.8 Groupes (`/groupes`)
A group = a teacher teaching a subject.
- **Header**: "Groupes" / "Associez un professeur à une matière pour former un groupe" / "Créer un groupe".
- **Filters**: search (client-side not available, so omit search), Niveau, Classe, Matière (dependent on class), Professeur (all teachers), Statut.
- **API**: `GET /groups?classId=&subjectId=&teacherId=&isActive=&page=&limit=`.
- **Columns**: Groupe (indigo 36px tile `UsersRound` + "Matière" bold + group name muted), Classe, Professeur, Élèves (`studentsCount`), Statut, actions (Voir, Modifier, Supprimer).
- **GroupFormDialog**: Classe* (grouped select) → Matière* (dependent, from `GET /subjects?classId=&limit=100`) → Professeur* (active teachers) → Nom du groupe (optional, placeholder "ex. Samedi 10:00", helper "Permet de distinguer plusieurs groupes de la même matière") → `Switch` "Groupe actif". On edit, class and subject are locked (read-only text) to avoid orphaning enrollments.
- **Duplicate error (409)**: "Un groupe identique existe déjà."
- **Detail** (`/groupes/:id`): breadcrumbs, info card (subject, class, teacher link, status, students count) + buttons Modifier / Supprimer. Tabs:
  1. **Élèves**: table (Élève link, Inscrit le, Statut, action "Retirer"); button "Ajouter des élèves" opens `AddStudentsDialog`: search field + checklist (checkbox rows with avatar + name) of students of the group's class not yet enrolled (`GET /students?classId=&isActive=true&limit=50&search=`), button "Inscrire (n)" sends one `POST /enrollments` per checked student, then shows a toast with the count of successes and lists failures if any.
  2. **Séances**: table of the group's sessions (`GET /sessions?groupId=`) with a button "Planifier une séance" (opens `SessionFormDialog` with the group locked).

### 7.9 Séances (`/seances`)
- **Header**: "Séances" / "Planifiez les cours et faites l'appel" / "Planifier une séance".
- **Filters**: date range ("Du" `type=date` and "Au" `type=date`; default: Monday and Sunday of the current week), Groupe (searchable select), Type ("Tous", "Régulière", "Essai gratuit"). Button "Cette semaine" resets the range.
- **API**: `GET /sessions?from=&to=&groupId=&isFreeTrial=&page=&limit=`.
- **Columns**: Date (bold `formatDate`, muted weekday below), Horaire, Matière, Classe, Groupe/Professeur (name + muted teacher), Type (badge `warning` "Essai gratuit" or `neutral` "Régulière"), actions: primary small button "Faire l'appel" (`ClipboardCheck` icon → `/seances/:id`), then `⋯` (Modifier, Supprimer).
- **SessionFormDialog**: Groupe* (select "Matière — Professeur (nom)"), Date* (`type=date`), Heure de début* (`type=time`), Heure de fin* (`type=time`, must be after start: "L'heure de fin doit être après l'heure de début"), `Switch` "Essai gratuit". Helper under the dialog title on creation: "Les élèves inscrits au groupe seront automatiquement ajoutés à la feuille d'appel."
- **Duplicate error (409)**: "Une séance existe déjà pour ce groupe à cette date et cette heure."
- **Session detail / attendance** (`/seances/:id`):
  - Breadcrumbs "Séances / …", info card (subject, class, teacher, date long format, time range, badge type).
  - **Attendance sheet** card: title "Feuille d'appel", on the right live counters (two badges: "Présents 12" success, "Absents 2" danger) and two secondary buttons "Tout marquer présent" and "Tout marquer absent".
  - Table: Élève (avatar + name), Statut: a segmented control with two options "Présent" (selected = `success` bg) and "Absent" (selected = `danger` bg), default from the API.
  - Sticky bottom bar inside the card (white, border-top, right-aligned): primary button "Enregistrer l'appel", disabled until something changed; on click `PUT /absences/sessions/:id` with `{ records: [{studentId,isPresent}] }`, toast "Appel enregistré".
  - Unsaved changes: show browser `beforeunload` confirm and a small amber text "Modifications non enregistrées" next to the button.
  - Empty (no enrolled student): "Aucun élève inscrit à ce groupe" + link "Gérer les élèves du groupe".

### 7.10 Paiements (`/paiements`)
- **Header**: "Paiements" / "Historique des paiements des élèves" / "Ajouter un paiement".
- **Filters**: Élève (`AsyncCombobox`: type 2+ characters, calls `GET /students?search=&limit=10`, shows avatar + name + class; clearable), "Du" and "Au" (`type=date`).
- **API**: `GET /payments?studentId=&from=&to=&page=&limit=`.
- **Columns**: Date (`formatDate`), Élève (avatar + name link to detail), Description (truncate 60 chars with title tooltip, "—" if empty), Montant (right-aligned, 14px/700 `ink`, `formatMoney`), actions (Modifier, Supprimer).
- **PaymentFormDialog**: Élève* (`AsyncCombobox`, locked when opened from a student), Date* (`type=date`, default today, not in the future), Montant* (number input with a right addon "DA", min 0.01, step 0.01, max 2 decimals: "Montant invalide"), Description (textarea, 3 rows, max 255 chars with a counter).
- **Delete confirm text**: "Supprimer ce paiement de {montant} pour {élève} ?"

### 7.11 Paramètres (`/parametres`)
Backend only offers the admin account, so only these cards (single column, max width 640px):
1. **Profil**: read-only. Avatar 56px (initial "A"), "Admin", "Administrateur", email from `/auth/me` in a disabled input with a `Lock` icon.
2. **Sécurité**: form "Changer le mot de passe": Mot de passe actuel*, Nouveau mot de passe* (min 8 chars: "8 caractères minimum"), Confirmer le nouveau mot de passe* (must match: "Les mots de passe ne correspondent pas"). Each password input has an eye toggle. Primary button "Mettre à jour le mot de passe". Success toast "Mot de passe mis à jour" and form reset. Backend 400/401 message shown inline under the first field (for wrong current password: "Mot de passe actuel incorrect").
3. **Session**: a card with a destructive-outline button "Se déconnecter".

### 7.12 Not found
Centered inside the layout: large "404" (64px/800 `brand-600`), "Page introuvable", "La page que vous cherchez n'existe pas ou a été déplacée.", button "Retour au tableau de bord".

---

## 8. Responsive and accessibility rules
- Breakpoints: mobile < 640, tablet 640-1023, desktop ≥ 1024.
- Below 1024: drawer sidebar, grids stack to 1 column (stat cards 2 columns from 640), PageHeader action button goes below the title.
- All icon-only buttons have `aria-label` (French). Dialogs trap focus and close with Esc (shadcn handles it). Every input has an associated `<label>`.
- Color contrast: body text never lighter than `muted` on white.
- The sidebar nav uses `<nav aria-label="Navigation principale">` and `aria-current="page"` on the active link.

---

## 9. Build phases (do in order, run the checks)

**Phase 1: Setup**
Create the Vite project, install dependencies and shadcn components listed in section 0, configure Tailwind tokens from section 1, `index.css` (font, `:root` variables, page background), path alias `@/` → `src/`, `.env`, folder structure from section 3, router skeleton with placeholder pages.
Check: app runs, every route shows a placeholder title, build passes.

**Phase 2: Design system**
Build `StatusBadge`, `InitialsAvatar`, `IconTile`, `StatCard`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `FormField`, `DataTable`, `Pagination`, `FilterBar`, `PageHeader`, `Breadcrumbs`, `AsyncCombobox`, skeletons, plus a dev-only page at `/ui-kit` (visible only when `import.meta.env.DEV`) showing all of them in every state.
Check: `/ui-kit` matches the style rules of section 1.4.

**Phase 3: Auth and shell**
`lib/api.ts`, `lib/auth.ts`, `useAuth`, `RequireAuth`, `LoginPage`, `AppLayout`, `Sidebar`, `Topbar` (GlobalSearch, NotificationBell, UserMenu; they may call endpoints that return nothing yet).
Check: login with the seeded admin, refresh keeps the session, a 401 sends you to `/login`, sidebar active state and mobile drawer work.

**Phase 4: Shared plumbing**
`format.ts`, `errors.ts`, `labels.ts`, `types/api.ts` (from Swagger), all `api/*.ts` files, `useListParams`, `useDebounce`, query client setup.
Check: a throwaway test page can fetch `/levels` and render the JSON.

**Phase 5: Niveaux** (7.5). **Phase 6: Matières** (7.6). **Phase 7: Professeurs** (7.7).
Check each: create, edit, delete (including the 409 messages), empty and loading states.

**Phase 8: Élèves** (7.3, 7.4). Check: filters sync with the URL, detail tabs work (the Groupes tab needs Phase 9 data, test with an empty state first).

**Phase 9: Groupes** (7.8). Check: enrolling a student of another class is impossible from the UI (list is filtered) and the backend 400 is displayed if forced.

**Phase 10: Séances et appel** (7.9). Check: create a session, open the attendance sheet, mark one absent, save, reload and see it persisted.

**Phase 11: Paiements** (7.10).

**Phase 12: Dashboard** (7.2). Check against an empty and a seeded database.

**Phase 13: Paramètres** (7.11), **Not found** (7.12).

**Phase 14: Polish**
Document titles, `?new=1` handling everywhere, responsive pass at 375px, 768px, 1280px, 1440px, keyboard pass, remove unused code, `README.md` (install, env, run, build).

---

## 10. Final acceptance checklist
- [ ] `npm run build` and `npm run lint` pass with zero errors.
- [ ] Every screen is in French with no leftover English text (backend activity titles are translated through `ACTIVITY_LABELS`).
- [ ] No route except `/login` is reachable without a token; logout clears everything.
- [ ] Sidebar, topbar, cards, tables, badges and buttons match the tokens in section 1 (dark indigo sidebar with glowing active pill, pale background, white rounded cards).
- [ ] Every list page has: loading skeleton, empty state, error state with retry, working filters synced to the URL, pagination.
- [ ] Every form validates, shows French error messages, disables the submit button while saving, and shows backend errors without closing.
- [ ] Every delete asks for confirmation and displays the backend 409 reason.
- [ ] Dashboard widgets render with seeded data and with an empty database (zeros, no crash).
- [ ] Attendance sheet saves and reloads correctly.
- [ ] Money always shows as `12 500,00 DA`, dates as `dd/MM/yyyy`.
- [ ] Works at 375px width (drawer sidebar, scrollable tables, stacked cards).
- [ ] No extra libraries beyond section 0, no dark mode, no unused pages.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-03T14:17:03+01:00.
</ADDITIONAL_METADATA>