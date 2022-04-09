async function createAudioBufferFromFile(file){
	let fileBuffer = await file.arrayBuffer();
	return context.decodeAudioData(fileBuffer);
}

function createAudioFromBuffer(buffer){
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	return source;
}

function playBuffer(buffer){
	let node = createAudioFromBuffer(buffer);
	node.start(0);
}

/*
 *	Sequencer
 */
const lookahead = 25.0 //scheduler frequency
const scheduleAheadTime = 0.1 //how far ahead to schedule audio

let currentNote = 0;
let nextNoteTime = 0.0;
function nextNote() {
	const secondsPerBeat = 60.0 / tempo;

	//increment
	nextNoteTime += secondsPerBeat;
	currentNote++;
	if(currentNote === numPads){
		currentNote = 0;
	}
}

const notesInQueue = [];
function scheduleNote(beatNumber, time){

	//push note into queue
	notesInQueue.push({note: beatNumber, time: time});

	//check all seq rows to see if active here
	for(const instrument in instruments){
		if(instruments[instrument]["pads"][beatNumber]["toggle"] === true){
			//stop any current nodes playing
			if(instruments[instrument].currentNode !== null){
				instruments[instrument].currentNode.stop()
				instruments[instrument].currentNode = null;
			}

			//assign to instrument node
			instruments[instrument].currentNode = createAudioFromBuffer(instruments[instrument]["buffer"]);
			
			//schedule start
			instruments[instrument].currentNode.start(time);
		}
	}
}

function scheduler() {
	while(nextNoteTime < context.currentTime + scheduleAheadTime){
		scheduleNote(currentNote, nextNoteTime);
		nextNote();
	}
	timerID = window.setTimeout(scheduler, lookahead);
}

let isPlaying = false;
document.getElementById("play-button").addEventListener("click", () => {
	isPlaying = !isPlaying;	

	if(isPlaying){
		//play that shit!
		currentNote = 0;
		nextNoteTime = context.currentTime;
		scheduler(); //it begins...
	} else {
		window.clearTimeout(timerID);

		//stop & clear all current Nodes
		for(instrument in instruments){
			if(instruments[instrument].currentNode !== null){
				instruments[instrument].currentNode.stop();
				instruments[instrument].currentNode = null;
			}
		}
	}
});
