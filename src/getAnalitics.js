const devBackend = 'http://34.16.184.222:8080';
const container = document.getElementById('container');

function displayEventLog(eventLog) {
	for (const [_event, value] of Object.entries(eventLog)) {
		const d = document.createElement("div");
		let message;
		if (_event == 'check') {
			message = 'Број кликова на дугме \'Провера\'';
		} else if(_event == 'try-again') {
			message = 'Број кликова на дугме \'Покушај поново\'';
		} else if (_event == 'load') {
			message = 'Број учитавања';
		} else {
			message = 'Број кликова на дугме \'Следећи ниво\'';
		}
		d.innerHTML = `${message}:     ${value}`;
		container.appendChild(d);
	}
}

fetch(devBackend).then((res) => res.json().then((data)=> displayEventLog(data)));
