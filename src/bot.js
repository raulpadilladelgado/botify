const spotifyApi = require("./spotifyApi")
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
        let result = await spotifyApi.getUserPlaylists();
    for (let i = 0; i < result.items.length; i++) {
        context.reply(result.items[i].name + " - " + result.items[i].id);
    }
});

bot.on('text', async (context) => {
    let playlistId = context.message.text;
    var playlistLength = await spotifyApi.getPlaylistLength(playlistId);
    var result = [];
    for (let i = 0; i < playlistLength; i=i+100) {
        result = result.concat(await spotifyApi.getTracksFromPlaylist(playlistId,i).then(data=>data.items));
    }
    result.sort(function(a, b) {
        var releaseDateA = a.track.album.release_date; // ignore upper and lowercase
        var releaseDateB = b.track.album.release_date; // ignore upper and lowercase
        if (releaseDateA < releaseDateB) {
            return 1;
        }
        if (releaseDateA > releaseDateB) {
            return -1;
        }
        return 0;
    });
    let spotifyUris = [];
    for (let i = 0; i < result.length; i++) {
        spotifyUris.push(result[i].track.uri);
    }
    let copyOf = spotifyUris.slice();
    console.log(copyOf.length);
    console.log(copyOf);
    console.log(await spotifyApi.removeTracksFromPlaylist(playlistId));
    for (let i = 0; i < spotifyUris.length; i = i + 100) {
        console.log(await spotifyApi.addTracksToPlaylist(playlistId,copyOf.splice(0,100)));
    }
});

bot.launch();