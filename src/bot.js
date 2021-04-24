const playlistOperation = require("./playlistOperation")
const { Telegraf } = require('telegraf');
const ini = require('ini');
const fs = require('fs');

const config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));

const bot = new Telegraf(config.bot_id);

bot.start((context)=>{
    context.reply("Hello " + context.from.first_name);
    context.reply("TUTORIAL: \n 1. Use /list for view user playlist and playlist ids \n 2. Type a playlist id to sort it")
});

bot.help((context)=>{
    context.reply("TUTORIAL: \n 1. Use /list for view user playlist and playlist ids \n 2. Type a playlist id to sort it");
});

bot.command(['list','List','LIST'], async (context)=> {
        let result = await playlistOperation.getUserPlaylists();
        context.reply(result);
});

bot.on('text', async (context) => {
    let playlistId = context.message.text;
    await playlistOperation.sortPlaylist(playlistId);
    context.reply("Playlist " + playlistId + " was sorted");
});

bot.launch();