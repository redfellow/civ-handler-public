# civ-handler
Handles webhook messages from Civ 6 and sends them to Discord. Civ VI sends three values and you can only set a single endpoint to push the turn notifications in a Play By Cloud game. This app sits between Discord and Civ and redirects the POSTed messages to different Discord Webhooks based on partially matching the game name to a webhook. It also prevents the same turn notification from triggering multiple times.

Offers a log.html to view sent events and to display errors such as duplicate events.

Known limitations: Any MacOS user in a game with a Webhook enabled will have his/her client crash at "end turn" without a notification being sent. Aspyr has had this bug on "known bugs" page for 1.5 years at the time of updating this readme. https://support.aspyr.com/hc/en-us/articles/216979606-Civilization-VI-Mac-Known-Issues

## Install
Clone the repo and run `npm install`

## Configure
Add your games partial name, app port and steam nick to discord nick mappings into `server.js`
Add your server URL to Civ 6 webhook options
Note: From personal testing it would appear URLs with port number (eg `:8080`) just don't work. Even then, Civ takes it's sweet time to start pushign to the webhook and it still it doesn't happen always.

## Run
Run the script with `node server.js`

## Troubleshooting
Paradox has not stated what kind of servers work and what don't. From my testing, port number or https in the url doesn't work. I'm using something like http://www.mydomain.com/civ/new_turn and it worked after I started a new game with said hook enabled for every turn. 

Don't use hooks if you have people playing with MacOs though, their game will crash after each turn. Aspyr knows about the bug, but hasn't patched it for a year now (and counting).
