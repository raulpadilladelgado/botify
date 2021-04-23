const SpotifyWebApi = require('spotify-web-api-node')
const express = require('express')
const request = require('request')
const fs = require('fs');
const ini = require('ini')

const config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));

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

let code = "";
app.get('/callback', function(req, res) {
    res.sendStatus(200);
    code = req.query.code || null;
    spotifyApi.authorizationCodeGrant(code).then(
        function(data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);
            console.log('The code is' + code);

            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        },
        function(err) {
            console.log('Something went wrong!', err);
        }
    );
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

function isLogged(){
    return code !== "";
}

async function getUserPlaylists() {
    var result = await spotifyApi.getUserPlaylists().then(
        (data) => {
            return data.body;
        },
        (error) => {
            return error;
        }
    );
    if (result.body && result.body.error.message) return result.body.error.message;
    var playlists = [];
    for (let i = 0; i < result.items.length; i++) {
        playlists.push(result.items[i].name + " - " + result.items[i].id);
    }
    return playlists.toString().replace(/,/g, '\n');
}

function getTracksFromPlaylist(playlistId, offset) {
    return spotifyApi.getPlaylistTracks(playlistId,{
        offset: offset,
        fields: 'items'
    }).then(
        (data) => {
        return data.body;
        },
        (error) => {
        return error;
        }
    );
}
function addTracksToPlaylist(playlistId, tracks) {
    return spotifyApi.addTracksToPlaylist(playlistId, tracks).then(
        (data) => {
        return data.body;
        },
        (error) => {
            return error;
        }
    );
}

async function removeTracksFromPlaylist(playlistId) {
    var range = getRange(await getPlaylistLength(playlistId));
    var snapshotId = await getSnapshotId(playlistId);
    return spotifyApi.removeTracksFromPlaylistByPosition(playlistId, range, snapshotId).then(
        (data) => {
        return data.body;
        },
        (error) => {
            return error;
        }
    );
}

function getRange(max){
    let result = [];
    for (let i = 0; i < max; i++) {
        result.push(i);
    }
    return result;
}

function getPlaylistLength(playlistId){
    return spotifyApi.getPlaylist(playlistId).then(
        (data) => {
        return data.body.tracks.total;
        },
        (error) => {
        return error;
        }
    );
}

async function getTracks(result, playlistId) {
    var tracks = [];
    for (let i = 0; i < result; i = i + 100) {
        tracks = tracks.concat(await getTracksFromPlaylist(playlistId, i).then(data => data.items));
    }
    return tracks;
}

function sortTracks(tracks) {
    tracks.sort(function (a, b) {
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
}

function extractSpotifyUris(tracks) {
    let spotifyUris = [];
    for (let i = 0; i < tracks.length; i++) {
        spotifyUris.push(tracks[i].track.uri);
    }
    return spotifyUris;
}

async function addTracks(spotifyUris, playlistId) {
    let copyOfSpotifyUris = spotifyUris.slice();
    for (let i = 0; i < spotifyUris.length; i = i + 100) {
        await addTracksToPlaylist(playlistId, copyOfSpotifyUris.splice(0, 100));
    }
}

async function sortPlaylistByReleaseDateDesc(playlistId) {
    var result = await getPlaylistLength(playlistId);
    if (result.body && result.body.error.message) return result.body.error.message;
    var tracks = await getTracks(result, playlistId);
    sortTracks(tracks);
    let spotifyUris = extractSpotifyUris(tracks);
    await removeTracksFromPlaylist(playlistId);
    await addTracks(spotifyUris, playlistId);
}

function getSnapshotId(playlistId){
    return spotifyApi.getPlaylist(playlistId).then(
        (data) => {
        return data.body.snapshot_id;
        },
        (error) => {
        return error;
        }
    );
}

console.log('Listening on 8888');
app.listen(8888);

module.exports.getUserPlaylists = getUserPlaylists
module.exports.sortPlaylist = sortPlaylistByReleaseDateDesc
module.exports.extractSpotifyUris = extractSpotifyUris
module.exports.sortTracks = sortTracks
module.exports.getRange = getRange

