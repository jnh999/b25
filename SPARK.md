# Spark SDK Feedback

Overall, LOVED working on this project. Spark Docs are super accessible and the ease/abstractions make developing on Bitcoin incredibly productive (I felt like a achieved a lot more in 24hrs due to the ease of the SDKs). Also, very much appreciate your team's mentorship and on-call bug bashing during the hackathon, your team is awesome!

Can't express how excited I am by what Spark makes possible (thanks to the abstractions and speed), Really appreciate what y'all are doing to move this industry forward.

## Architecture

### Deposits

- Private addresses would be hugely valuable for a private UX and enabling cross-platform payments (by enabling spark addresses to be exposed externally without revealing user info). See [https://github.com/buildonspark/sip/issues/2](https://github.com/buildonspark/sip/issues/2) for some ideas I drafted.

### Transfers

- Transfer calls require process to remain open until transfer completes - it's nice to have the option to conitue on to prevent latency but may be valuable to provide the option await the transfer deposit claim completion return instead for 1) easier dev UX and 2) future calls down the line that may require those destination funds
- No "Get Transfer" API (only "List Transfers"), this'd be helpful for a more granular transfer lookup (ex. when implementing a "transfer details" page); also, for "List Transfers", the max page number would be helpful in the docs
- Atomic swaps, multisig, and Flutter SDK would be huge, great to see that on [your Q2 roadmap](https://docs.spark.money/home/beta-details#what-are-we-focusing-on-in-q2%3F)!

### Issuers

- Spark wallet SDK has no way of seeing Issuer token details (other than public key). Would y'all be open to adding a "get token details by pubkey" API?
- Is Spark thinking about spam tokens prevention at all (ex. Issuer creates fake, unbacked USDC token that users think is a real USDC token given same name/ticker). Not seeing anything about this in docs/roadmap. Curious if/how y'all are thinking about this challenge re backing or if your position is to stay neutral. Worried about Spark scams ruining Spark/BTC brand and if there are ideas to preventing that risk. This project explores this problem a bit with Proof of Reserve strategies to enable 1:1 backing for stablecoins assurance.
- Should add public token stat calls (token info, distribution, activity) so that non-issuer users can access (right now you need the issuer mnemonic to fetch them and it doesn't feel like there are any security risks to publishing them)

## sparkscan.io

Love the UX, super easy to use. Super nit: being able to provide token value vs USD amounts would be valuable to inform the "Market Cap field" - I'd also be interested in issuer details (ex. maybe verifications would be valuable so users/businesses know they truly got Circle/Spark-powered USD instead of a scam replica posing to be the same). Verification of some form via API would be interesting too (although maybe this is all in the domain of companies like flashnet/brale to own...)

## Docs

- Docs often refer to functions in named args pattern (ex. foo({arg1, arg2, arg3})) when they're in fact in standard pattern (ex. foo(arg1, arg2, arg3)). Refactoring them to consistently use named args would be great for better typing and simpler dev experience
- Nit: Issuer docs assume you have the wallet but never inform user on how to get the wallet. Assuming you get it the same way as in the wallet SDK, but it may be best to add that explicitly
- BitcoinNetwork is not an exported constant (requiring the need to use strings with type errors). Same for ExitSpeed. a @buildonspark/spark-sdk/types npm lib would be hugely valuable!

## Mainnet bugs

### Packages

The SDK's dependency on nice-grpc-web is causing build issues in Next.js/Vercel deployments due to missing WebSocket optimization packages. Error I see:

```
./node_modules/ws/lib/buffer-util.js
Module not found: Can't resolve 'bufferutil' in '/vercel/path0/node_modules/ws/lib'
Import trace for requested module:
./node_modules/ws/lib/buffer-util.js
./node_modules/ws/lib/receiver.js
./node_modules/ws/index.js
./node_modules/isomorphic-ws/node.js
./node_modules/nice-grpc-web/lib/client/transports/websocket.js
./node_modules/nice-grpc-web/lib/index.js
./node_modules/@buildonspark/spark-sdk/dist/chunk-VYLTFDYT.js
./node_modules/@buildonspark/spark-sdk/dist/index.js
./lib/services/spark/wallet.ts
./app/api/transfers/receive/route.ts
./node_modules/ws/lib/validation.js
Module not found: Can't resolve 'utf-8-validate' in '/vercel/path0/node_modules/ws/lib'
```

I think these packages (bufferutil and utf-8-validate), assuming they just need to be listed as peer dependencies in the SDK's package.json.

Impact:

- affects serverless deployments (like Vercel)
- causing build failures rather than just runtime warnings

## Transfer Spark<>Spark

Bug 1: Bug defined here: [https://github.com/buildonspark/spark/issues/19](https://github.com/buildonspark/spark/issues/19)

Bug 2: Non-integer amountSats results in the following error which is incorrect:

```
Error processing send transfer: Error [ValidationError]: Sats amount must be less than 2^53
```

### Transfer tokens

When calling transferTokens on a non-issuer Spark Wallet

```
Authentication error: ClientError: /spark_authn.SparkAuthnService/get_challenge INTERNAL: Received RST_STREAM with code 2 (Internal server error)
    at wrapClientError (/Users/jackhudson/Desktop/repos/sparkx/node_modules/nice-grpc/src/client/wrapClientError.ts:7:12)
    at Object.callback (/Users/jackhudson/Desktop/repos/sparkx/node_modules/nice-grpc/src/client/createUnaryMethod.ts:63:35)
    at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client.ts:360:26)
    at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client-interceptors.ts:458:34)
    at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client-interceptors.ts:419:48)
    at <anonymous> (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/resolving-call.ts:169:24)
    at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
  path: '/spark_authn.SparkAuthnService/get_challenge',
  code: 13,
  details: 'Received RST_STREAM with code 2 (Internal server error)'
}
/Users/jackhudson/Desktop/repos/sparkx/node_modules/@buildonspark/spark-sdk/dist/index.cjs:16504
      throw new AuthenticationError(
            ^


AuthenticationError: Authentication failed
    at ConnectionManager.authenticate (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@buildonspark/spark-sdk/dist/index.cjs:16504:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at ConnectionManager.createSparkClient (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@buildonspark/spark-sdk/dist/index.cjs:16462:23) {
  context: {
    endpoint: 'authenticate',
    reason: '/spark_authn.SparkAuthnService/get_challenge INTERNAL: Received RST_STREAM with code 2 (Internal server error)'
  },
  originalError: ClientError: /spark_authn.SparkAuthnService/get_challenge INTERNAL: Received RST_STREAM with code 2 (Internal server error)
      at wrapClientError (/Users/jackhudson/Desktop/repos/sparkx/node_modules/nice-grpc/src/client/wrapClientError.ts:7:12)
      at Object.callback (/Users/jackhudson/Desktop/repos/sparkx/node_modules/nice-grpc/src/client/createUnaryMethod.ts:63:35)
      at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client.ts:360:26)
      at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client-interceptors.ts:458:34)
      at Object.onReceiveStatus (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/client-interceptors.ts:419:48)
      at <anonymous> (/Users/jackhudson/Desktop/repos/sparkx/node_modules/@grpc/grpc-js/src/resolving-call.ts:169:24)
      at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
    path: '/spark_authn.SparkAuthnService/get_challenge',
    code: 13,
    details: 'Received RST_STREAM with code 2 (Internal server error)'
  }
}
```

I added a 5s timeout before the session exited but maybe it wasn't enough?
