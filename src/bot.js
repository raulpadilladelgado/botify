const spotifyApi = require("./spotifyApi")
const { Telegraf } = require('telegraf');
const ini = require('ini');
const fs = require('fs');

const config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));

const bot = new Telegraf(config.bot_id);

bot.start((context)=>{
    context.reply("Hello " + context.from.first_name);
});

bot.help((context)=>{
    context.reply("Some commands");
});

bot.command(['list','List','LIST'], async (context)=> {
        let result = await spotifyApi.getUserPlaylists();
    for (let i = 0; i < result.items.length; i++) {
        context.reply(result.items[i].name + " - " + result.items[i].id);
    }
});

bot.on('text', async (context) => {
    let message = context.message.text;
    var result = await spotifyApi.getTracksFromPlaylist(message);
    for (let i = 0; i < result.items.length; i++) {
        console.log(result.items[i].track.name + " " + result.items[i].track.uri + " " + result.items[i].track.album.release_date);
    }
});

bot.launch();