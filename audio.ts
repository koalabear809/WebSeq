class Scheduler {
	lookahead: number;
	scheduleAheadTime: number;
	currentNote: number;
	nextNoteTime: number;
	notesInQueue: any[];
	timerID: any;

	constructor(){
		this.lookahead = 25.0;
		this.scheduleAheadTime = 0.1;
		this.currentNote = 0;
		this.nextNoteTime = 0.0;
		this.notesInQueue = [];
	}

	nextNote() {
		const secondsPerBeat = 60.0 / tempo;

		//increment
		console.log(this.currentNote)
		this.nextNoteTime += secondsPerBeat;
		this.currentNote++;
		if(this.currentNote === numPads){
			this.currentNote = 0;
		}
	}

	scheduleNote(beatNumber: number, time: number){

		//push note into queue
		this.notesInQueue.push({note: beatNumber, time: time});

		//check all instruments to see if active in current column
		for(const instrument in instruments){
			if(instruments[instrument]["playblocks"][beatNumber]["toggle"] === true){
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

	schedule(){
		while(this.nextNoteTime < context.currentTime + this.scheduleAheadTime){
			this.scheduleNote(this.currentNote, this.nextNoteTime);
			this.nextNote();
		}
		this.timerID = window.setTimeout(scheduleAgain => this.schedule(), this.lookahead);
	}
}

class Transport {
	isPlaying: boolean;
	playButton: HTMLElement;
	stopButton: HTMLElement;
	tempoControl: HTMLInputElement;
	view: HTMLElement;
	
	constructor(schedule: Scheduler){
		this.isPlaying = false;

		this.playButton = makeElement("button", {
			innerHTML: "PLAY",
			id: "transport-play-button",
			onclick: () => {
				this.isPlaying = !this.isPlaying;
				if(this.isPlaying){
					this.playButton.innerHTML = "PAUSE";
					schedule.nextNoteTime = context.currentTime;
					schedule.schedule(); //it begins...
				} else {
					this.playButton.innerHTML = "PLAY";
					window.clearTimeout(schedule.timerID);

					//stop & clear all current Nodes.
					for(const instrument in instruments){
						if(instruments[instrument].currentNode !== null){
							instruments[instrument].currentNode.stop();
							instruments[instrument].currentNode = null;
						}
					}
				}
			}
		}, genericButton);

		this.stopButton = makeElement("button", {
			innerHTML: "STOP",
			onclick: () => {
				schedule.currentNote = 0;
				window.clearTimeout(schedule.timerID);

				//stop & clear all current Nodes.
				for(const instrument in instruments){
					if(instruments[instrument].currentNode !== null){
						instruments[instrument].currentNode.stop();
						instruments[instrument].currentNode = null;
					}
				}
			}
		}, genericButton);

		this.view = makeElement("div", {
			style: {
				display: "flex",
				flexFlow: "row",
				marginTop: "10px",
				border: "1px solid red",
				borderRadius: "5px"
			}
		});

		this.tempoControl = makeElement("input", {
			type: "number",
			min: "20",
			max: "300",
			value: "140",
			style: {
				margin: "10px"
			},
			oninput: () => {
				tempo = parseInt(this.tempoControl.value);
			}
		});

		this.view.appendChild(this.playButton)
		this.view.appendChild(this.stopButton)
		this.view.appendChild(this.tempoControl)
	}
}

async function createAudioBufferFromFile(file: File){
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
