# Im Prinzip – Frontend

Im Prinzip eine Self-Checkout-Kiosk-Anwendung auf Basis von **Electron + React**. Der Kunde scannt Artikel eigenständig ein, durchläuft den Checkout-Prozess und zahlt am Ende per Karte oder Bargeld.

---

## Setup

```bash
npm install
npm run dev
```

```bash
# Build
npm run build:mac
npm run build:win
npm run build:linux
```

---

## Tech-Stack

| Schicht | Technologie |
| --- | --- |
| Desktop-Shell | Electron |
| UI | React 18 + React Router |
| Styling | Tailwind CSS |
| Build | Vite (electron-vite) |
| Linting | ESLint + Prettier |
| Backend | REST-API auf `http://localhost:8000` |

---

## Projektstruktur

```text
src/renderer/src/
├── api/            # HTTP-Clients (je eine Datei pro Backend-Ressource)
├── components/     # Wiederverwendbare UI-Komponenten (reine Views)
├── context/        # React Contexts (z. B. DevModeContext)
├── hooks/          # ViewModels (Custom Hooks)
├── models/         # Daten- und Speicherlogik
├── pages/          # Seiten-Komponenten (reine Views)
└── assets/         # Bilder, Icons
```

---

## Architektur: MVVM

Das Projekt folgt dem **Model–View–ViewModel**-Muster. Jede Seite besteht aus drei Schichten, die strikt getrennt sind:

```text
View (JSX)
  └── const vm = useXyz()
        └── ViewModel (Custom Hook)
              └── import * from xyzModel
                    └── Model (pure JS)
```

## Naming Conventions

| Typ | Konvention | Beispiel |
| --- | --- | --- |
| Seiten | `PascalCase` + `Page.jsx` | `ScanPage.jsx` |
| Komponenten | `PascalCase.jsx` | `AgeVerificationModal.jsx` |
| ViewModels | `use` + `PascalCase` + `.js` | `useCheckoutLayout.js` |
| Models | `camelCase` + `Model.js` | `checkoutModel.js` |
| API-Clients | `camelCase` + `API.js` | `scannerAPI.js` |
| Konstanten (Modul-Ebene) | `SCREAMING_SNAKE_CASE` | `BUTTON_CLASS` |
| Funktionen / Variablen | `camelCase` | `handleBarcodeScan` |

---

## Checkout-Flow

```text
/scan  →  /summary  →  /payment
```

1. **ScanPage** – Artikel per Barcode scannen oder manuell über Kategorie-Buttons auswählen
2. **SummaryPage** – Warenkorb prüfen, Gutschein einlösen, Kundenkarte erfassen
3. **PaymentPage** – Zahlung per Karte oder Bargeld; Bon wird gedruckt

Der Zustand zwischen den Seiten wird über `sessionStorage` geteilt. Änderungen werden per Custom Event (`cartUpdated`, `inspectionStatusChanged`, `ageControlStatusChanged`) kommuniziert.

---

## USP: EcoScore

### Konzept

Kunden sammeln **Ecopunkte** durch Einkäufe. Beim Erreichen eines Vielfachen von 5 Punkten wird automatisch ein **5,00 €-Gutschein** generiert und auf dem Bon gedruckt.

### Flow

```text
1. Kundenkarte scannen (ScanPage)
       ↓ kundeApi.getKundeById()
       ↓ Punkte in sessionStorage speichern

2. Zahlung abschließen (PaymentPage)
       ↓ ecoApi.getEcopunkte(kundeId)
       ↓ punkte % 5 === 0?
         Ja  → ecoApi.createGutschein()
               Gutschein-Code auf Bon & Erfolgsbildschirm anzeigen
         Nein → kein Gutschein
```

### Manueller Gutschein (`useVoucher`)

Kunden können auf der SummaryPage einen vorhandenen Gutschein-Code einlösen:

1. Code eingeben → `ecoApi.validateGutschein(code, bestellbetrag)`
2. Bei Erfolg: Rabatt wird in `sessionStorage` gespeichert und in der Sidebar angezeigt
3. Bei Zahlung: `ecoApi.einloesenGutschein(code, bestellbetrag)` markiert den Gutschein als verwendet

### Umsetzung im Projekt

| Datei | Verantwortlichkeit |
| --- | --- |
| `api/ecoAPI.js` | HTTP-Calls zu `/api/gutschein/` und `/api/kunde/{id}/ecopunkte` |
| `hooks/usePayment.js` | Eco-Punkte prüfen, Gutschein generieren nach Zahlung |
| `hooks/useVoucher.js` | Manuellen Gutschein-Code validieren und einlösen |
| `models/paymentModel.js` | Warenkorb gruppieren, Preisberechnung |

---

## Mitarbeiter-Funktionen

Mitarbeiter gelangen über einen Klick auf das Logo in ein geschütztes Menü (Login erforderlich):

- **Stichprobenkontrolle** – Zufällig ausgelöste Warenkorbkontrolle
- **Alterskontrolle** – Wird automatisch ausgelöst, wenn ein Artikel ein `mindestalter ≥ 16` hat
- **Produktverwaltung** – Artikel anlegen, bearbeiten, deaktivieren
- **Einkauf zurücksetzen** – Löscht den gesamten `sessionStorage`

---

## Dev Mode

Wenn die App im Dev-Mode gestartet wird, erscheint ein roter **DEV MODE**-Banner. Im Dev-Mode sind zusätzliche Elemente sichtbar:

- Manuelles Barcode-Eingabefeld auf der ScanPage
- Scan-Button und Lampen-Test-Buttons (Tapo-Integration)
- Manueller Bon-Druck auf der PaymentPage

Aktivierung Mac: ctrl + d

## Lessons Learnd

- Mehr regelmäßige Syncs und Absprachen zwischen Frontend und Backend​

- Besseres Zeitmanagement /Deadlines​

- Ziele mehr vor Augen haben
