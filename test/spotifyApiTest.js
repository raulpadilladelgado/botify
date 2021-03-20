const spotifyApi = require('../src/spotifyApi')
test('shouldExtractSpotifyUris',()=>{
    var tracks = [
        {
            "track": {
                "uri" : "dsf45454848"
            }
        },
        {
        "track": {
            "uri" : "dsf47845155"
         }
        }
        ];
    var spotifyUris = spotifyApi.extractSpotifyUris(tracks);
    expect(spotifyUris.toString()).toBe("dsf45454848,dsf47845155");
})