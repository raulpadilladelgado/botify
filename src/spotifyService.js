const spotifyApiHandler = require("./spotifyApiHandler")

function login(){
    return "Please go to http://localhost:8888/login to login to your spotify account and grant us permission for" +
        " access to your music data and then type /sort";
}

function sortPlaylistByReleaseDate(){
    if (spotifyApiHandler.isLogged()) {
        spotifyApiHandler.sortPlaylist();
        return "Playlist has been sorted"
    }
    return login();
}

module.exports = {
    sortPlaylistByReleaseDate
}
