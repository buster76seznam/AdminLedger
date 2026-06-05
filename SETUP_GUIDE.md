# Kompletní průvodce nastavením OpsMate AI

## Co potřebujete před začátkem

1. **Node.js 18+** - Stáhněte z https://nodejs.org
2. **PostgreSQL databáze** - Můžete použít:
   - Lokální PostgreSQL
   - Supabase (zdarma) - https://supabase.com
   - Neon (zdarma) - https://neon.tech
3. **OpenRouter API klíč** - Zdarma na https://openrouter.ai/keys
   - Získáte si vlastní klíč po registraci

## Krok 1: Vytvoření .env souboru

Vytvořte soubor `.env` v kořenovém adresáři projektu (`c:\Users\filip\Desktop\opsmate-ai\.env`):

```env
# Database (nahraďte svými údaji)
DATABASE_URL=postgresql://user:password@localhost:5432/opsmate

# NextAuth (vygenerujte tajný klíč)
NEXTAUTH_SECRET=vygenerujte-si-nahodny-retezec
NEXTAUTH_URL=http://localhost:3000

# OpenRouter API (AI funkce)
OPENROUTER_API_KEY=sk-or-v1-vase-openrouter-api-key
```

**Jak vygenerovat NEXTAUTH_SECRET:**
- Windows PowerShell: `openssl rand -base64 32`
- Pokud nemáte openssl, použijte jakýkoliv dlouhý náhodný řetězec

## Krok 2: Instalace závislostí (pokud ještě nejsou nainstalovány)

```bash
cd c:\Users\filip\Desktop\opsmate-ai
npm install
```

## Krok 3: Generování Prisma klienta

```bash
npx prisma generate
```

## Krok 4: Vytvoření databáze a migrace

```bash
# Vytvoření databáze (pokud používáte lokální PostgreSQL)
# V PostgreSQL:
CREATE DATABASE opsmate;

# Spuštění migrací
npx prisma migrate dev --name init
```

## Krok 5: Naplnění databáze testovacími daty (volitelné)

```bash
npm run db:seed
```

Toto vytvoří demo účet:
- Email: demo@opsmate.ai
- Heslo: password123

## Krok 6: Spuštění vývojového serveru

```bash
npm run dev
```

Aplikace bude běžet na: http://localhost:3000

## Krok 7: Přihlášení

1. Otevřete http://localhost:3000
2. Klikněte na "Sign In"
3. Přihlaste se pomocí demo účtu (pokud jste spustili seed):
   - Email: demo@opsmate.ai
   - Heslo: password123
4. Nebo si vytvořte nový účet přes "Sign Up"

## Co funguje

✅ Autentizace (registrace, přihlášení, odhlášení)
✅ Dashboard s přehledem
✅ Správa dokumentů (upload, zobrazení, detail)
✅ Správa úkolů
✅ Správa transakcí
✅ Správa faktur
✅ Správa zpráv
✅ Správa kontaktů
✅ Reporty
✅ Nastavení
✅ AI asistent (s OpenRouter free modely)
✅ Landing page s cenovými plány

## Co je třeba dodělat pro produkci

1. **Nastavení produkční databáze**
   - Použijte managed PostgreSQL (Supabase, Neon, AWS RDS)
   - Aktualizujte DATABASE_URL v produkčním prostředí

2. **S3 nebo jiný file storage**
   - Nastavte AWS S3 nebo jiný S3-compatible storage
   - Přidejte AWS credentials do .env

3. **Email service**
   - Nastavte Resend nebo SendGrid
   - Přidejte API klíč do .env

4. **Redis pro BullMQ**
   - Nastavte Redis pro background job processing
   - Přidejte REDIS_URL do .env

5. **Doména a HTTPS**
   - Nastavte vlastní doménu
   - Povolte HTTPS (Vercel to dělá automaticky)

## Řešení problémů

### Chyba: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Chyba: "Connection refused" při připojení k databázi
- Zkontrolujte, zda PostgreSQL běží
- Zkontrolujte DATABASE_URL v .env
- Ujistěte se, že databáze existuje

### Chyba: "NEXTAUTH_SECRET is not defined"
- Přidejte NEXTAUTH_SECRET do .env
- Restartujte server

### Chyba: "OpenRouter API key is invalid"
- Zkontrolujte OPENROUTER_API_KEY v .env
- Ujistěte se, že klíč je správný

## Produkční nasazení (Vercel)

1. Push kód na GitHub
2. Import projektu ve Vercel
3. Přidejte environment variables
4. Deploy

## Struktura projektu

```
opsmate-ai/
├── app/                    # Next.js app router
│   ├── (auth)/            # Autentizační stránky
│   ├── (dashboard)/       # Dashboard stránky
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React komponenty
│   ├── ui/               # shadcn/ui komponenty
│   └── layout/           # Layout komponenty
├── lib/                  # Utility funkce
│   ├── ai/               # AI service
│   ├── services/         # Business logic
│   ├── auth.ts           # NextAuth config
│   └── prisma.ts         # Prisma client
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── public/               # Static files
```

## Kontakt

Pokud máte problémy, zkontrolujte:
1. README.md - obecné informace
2. ENV_SETUP.md - detailní nastavení proměnných
3. Prisma dokumentaci - https://www.prisma.io/docs
