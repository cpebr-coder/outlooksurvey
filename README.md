# Kuesioner Risk Outlook PLN 2027

**CESGS — Universitas Airlangga**

Instrumen survey untuk penyusunan Risk Outlook PLN 2027. Dual-path: Direksi (~8 menit) dan BOD-1 (~12 menit).

## Struktur Project

```
├── index.html          # Halaman survey
├── styles.css          # Stylesheet
├── script.js           # Logic & validasi
├── api/
│   └── config.js       # Serverless function (serve GAS_URL dari env)
├── Code.gs             # Google Apps Script backend
├── vercel.json         # Konfigurasi Vercel
├── package.json
├── .env.example
└── .gitignore
```

## Deployment

### 1. Setup Google Sheets + Apps Script

1. Buat spreadsheet baru di Google Sheets
2. **Extensions → Apps Script** → paste isi `Code.gs` → Save
3. Jalankan fungsi `testSetup` (buat header 3 sheet)
4. **Deploy → New deployment → Web app** → Execute as: Me, Access: Anyone → Deploy
5. Copy URL deployment

### 2. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/kuesioner-pln-2027.git
git push -u origin main
```

### 3. Deploy ke Vercel

1. Login [vercel.com](https://vercel.com) → **Add New Project** → Import repo GitHub
2. Framework Preset: **Other**
3. **Environment Variables** → tambahkan:
   - Key: `GAS_URL`
   - Value: URL dari step 1.5
4. Klik **Deploy**

### 4. Verifikasi

1. Buka URL Vercel
2. Centang persetujuan → Lanjutkan
3. Isi sebagai Direksi dan BOD-1
4. Cek data masuk di spreadsheet

## Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `GAS_URL` | URL deployment Google Apps Script Web App |

## Update GAS URL

Jika GAS URL berubah (re-deploy Apps Script), cukup update di **Vercel Dashboard → Settings → Environment Variables** — tidak perlu edit kode.
