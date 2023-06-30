# About uptimechecks

An imitation of the popular "ping" network utilities but allow up to five URL and automatically send sms notifications base on if URL is up or down corresponding to the configuration "success codes"

## Dependencies

- Node
- Knex
- sqlite3
- dotenv

## DevDependencies

- Nodemon

## Usage

User account is necessarily, upon registration users can add up to 5 URl, Either http/https protocol per check, one of the CRUD Method,
timeout in seconds to signify "down state", list of succescodes that correspond to URL returns codes.

## Structure

### Backend

All data manipulated by the program are persisted on the hard disk via filessytem, .data is the root directory for any data related codes,
each module/library has a directory in the .data that correspond to the specific data i.e users related data is stored in ./data/users
checks = .data/checks , tokens = .data/tokens and .logs hold all logs related to checks activities performed by the workers every minutes  compressed daily and the .data/logs is the library that handle any logs related data

static assets are serve from the public directory and the client sides HTML is generated on the server sides by  specicific route handler  from the template directory

### Frontend

Any client sides codes are link via JS the client sides codes is located in app.js inside the public directory

### CLI

Admin can use the CLI to check for all Users, specific Users by [,--userId], all Checks, with either [,--up] for all Checks with up State and [,--down] for all Checks with down State, specific Checks by [,--checkId], all compressed log files note: only log file names which mapped to the check Id concatenated with the compressed date, specific log details by the log fileName [,--logsFileName] in the data base. To see all commands help or man will print all commands and their options/switch

### WIP

Admin should be able to filter log files name query by days=hours default is 24hrs = --one-day EX: "list logs --one-day, list logs --two-days, list logs --one-week ... and can follow it up by decompressing and showing the log details with logs details --{logsFileName}
