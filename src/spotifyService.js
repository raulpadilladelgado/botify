const spotifyApiHandler = require("./spotifyApiHandler")

let login = () => "Please go to [login page](google.es) to login to your spotify account and grant us permission for" +
    " access to your music data and then type /sort";

let sortPlaylistByReleaseDate = () => {
    if (spotifyApiHandler.isLogged) {
        return "Playlist has been sorted";
    }
    return login();
}

module.exports = {
    sortPlaylist: sortPlaylistByReleaseDate()
}
