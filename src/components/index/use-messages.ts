// file: src/components/index/use-messages.ts
import { createSignal, createResource, type Signal } from 'solid-js';
import { createStore, reconcile, unwrap } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import type { Chat } from '../../lib/chat';

const epochTimestamp = Date.now;
const messagesHref = isServer
	? undefined
	: document.location.origin + '/api/messages';

type FetchArgs = number;

type Messages = {
	at: number;
	messages: Chat['messages'];
};

type maybeMessages = Messages | undefined;

// Function to pass to createResource's `storage` option
function createMessagesSignal(value: maybeMessages) {
	const [store, setStore] = createStore({
		value,
	});
	return [
		() => store.value,
		(v: maybeMessages | ((v: maybeMessages) => maybeMessages)) => {
			const unwrapped = unwrap(store.value);
			typeof v === 'function' && (v = v(unwrapped));
			if (v) {
				setStore('value', 'at', v.at);
				setStore(
					'value',
					'messages',
					reconcile(v.messages, { key: 'timestamp', merge: true })
				);
			} else {
				setStore('value', undefined!);
			}
			return store.value;
		},
	] as Signal<maybeMessages>;
}

async function fetchMessages(_dontCare: number) {
	const at = epochTimestamp();
	if (!messagesHref) throw new Error('messagesHref not ready');

	const response = await fetch(messagesHref);
	if (!response.ok)
		throw new Error(
			`Unexpected response status ${response.status}: ${response.statusText}`
		);

	const chat = (await response.json()) as Chat;
	return {
		at,
		messages: chat.messages,
	};
}

function useMessages() {
	// signal used to trigger fetch
	const [fetchArgs, setFetchArgs] = createSignal<FetchArgs>(0);
	const nextFetch = () => {
		setFetchArgs(epochTimestamp());
	};

	// signal/store holding past messages
	// During SSR don't initiate fetch
	// use initial value instead
	const [store] = createResource<Messages, number>(fetchArgs, fetchMessages, {
		initialValue: {
			at: 0,
			messages: [],
		},
		ssrLoadFrom: 'initial',
		storage: createMessagesSignal,
	});

	return [store, nextFetch] as const;
}

export { useMessages };

