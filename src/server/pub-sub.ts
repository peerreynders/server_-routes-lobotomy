// file: src/server/pub-sub.ts
import type { Chat } from '../lib/chat';

export type PubBound = {
	id: string;
};

export type SubBound = Chat;

const PUB_SUB_LINK = 'pub-sub-link';

export { PUB_SUB_LINK };
