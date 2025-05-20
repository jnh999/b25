# REST API

## `GET /api/users/spark/:spark-address`

Gets User for a given Spark Address, to be used for providing more context for a given Spark transfer. This is critical for UX to understand more about the address you're sending to (ex verified user).

## `GET /api/users`

Gets Publishable user data for user directory (username, name, spark address)
Include ?internal=true to eliminate current user (ex. for "transfer to" user dropdown options)

## `GET /api/issuers`

Gets Publishable issuer data for user directory (token name, distribution stats etc)

## `GET /api/issuers/:tokenPubKey`

Gets token data for a provided token pubKey from the issuer directory (token name, distribution stats etc). This is critical for UX (since users don't have access to token data otherwise, just pubkey)
