const context = new AudioContext();
const schedule = new Scheduler();
const transport = new Transport(schedule);
var tempo = 140.0;
var numMeasures = 2;
var numPads = 4 * numMeasures; // 4/4 time
const seq = new Seq();

window.onload = () => {
	/*
	 * general document behavior
	 */
	document.addEventListener("click", () => {
		//check if context menu is opened
		let contextMenu = document.getElementById("context-menu");
		if(contextMenu){
			document.body.removeChild(contextMenu);
		}
	});
	//transport
	document.getElementById("transport-wrapper").appendChild(transport.view);

	seq.wrapper.addInstrument("kick");
	seq.wrapper.addInstrument("snare");
	seq.wrapper.addInstrument("hat");
}
