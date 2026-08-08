# تطبيق قطاع R.D.F

نظام إدارة الوحدة الأمنية R.D.F مع تسجيل الدخول عبر ديسكورد.

> ⚠️ **مهم**: هذا التطبيق يعتمد على **خادم Node.js/Express** (ملف `server.js`).
> **GitHub Pages لا يدعم تشغيل الخادم** ولا يمكنه معالجة مسارات مثل `/api/auth/discord`.
> يجب استضافة الخادم على منصة تدعم Node.js (Render، Railway، Koyeb، ...).

## المميزات
- تسجيل الدخول عبر ديسكورد (OAuth2)
- الصفحة الرئيسية: التعريف بقطاع R.D.F
- بيانات القطاع: إضافة الأسماء والرتب
- سجل المركبات: إضافة اسم السيارة واللون والصورة
- قائمة المطلوبين: إضافة الاسم والتهمة والدرجة والصورة
- سجل الحركات (Log) للمسؤولين
- لوحة المسؤولين: ترقية/تنزيل رتب، تحذيرات، فصل
- تسجيل دخول للخدمة + دخول موجه (رومات صوتية بالرقم)
- فقط القادة (بالأيدي المحددة) يمكنهم الإضافة، والباقي مشاهدة فقط
- كل البيانات تُعرض لكل المستخدمين المسجلين

## التشغيل محلياً (للاختبار)

### 1. تثبيت المتطلبات
```
npm install
```

### 2. إعداد بيانات الديسكورد
افتح ملف `.env` وضع القيم المناسبة:

1. اذهب إلى https://discord.com/developers/applications
2. أنشئ تطبيق جديد باسم "R.D.F"
3. من قسم OAuth2 → General انسخ:
   - **Client ID** → `DISCORD_CLIENT_ID`
   - **Client Secret** → `DISCORD_CLIENT_SECRET`
4. من "OAuth2 → Redirects" أضف: `http://localhost:3000/api/auth/callback`
5. من "OAuth2 → Scopes" فعّل `identify`
6. من قسم "Bot" أنشئ البوت وانسخ الـ Token وضعه في `DISCORD_BOT_TOKEN`
7. ضع أيدي السيرفر في `DISCORD_GUILD_ID`
8. ضع الأيدي في `ADMIN_IDS` (مفصولة بفواصل) للقادة الذين يمكنهم الكتابة
9. ضع قيمة سرية في `SESSION_SECRET`

### 3. تشغيل التطبيق
```
npm start
```
ثم افتح المتصفح على: `http://localhost:3000`

---

## النشر على الإنترنت (Render — مجاني)

> بدلاً من GitHub Pages، استخدم **Render** لأن التطبيق يحتاج خادم Node.js.

### الخيار الأول: نشر المستودع كاملاً (الأسهل — يُقدَّم كل شيء من رابط واحد)

1. ارفع هذا المشروع إلى GitHub (يوجد ملف `render.yaml` جاهز).
2. ادخل إلى [Render.com](https://render.com)
3. اضغط **New** → **Blueprint** → اختر مستودعك
4. Render سيقرأ `render.yaml` تلقائياً وينشئ الخدمة.
5. في تبويب **Environment** ضع القيم الفعلية:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_GUILD_ID`
   - `DISCORD_INVITE`
   - `ADMIN_IDS`
   - `SESSION_SECRET`
   - `REDIRECT_URI` = `https://اسم-خدمتك.onrender.com/api/auth/callback`
6. أنشئ تطبيقك من الصفر يُستضاف التطبيق بالكامل على الرابط.
7. **لا تنسَ** في Discord Developer Portal تحديث **Redirects** ليشمل رابط Render الجديد.

### الخيار الثاني: واجهة على GitHub Pages + خادم على Render

1. انشر الخادم (`server.js` + `bot.js` + `db.js` + `package.json` + `public/`) على Render كما في الخيار الأول.
2. انشر الواجهة (مجلد `public/`) على GitHub Pages.
3. عدّل ملف `public/js/config.js` واجعل:
   ```js
   window.API_BASE = 'https://اسم-خدمتك.onrender.com';
   ```
   بحيث تتجه كل طلبات `/api/...` إلى الخادم.
4. تأكد أن `REDIRECT_URI` في Discord مطابق لعنوان الخادم.

---

## بنية أهم الملفات
- `server.js` — خادم Express + OAuth (تسجيل الدخول) + API + البوت
- `bot.js` — بوت Discord (الحضور، الرتب، الرومات الصوتية)
- `db.js` — تخزين البيانات في ملف `data.json`
- `public/` — الواجهة (HTML/CSS/JS)
- `render.yaml` — إعداد النشر الجاهز على Render
- `.env` — المتغيرات السرية (لا يُرفع إلى Git)

## ملاحظات
- البيانات تُحفظ في ملف `data.json`
- الصور تُحفظ في مجلد `uploads`
- القادة فقط (حسب `ADMIN_IDS`) يرون نماذج الإضافة
- جميع الأعضاء المسجلين يرون البيانات المضافة
</content>

