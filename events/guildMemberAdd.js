module.exports = (client) => {
    client.on('guildMemberAdd', async (member) => {
        console.log(`👤 عضو جديد دخل السيرفر: ${member.user.tag}`);

        // نظام الترحيب يوضع هنا لاحقًا
    });
};