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
- [x] إنشاء `public/js/config.js` (رابط السيرفر المركزي)
- [ ] تعديل `public/js/app.js` لاستخدام API_BASE
- [ ] تعديل `public/members.html` لاستخدام API_BASE
- [ ] تعديل `public/index.html` (زرّ تسجيل الدخول)
- [ ] تعديل `index.html` (الواجهة التعريفية على GitHub Pages)
- [ ] ضبط `render.yaml` وحفظ الروابط
