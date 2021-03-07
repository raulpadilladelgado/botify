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

bot.command(['sort','Sort','SORT'], async (context)=> {
        console.log("INIT");
        let result = await spotifyApi.getUserPlaylists();
    for (let i = 0; i < result.items.length; i++) {
        context.reply(result.items[i].name + " - " + result.items[i].id);
    }
        console.log("END");
});

bot.on('text', context =>{
   context.reply('Sorry, i can not understand you');
});

bot.on('sticker', context =>{
   context.reply('❓');
});

bot.launch();