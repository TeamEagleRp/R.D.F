module.exports = (client) => {
    client.once('ready', () => {
        console.log(`✅ البوت اشتغل: ${client.user.tag}`);
    });
};