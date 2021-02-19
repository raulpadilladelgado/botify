const spotifyService = require("./spotifyService")
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

bot.settings((context)=>{
    context.reply("Some configurations");
});

bot.command(['sort','Sort','SORT'], (context)=> {
    let sortPlaylist = spotifyService.sortPlaylistByReleaseDate();
    context.replyWithMarkdown(sortPlaylist);
});

 let spotifyApiHandler = require('./spotifyApiHandler');
 bot.hears('computer',context =>{
     let code = spotifyApiHandler.getCode();
     if (code != ""){
         context.reply(code);
     }else{
         context.reply("prueba otra vez");
     }
 });

bot.on('text', context =>{
   context.reply('Sorry, i can not understand you');
});

bot.on('sticker', context =>{
   context.reply('❓');
});

bot.mention('BotFather', context =>{
   context.reply('You mentioned someone');
});

bot.phone('+34 000000000',context=>{
    context.reply("Telephone number");
})

bot.launch();