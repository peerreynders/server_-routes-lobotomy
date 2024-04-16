// file: src/routes/api/messages
import { requestChat } from '../../server/sub';

// Route end-points seem to be served by an isolate that is separate
// from server functions (which includes actions).
// Conceptually `/server_` requests are processed by their own server. 

export function GET() {
	return new Promise<Response>((resolve, _reject) =>
		requestChat((chat) =>
			resolve(
				new Response(JSON.stringify(chat), { headers: { 'Content-Type': 'application/json' } })
			)
		)
	);
}
