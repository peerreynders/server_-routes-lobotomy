An example of using [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) to bridge the gap between [`src/server/pub.ts`](./src/server/pub.ts) which executes in the “`_server`” space by virtue of being used as a [server action](./src/api.ts) and [`src/server/sub.ts`](./src/server/sub.ts) which executes in the “`routes`” space because it is accessed from [`src/routes/api/messages.ts`](./src/routes/api/messages.ts).

- `pub.ts` stores all past messages submitted with a server action. It responds to messages over [`pub-sub-link`](./src/server/pub-sub.ts) by sending all the messages it currently has.
- [`src/routes/index.tsx`](./src/routes/index.tsx) has a form that uses the server action to broadcast a message. It also uses [`useMessages()`](./src/compoonents/index/use-messages.ts) to poll `/api/messages` every 15 seconds to get the full set of messages (the original uses [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) but here polling is used to keep the example simple).
- `src/server/sub.ts` is accessed by `src/routes/api/messages.ts` to obtain the messages. `sub.ts` requests them from `pub.ts` over `pub-sub-link` and times out after 1.5 seconds if it doesn't get a reply, returning an empty payload.

```shell
cd ../server_-routes-lobotomy
pnpm install

	Packages: +494
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	Progress: resolved 562, reused 488, downloaded 6, added 494, done

	dependencies:
	+ @solidjs/meta 0.29.3
	+ @solidjs/router 0.13.2
	+ @solidjs/start 1.0.0-rc.0
	+ nanoid 5.0.7
	+ solid-js 1.8.16
	+ vinxi 0.3.11

	Done in 6.1s
pnpm run dev

	> server_-routes-lobotomy@ dev
	> vinxi dev

	vinxi v0.3.11
	vinxi starting dev server

	  ➜ Local:    http://localhost:3000/
 	 ➜ Network:  use --host to expose
```
