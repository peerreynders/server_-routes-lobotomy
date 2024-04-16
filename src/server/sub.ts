// file: src/server/sub.ts
import { customAlphabet } from 'nanoid';
import { makeChat, type Chat } from '../lib/chat';
import { PUB_SUB_LINK, type PubBound, type SubBound } from './pub-sub';

type Send = (chat: Chat) => void;
type Pending = {
	id: string;
	expire: number;
	send: Send;
};

// Correlation ID so we know which `pending item` to use
// when we get the reply
const makeCorrelationId = customAlphabet('1234567890abcdef', 7);

// Need to time out if `src/server/pub.ts` doesn't reply
const REPLY_DELAY = 1500;
const msSinceStart = () => Math.trunc(performance.now());
let timeoutId: ReturnType<typeof setTimeout> | undefined;

// Hold the requests that are waiting for a reply
const pending = new Map<string, Pending>();

// Note: Expiry Scheduling is assumed to follow order
// of scheduling; items scheduled later
// are assumed to expire later.
function scheduleReply(delay: number) {
	if (timeoutId) return;
	timeoutId = setTimeout(replyTimeout, delay);
}

// Note: this is entirely synchronous
function replyTimeout() {
	const replyTo = [];
	let last: Pending | undefined;

	// We don't bother clearing timeouts
	// instead we may find there is just nothing to do

	// values() iterates in insertion order
	// i.e. oldest first
	for (const item of pending.values()) {
		const now = msSinceStart();
		if (now < item.expire) {
			last = item;
			break;
		}

		replyTo.push(item);
		pending.delete(item.id);
	}

	timeoutId = undefined;
	// There are still items waiting for a reply
	if (last) scheduleReply(last.expire - msSinceStart());

	// No need to be (a)waiting around
	// Just send an empty chat reply
	for (let i = 0; i < replyTo.length; i += 1)
		replyTo[i].send(makeChat([], Date.now(), replyTo[i].id));
}

// add to the pending map while ensuring
// there is an active timeout
function addPending(send: Send) {
	const id = makeCorrelationId();
	const item = {
		id,
		expire: REPLY_DELAY + msSinceStart(),
		send,
	};
	pending.set(id, item);
	scheduleReply(REPLY_DELAY);
	return id;
}

// Takes item off the pending map
// - Doesn't worry about clearing timeout
function takePending(takeId: string) {
	const item = pending.get(takeId);
	if (!item) return undefined;

	pending.delete(takeId);
	return item;
}

// Link channel across which the request/reply
// travels.
const channel = new BroadcastChannel(PUB_SUB_LINK);

// Start by making a request for past messages
// to `pub.ts` after placing it on the pending map.
function requestChat(send: Send) {
	const id = addPending(send);
	const messageRequest: PubBound = {
		id,
	};
	channel.postMessage(messageRequest);
}

// When a reply comes in, forward it and discard
// the pending `send`
const receiver = (event: MessageEvent<SubBound>) => {
	const message = event.data as SubBound;
	const item = takePending(message.id);
	if (!item) return;

	item.send(message);
};
channel.addEventListener('message', receiver);

export { requestChat };
