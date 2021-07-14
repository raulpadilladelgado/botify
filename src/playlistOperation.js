const apiResponseHandler = require('./apiResponseHandler');

async function getUserPlaylists() {
    var result = await apiResponseHandler.getUserPlaylistFromApi();
    if (result.body && result.body.error.message) return result.body.error.message;
    var playlists = [];
    for (let i = 0; i < result.items.length; i++) {
        playlists.push(result.items[i].name + " - " + result.items[i].id);
    }
    return playlists.toString().replace(/,/g, '\n');
}

async function removeTracksFromPlaylist(playlistId) {
    var range = getRange(await apiResponseHandler.getPlaylistLength(playlistId));
    var snapshotId = await apiResponseHandler.getSnapshotId(playlistId);
    return apiResponseHandler.removeTracksFromPlaylistByPosition(playlistId, range, snapshotId)
}

function getRange(max){
    let result = [];
    for (let i = 0; i < max; i++) {
        result.push(i);
    }
    return result;
}



async function getTracks(result, playlistId) {
    var tracks = [];
    for (let i = 0; i < result; i = i + 100) {
        tracks = tracks.concat(await apiResponseHandler.getTracksFromPlaylist(playlistId, i).then(data => data.items));
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
        await apiResponseHandler.addTracksToPlaylist(playlistId, copyOfSpotifyUris.splice(0, 100));
    }
}

async function sortPlaylistByReleaseDateDesc(playlistId) {
    var result = await apiResponseHandler.getPlaylistLength(playlistId);
    if (result.body && result.body.error.message) return result.body.error.message;
    var tracks = await getTracks(result, playlistId);
    sortTracks(tracks);
    console.log(tracks[0]);
    let spotifyUris = extractSpotifyUris(tracks);
    await removeTracksFromPlaylist(playlistId);
    await addTracks(spotifyUris, playlistId);
}

function findDuplicateTrack(tracks) {
    for (let i = 0; i < tracks.length ; i++) {
        var position = tracks.indexOf(tracks[i]);
        if (position !== -1 && i < tracks.length - 1 && tracks.indexOf(tracks[i],position + 1) !== -1){
            return tracks[i];
        }
    }
    return "no tracks were identical";
}

function extractTrackNames(tracks) {
    let trackNames = [];
    for (let i = 0; i < tracks.length; i++) {
        trackNames.push(tracks[i].track.name);
    }
    return trackNames;
}

async function findTracksWithSameName(playlistId){
    var result = await apiResponseHandler.getPlaylistLength(playlistId);
    if (result.body && result.body.error.message) return result.body.error.message;
    var tracks = await getTracks(result, playlistId);
    var trackNames = extractTrackNames(tracks);
    console.log(trackNames);
    return findDuplicateTrack(trackNames);
}

module.exports.getUserPlaylists = getUserPlaylists
module.exports.sortPlaylist = sortPlaylistByReleaseDateDesc
module.exports.extractSpotifyUris = extractSpotifyUris
module.exports.sortTracks = sortTracks
module.exports.getRange = getRange
module.exports.findTracksWithSameName = findTracksWithSameName