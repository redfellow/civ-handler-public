# civ-handler
Handles webhook messages from Civ 6 and sends them to Discord

## Install
Clone the repo and run `npm install`

## Configure
Add your games partial name, app port and steam nick to discord nick mappings into `server.js`
Add your server URL to Civ 6 webhook options
Note: From personal testing it would appear URLs with port number (eg `:8080`) just don't work. Even then, Civ takes it's sweet time to start pushign to the webhook and it still it doesn't happen always.

## Run
Run the script with `node server.js`
