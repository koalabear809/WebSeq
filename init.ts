const context = new AudioContext();
const schedule = new Scheduler();
const seq = new Seq();
const transport = new Transport(schedule);
var tempo = 140.0;
var numMeasures = 2;
var numPads = 4 * numMeasures; // 4/4 time

window.onload = () => {
	//transport
	document.getElementById("transport-wrapper").appendChild(transport.view);

	seq.addInstrument("kick");
	seq.addInstrument("snare");
	seq.addInstrument("hat");

	console.log("derp");
}
