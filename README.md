# Welcome to botify
Botify born because its creator needs specific 
sorting functionalities in his spotify playlists.
It's a telegram bot that allow to its users to 
manage spotify playlist with special features.
At this time, we can only sort playlists by 
release date desc.

# Start local environment
## Clone project 

`git clone 
git@github.com:raulpadilladelgado/botify.git`

## Setup your config file

Clone config sample file to project 
folder by execute this:

`cp config.ini.example config.ini`

Replace sample values in _config.ini_ with your spotify developers app
and telegram bot credentials:

`client_id
client_secret
bot_id`

## Start server

Start server by execute this:

`npm run dev`

## Login

Give access to botify to access your spotify data. Go to browser and
enter URL:

http://localhost:8888/login

You're ready to manage your playlists!

# What we can do?
Type `/list` in a conversation with the bot for list user playlists

Type anything for search that playlist and order it by release data desc