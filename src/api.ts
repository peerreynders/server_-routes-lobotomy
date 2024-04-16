// file: src/api.ts
import { action } from '@solidjs/router';
import { broadcast as bcst } from './server/pub';

const NAME_BROADCAST = 'broadcast-message';

const broadcast = action<[data: FormData], boolean>(
	async (data: FormData) => {
		'use server';
		const body = data.get('message');
		if (typeof body !== 'string' || body.length < 1)
			return false;

		return bcst(body);
	}, NAME_BROADCAST);

export { broadcast };
