var instruments = {};
class Instrument{
	name: string;
	type: string;
	playing: boolean;
	playblocks?: Pad[];
	buffer?: AudioBuffer;
	currentNode?: AudioBufferSourceNode;

	constructor(type: string, name: string){
		this.name = name;
		this.type = type;
		this.playing = false;
		this.currentNode = null;
	}

	controlView = () => {
		let controlWrapper = document.getElementById("seq-controls");	

		//check if existing controls
		if(controlWrapper.children.length > 0){
			controlWrapper.removeChild(controlWrapper.children[0]);
		}

		let controls = new Controls(this.name);
		//TODO: check if waveform empty
		controls.drawWaveform();
		controlWrapper.appendChild(controls.view);
	}

	setBuffer(): void {

	}
}

class Controls {
	name: string;
	view: HTMLDivElement;
	title: HTMLDivElement;
	playButton: HTMLButtonElement;
	waveformDisplay: HTMLCanvasElement;

	constructor(name: string){
		this.name = name;
		this.view = document.createElement('div');

		this.title = document.createElement('div');
		this.title.innerHTML = this.name;

		this.playButton = document.createElement('button');
		this.playButton.id = `play-${this.name}`;
		this.playButton.dataset.inst = this.name;
		this.playButton.style.height = "20px";
		this.playButton.innerHTML = "PLAY";
		this.playButton.addEventListener("click", () => {
			console.log("play button control clicked");
		});

		this.waveformDisplay = document.createElement('canvas');

		//frankenstein
		this.view.appendChild(this.title);
		this.view.appendChild(this.playButton);
		this.view.appendChild(this.waveformDisplay);
	}

	drawWaveform(){
		let sampleSkip = 100;

		let samples = instruments[this.name]["buffer"].getChannelData(0);
		let ctx = this.waveformDisplay.getContext('2d');
		let height = this.waveformDisplay.height;
		let width = this.waveformDisplay.width;

		ctx.lineWidth = 0.5;
		let moveDist = (width / samples.length) * sampleSkip;
		let currentPos = 0;
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(currentPos, height * samples[0]);
		for(let i = 1; i < samples.length; i += sampleSkip){
			ctx.lineTo(currentPos + moveDist, height/2 * samples[i] + height/2);
			currentPos += moveDist;
		}
		ctx.stroke();
	}
}

class Pad {
	view: HTMLDivElement;
	toggle: boolean;

	constructor(num: number, name: string){
		this.view = document.createElement('div');
		this.view.className = "pad";
		this.view.dataset.num = num.toString();
		this.view.dataset.instrument = name;

		this.toggle = false;
		this.view.addEventListener("click", () => {
			this.toggle = !this.toggle;
			this.toggle ? this.view.style.backgroundColor = "red" : this.view.style.backgroundColor = "#cecece";
		});
	}
}

class SeqRow {
	pads: Pad[];
	view: HTMLDivElement;
	instSelector: HTMLDivElement;
	button: HTMLDivElement;
	padsWrapper: HTMLDivElement;

	constructor(name: string){
		this.view = document.createElement('div');
		this.view.className = "seq-row";
		this.view.id = `row-${name}`

		this.instSelector = document.createElement('div');
		this.instSelector.className = "inst-selector";
		this.instSelector.id = `inst-selector-${name}`;

		this.button = document.createElement('div');
		this.button.className = "inst-selector-button";
		this.button.id = `inst-selector-button-${name}`
		this.button.innerHTML = name;
		this.instSelector.appendChild(this.button);
		this.view.appendChild(this.instSelector);

		this.padsWrapper = document.createElement('div');
		this.padsWrapper.className = "pads-wrapper";
		this.pads = this.addPads(name);
		this.pads.forEach(pad => {
			this.padsWrapper.appendChild(pad.view);
		});
		this.view.appendChild(this.padsWrapper);

		instruments[name].playblocks = this.pads;
		this.button.addEventListener("click", instruments[name].controlView);
		this.button.addEventListener("dragover", (e) => {e.preventDefault();})
		this.button.addEventListener("drop", async (e) => {
			e.preventDefault();
			instruments[name].buffer = await createAudioBufferFromFile(e.dataTransfer.files[0])
			instruments[name].controlView();
		});
	}

	addPads(name: string): Pad[]{
		let allPads = [];
		for(let i = 0; i < numPads; i++){
			allPads.push(new Pad(i, name));
		}
		return allPads;
	}
}


class Seq {
	addInstrument(name: string): any {
		instruments[name] = new Instrument("sampler", name);
		var seqWrapper = document.getElementById("seq-pads-wrapper");
		var seqRow = new SeqRow(name);
		seqWrapper.appendChild(seqRow["view"]);
	}
}

