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
		this.buffer ? controls.drawWaveform() : console.log("waveform empty");
		controlWrapper.appendChild(controls.view);
	}
}

class Controls {
	name: string;
	view: HTMLElement;
	title: HTMLElement;
	playButton: HTMLElement;
	waveformDisplay: HTMLCanvasElement;

	constructor(name: string){
		this.name = name;
		
		this.title = makeElement("div", {
			innerHTML: this.name,
			style: {
				margin: "10px"
			}
		});

		this.playButton = makeElement('button', {
			id: `play-${this.name}`,
			innerHTML: "PLAY",
			dataset: {
				inst: this.name
			},
			style: {
				cursor: "pointer"
			},
			onclick: () => {
				console.log("Play button control clicked");
			}
		}, genericButton);

		this.view = document.createElement("div", {});
		this.waveformDisplay = makeElement('canvas', {});

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
	view: HTMLElement;
	toggle: boolean;

	constructor(num: number, name: string){
		this.toggle = false;
		this.view = makeElement('div', {
			className: "pad",
			style: {
				width: "30px",
				height: "30px",
				border: "1px solid black",
				backgroundColor: "#EDEDED",
				margin: "5px",
				borderRadius: "5px"
			},
			dataset: {
				num: num.toString(),
				instrument: name,
			},
			onclick: () => {
				this.toggle = !this.toggle;
				if(this.toggle){
					setStyle(this.view, {backgroundColor: colorScheme["red"]});
				} else {
					setStyle(this.view, {backgroundColor: colorScheme["lightgrey"]});
				}
			}
		})
	}
}

class SeqRow {
	pads: Pad[];
	view: HTMLElement;
	instSelector: HTMLElement;
	button: HTMLElement;
	padsWrapper: HTMLElement;

	constructor(name: string){
		this.pads = this.addPads(name);
		instruments[name].playblocks = this.pads;

		this.view = makeElement('div', {
			className: "seq-row",
			id: `row-${name}`
		});

		this.instSelector = makeElement('div', {
			className: "inst-selector",
			id: `inst-selector-${name}`
		});

		this.button = makeElement('div', {
			className: "inst-selector-button",
			id: `inst-selector-button-${name}`,
			innerHTML: name,
			style: {
				cursor: "pointer",
			},
			onclick: instruments[name].controlView,
			ondragover: (e) => {e.preventDefault();},
			ondrop: async (e) => {
				e.preventDefault();
				instruments[name].buffer = await createAudioBufferFromFile(e.dataTransfer.files[0])
				instruments[name].controlView();
			}
		}, genericButton);

		this.padsWrapper = makeElement('div', {
			className: "pads-wrapper",
		});

		this.pads.forEach(pad => {
			this.padsWrapper.appendChild(pad.view);
		});
		this.instSelector.appendChild(this.button);
		this.view.appendChild(this.instSelector);
		this.view.appendChild(this.padsWrapper);
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
