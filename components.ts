var instruments = {};

function Instrument(name: string){
	this.name = name;
	this.playing = false;
	this.playblocks = null;
	this.buffer = null;
	this.currentNode= null;
	this.view = null;
	this.showControl = () => {
		let controlWrapper = document.getElementById("seq-controls");	

		//check if existing controls
		if(controlWrapper.children.length > 0){
			controlWrapper.removeChild(controlWrapper.children[0]);
		}
		controlWrapper.appendChild(this.view);
	}
}

function OneShot(name: string){
	Instrument.call(this, name)
		//let controls = new Controls(this.name);
		//controlWrapper.appendChild(controls.view);
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

	this.view.appendChild(this.title);
	this.view.appendChild(this.playButton);
	this.view.appendChild(this.waveformDisplay);

	this.drawWaveform = function(){
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

	this.setBuffer = async function(file: File){
		this.buffer = await createAudioBufferFromFile(file)
		this.drawWaveform()
	}
}

function Pad(num: number, name: string){
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
	});
}

function SeqRow(name: string){
	this.pads = []
	for(let i = 0; i < numPads; i++){
		this.pads.push(new Pad(i, name));
	}
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
		onclick: instruments[name].showControl,
		ondragover: (e: Event) => {e.preventDefault();},
		ondrop: async (e: DragEvent) => {
			e.preventDefault();
			instruments[name].setBuffer(e.dataTransfer.files[0])
			instruments[name].showControl();
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

function Seq(){
	this.addInstrument = (name: string) => {
		instruments[name] = new OneShot(name);
		var seqWrapper = document.getElementById("seq-pads-wrapper");
		var seqRow = new SeqRow(name);
		seqWrapper.appendChild(seqRow["view"]);
	}
}
