// file: src/routes/index.tsx
import {
	createEffect,
	For,
	onMount,
	Show,
	Suspense,
	startTransition,
} from 'solid-js';
import { useSubmission } from '@solidjs/router';

import { useMessages } from '../components/index/use-messages';
// FYI: suspect this causes an unneeded instantiation
// instantiation of src/server/pub.ts during SSR
import { broadcast } from '../api';
import {
	formatTimeOnly,
	formatISO,
	type FormatTimeFn,
} from '../lib/shame';

const REFETCH_DELAY = 15000;
let timeoutId: ReturnType<typeof setTimeout> | undefined;

const MESSAGE_ERROR =
	'At least one non-whitespace character is required to send';

function onMessageInvalid(event: Event) {
	if (!(event.target instanceof HTMLInputElement)) return;

	event.target.setCustomValidity(MESSAGE_ERROR);
	event.stopPropagation();
}

function onMessageInput(event: Event) {
	if (!(event.target instanceof HTMLInputElement)) return;

	event.target.setCustomValidity('');
	event.stopPropagation();
}

export default function Home() {
	let formatTime: FormatTimeFn = () => '';

	const [store, nextFetch] = useMessages();
	const refetch = () => {
		timeoutId = undefined;
		nextFetch();
	};
	const startFetch = () => startTransition(refetch);

	createEffect(() => {
		if (store().at > 0) timeoutId = setTimeout(startFetch, REFETCH_DELAY);
	});

	onMount(() => {
		formatTime = formatTimeOnly;
		// trigger first fetch
		refetch();
	});

	const isSending = useSubmission(broadcast);
	let formRef: HTMLFormElement | undefined;
	const clearFormTask = () => formRef?.reset();
	const clearAfterSubmit = (event: SubmitEvent) => {
		if (event.currentTarget !== formRef) return;

		requestAnimationFrame(clearFormTask);
	};

	return (
		<main>
			<form
				ref={formRef}
				action={broadcast}
				method="post"
				onSubmit={clearAfterSubmit}
			>
				<label>
					Message:
					<input
						type="text"
						name="message"
						required
						pattern="^.*\S.*$"
						onInvalid={onMessageInvalid}
						onInput={onMessageInput}
						title={MESSAGE_ERROR}
					/>
				</label>
				<button type="submit" disabled={isSending.pending}>
					Send
				</button>
			</form>
			<Suspense>
				<Show when={store().at > 0}>
					<div>
						Received: {formatTime(store().at)} ({store().messages.length})
					</div>
					<ul>
						<For each={store().messages}>
							{(message) => (
								<li>
									<time datetime={formatISO(message.timestamp)}>
										{formatTime(message.timestamp)}
									</time>{' '}
									{message.body}
								</li>
							)}
						</For>
					</ul>
				</Show>
			</Suspense>
		</main>
	);
}

