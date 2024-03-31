const devBackend = 'http://34.16.184.222:8080/';

export function analyitics(eventType) {
	fetch(devBackend, {
		method: 'post',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({'event' : eventType})
	});
}
