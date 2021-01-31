var SpotifyWebApi = require('spotify-web-api-node');
const { Telegraf } = require('telegraf');
var express = require('express');
var request = require('request');
const fs = require('fs');
const ini = require('ini');

const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

var client_id = config.client_id; // Your client id
var client_secret = config.client_secret; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var app = express();

var spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

var scopes = ['ugc-image-upload',
        'user-read-recently-played',
        'user-top-read',
        'user-read-playback-position',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'app-remote-control',
        'streaming',
        'playlist-modify-public',
        'playlist-modify-private',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-follow-modify',
        'user-follow-read',
        'user-library-modify',
        'user-library-read',
        'user-read-email',
        'user-read-private'],
    state = 'some-state-of-my-choice';

app.get('/login', function(req, res) {
    res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
});

app.get('/callback', function(req, res) {
    res.sendStatus(200);
    code = req.query.code || null;
    spotifyApi.authorizationCodeGrant(code).then(
        function(data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        },
        function(err) {
            console.log('Something went wrong!', err);
        }
    );

    spotifyApi.getUserPlaylists(config.my_spotify_user)
        .then(function(data) {
            console.log('Retrieved playlists', data.body);
            res.write("hola");
        },function(err) {
            console.log('Something went wrong!', err);
        });
});

app.get('/refresh_token', function(req, res) {
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

console.log('Listening on 8888');
app.listen(8888);

var access_token;
var refresh_token;
var code;


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
    if (code == null && access_token == null && refresh_token == null){
        context.reply("First you need to login to your spotify account");
    }
});

bot.hears('computer',context =>{
   context.reply('Hi computer!');
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