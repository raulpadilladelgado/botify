const spotifyApiHandler = require("./spotifyApiHandler")

login = () => "Please go to http://localhost:8888/login to login to your spotify account and grant us permission for" +
    "access to your music data";

sortPlaylistByReleaseDate = () => {
    if (spotifyApiHandler.isLogged) {
        return "Playlist has been sorted";
    }
    return this.login;
}

module.exports = {
    sortPlaylist: sortPlaylistByReleaseDate()
}
