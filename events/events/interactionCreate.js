module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        console.log(`📌 تم استخدام الأمر: /${interaction.commandName}`);

        // سيتم وضع أوامر البوت هنا لاحقًا
    });
};