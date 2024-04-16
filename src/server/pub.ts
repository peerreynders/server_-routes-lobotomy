// file: src/server/pub.ts
import { makeChat, type ChatMessage } from '../lib/chat';
import { PUB_SUB_LINK, type PubBound } from './pub-sub';

let channel: BroadcastChannel | undefined;

const cache: Array<ChatMessage> = [];
const epochTimestamp = Date.now;
const messageTimestamp = (messages: ChatMessage[]) =>
	messages.length > 0 ? messages[0].timestamp : epochTimestamp();

// Note: this module doesn't reply to requests
// until the first `broadcast` call loads the module.
// This makes it necessary for the `src/server/sub.ts` to time out

// Listen for requests for messages and reply with
// those found in the cache;
function listenForRequests() {
	if (channel) return;

	channel = new BroadcastChannel(PUB_SUB_LINK);

	const receiver = (event: MessageEvent<PubBound>) => {
		const message = event.data as PubBound;
		const messages = cache.slice().reverse();
		const reply = makeChat(messages, messageTimestamp(messages), message.id);
		channel?.postMessage(reply);
	};
	channel.addEventListener('message', receiver);
}

// Cache the message for later
// Set up the channel it necessary.
async function broadcast(body: string) {
	if (!channel) listenForRequests();

	cache.push({
		timestamp: epochTimestamp(),
		body,
	});
	return true;
}

export { broadcast };
