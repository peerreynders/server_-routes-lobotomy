// file: src/lib/chat.ts
export type ChatMessage = {
	timestamp: number;
	body: string;
};

export type Chat = {
	kind: 'chat';
	id: string;
	timestamp: number;
	messages: ChatMessage[];
};

const makeChat = (
	messages: ChatMessage[],
	timestamp: number,
	id: string
): Chat => ({
	kind: 'chat',
	id,
	timestamp,
	messages,
});

export { makeChat };
