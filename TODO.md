# TODO - نظام التحديث التلقائي (Live Reload)

- [x] إنشاء `live-reload.js` (وحدة حساب بصمة الملفات)
- [x] إنشاء `public/live-reload-client.js` (سكربت المتصفح)
- [x] تعديل `server.js` لربط الـ middleware
- [x] حقن السكربت في `public/index.html`
- [x] حقن السكربت في `public/dashboard.html`
- [x] حقن السكربت في `public/members.html`
- [x] حقن السكربت في `index.html` (الواجهة التعريفية)
- [x] اختبار التشغيل محلياً
- [x] إعداد PM2 لتشغيل البوت 24/7 مع إعادة تشغيل تلقائية (watch mode)

# ضبط الواجهة مع السيرفر على Render (حل مشكلة 404)
- [x] إنشاء `public/js/config.js` (رابط السيرفر المركزي + غلاف fetch عام)
- [x] ربط `config.js` قبل كل سكربتات الواجهة (dashboard, members, index/login) ليعمل غلاف fetch تلقائياً
- [x] ربط زرّ تسجيل الدخول بـ `window.LOGIN_URL` (نقطة `/api/auth/discord` على السيرفر)
- [x] إنشاء `render.yaml` (إعداد نشر Node.js على Render)
- [x] إنشاء `.env.example` (قوالب المتغيرات بدون أسرار)
- [x] تحديث `README.md` بتعليمات النشر على Render
- [x] تصحيح رابط المستودع والرفع إلى `TeamEagleRp/LSPD-com.-`
- [x] التأكد من عدم رفع `.env` (الأسرار تبقى محلياً فقط)
