# LSPD - الإصلاحات

تم إصلاح المشاكل التي ظهرت في الفيديو وفي نسخة المشروع المرفوعة:

1. إصلاح سبب فشل Render: `server.js` كان يستدعي `./public/bot` بينما ملف البوت موجود في جذر المشروع باسم `bot.js`.
2. إبقاء ملف البوت خارج `public` حتى لا يتم كشف كود البوت للمتصفح.
3. إصلاح `PermissionFlagsBits` المستخدم في نظام الموجه الصوتي.
4. إصلاح مسارات `config.js` و`login.js` وLive Reload في صفحة تسجيل الدخول.
5. جعل الواجهة تستخدم نفس عنوان السيرفر تلقائياً بدلاً من رابط Render ثابت.
6. إصلاح Live Reload الذي كان يغيّر البصمة كل ثانيتين بسبب `Date.now()` وبالتالي يسبب إعادة تحميل مستمرة في وضع التطوير.
7. تخفيف طلبات Discord الخاصة بجلب الأعضاء من كل 20 ثانية إلى 60 ثانية لتقليل Rate Limit.
8. منع تسجيل الدخول لمن ليس عضواً في سيرفر LSPD فعلياً.
9. تحسين جلسة تسجيل الدخول للعمل خلف HTTPS/Proxy في Render.
10. إزالة الأسرار من `.env.example` وعدم تضمين `.env` الحقيقي في حزمة النشر.
11. إضافة `TARGET_ROLE_ID` إلى إعدادات Render.
12. إزالة ملف patch قديم من `public` لأنه كان يعتمد على ملف `public/bot.js` غير الموجود.

## تشغيل محلي

```bash
npm install
node server.js
```

## Render

ضع القيم الحقيقية للمتغيرات في Environment داخل Render. لا ترفع `.env` إلى GitHub.

تأكد من أن Discord Developer Portal يحتوي على Redirect URI التالي:

`https://YOUR-APP.onrender.com/api/auth/callback`

ويجب أن يطابق قيمة `REDIRECT_URI` في Render حرفياً.
