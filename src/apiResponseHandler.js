const server = require("./server")

function getUserPlaylist() {
    return server.spotifyApi.getUserPlaylists().then(
        (data) => {
            return data.body;
        },
        (error) => {
            return error;
        }
    );
}

function getTracksFromPlaylist(playlistId, offset) {
    return server.spotifyApi.getPlaylistTracks(playlistId,{
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
    return server.spotifyApi.addTracksToPlaylist(playlistId, tracks).then(
        (data) => {
            return data.body;
        },
        (error) => {
            return error;
        }
    );
}

function getSnapshotId(playlistId){
    return server.spotifyApi.getPlaylist(playlistId).then(
        (data) => {
            return data.body.snapshot_id;
        },
        (error) => {
            return error;
        }
    );
}

function getPlaylistLength(playlistId){
    return server.spotifyApi.getPlaylist(playlistId).then(
        (data) => {
            return data.body.tracks.total;
        },
        (error) => {
            return error;
        }
    );
}

function removeTracksFromPlaylistByPosition(playlistId, range, snapshotId){
    return server.spotifyApi.removeTracksFromPlaylistByPosition(playlistId, range, snapshotId).then(
        (data) => {
            return data.body;
        },
        (error) => {
            return error;
        }
    );
}

module.exports.getUserPlaylistFromApi = getUserPlaylist
module.exports.getTracksFromPlaylist = getTracksFromPlaylist
module.exports.addTracksToPlaylist = addTracksToPlaylist
module.exports.getSnapshotId = getSnapshotId
module.exports.getPlaylistLength = getPlaylistLength
module.exports.removeTracksFromPlaylistByPosition = removeTracksFromPlaylistByPosition