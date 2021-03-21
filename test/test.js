const spotifyApi = require('../src/spotifyApi')

var tracks = [
    {
        "track": {
            "uri" : "dsf45454848",
            "album":{
                "release_date": '2021-01-01'
            }
        }
    },
    {
        "track": {
            "uri" : "dsf47845155",
            "album":{
                "release_date": '2021-01-20'
            }
        }
    }
];

test('shouldExtractSpotifyUris',()=>{
    var spotifyUris = spotifyApi.extractSpotifyUris(tracks);
    expect(spotifyUris.toString()).toBe("dsf45454848,dsf47845155");
});

test('shouldSortPlaylistByReleaseDateDesc',()=>{
    spotifyApi.sortTracks(tracks);
    expect(tracks[0].track.uri).toBe('dsf47845155');
})

test('shouldCalculateRange',()=>{
    var range = spotifyApi.getRange(5);
    expect(range.toString()).toBe("0,1,2,3,4");
})