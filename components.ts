var instruments = {};

function contextMenu(e: PointerEvent, menuEntries: any[]){
	e.preventDefault();
	let xpos = e.clientX;
	let ypos = e.clientY;
	let contextMenu = makeElement('div', {
		id: "context-menu",
		style: {
			display: "block",
			position: "absolute",
			left: xpos,
			top: ypos,
			minWidth: "50px",
			border: "1px solid black",
			backgroundColor: "#EDEDED",
			borderRadius: "5px",
			boxShadow: "2px 2px 3px #9E9E9E",
		}
	});

	menuEntries.forEach(entry => {
		contextMenu.appendChild(makeElement('div', {
			innerHTML: entry.text,
			style: {
				border: "1px solid #9E9E9E",
				padding: "5px",
				cursor: "pointer",
			},
			onmouseover: function(){
				this.style.backgroundColor = "#9E9E9E";
			},
			onmouseleave: function(){
				this.style.backgroundColor = "#EDEDED";
			},
			onclick: entry.action
		}));
	});

	document.body.appendChild(contextMenu);
}

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
	this.waveformDisplay = makeElement('canvas', {
		style: {
			border: "1px solid #9E9E9E",
			height: "100px",
			width: "90%",
			margin: "10px"
		}
	});

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

function SeqRow(name: string, seq: any){
	this.pads = []
	this.seq = seq;
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
		name: name,
		innerText: name,
		seq: this.seq,
		style: {
			cursor: "pointer",
		},
		onclick: function(){
			instruments[this.name].showControl();
		},
		ondragover: (e: Event) => {e.preventDefault();},
		ondrop: async function(e: DragEvent){
			e.preventDefault();
			instruments[this.name].setBuffer(e.dataTransfer.files[0])
			instruments[this.name].showControl();
		},
		onkeydown: function(e: KeyboardEvent){
			if(
				e.code != "Enter" && 
				e.code != "ArrowRight" &&
				e.code != "ArrowLeft" &&
				e.code != "ArrowDown" &&
				e.code != "ArrowUp"
			){
				this.oninput = function(){
					this.oninput = null;
					let oldName = this.name;
					this.name = this.textContent;
					instruments[this.name] = instruments[oldName]
					delete instruments[oldName];
				};
			}
		},
		oncontextmenu: function(e: any){
			let menu = [{
				text: "Rename",
				action: function(){
					e.path[0].contentEditable = true;
					e.path[0].focus();
					e.path[0].onblur = () => {e.path[0].contentEditable = false;};
				}
			},
			{
				text: "Delete",
				action: () => {
					console.log("delete");
					this.seq.wrapper.delInstrument(name, this.parentElement.parentElement);
				}
			}]
			contextMenu(e, menu)
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
	this.wrapper = document.getElementById("seq-pads-wrapper");
	this.wrapper.addInstrument = (name: string) => {
		instruments[name] = new OneShot(name);
		var seqRow = new SeqRow(name, this);
		this.instrumentWrapper.appendChild(seqRow["view"]);
	}
	this.wrapper.delInstrument = function(name: string, seqrow: any){
		let allKeys = Object.keys(instruments);
		for(let i = 0; i < allKeys.length; i++){
			if(allKeys[i] === name){
				try{
					instruments[allKeys[i - 1]].showControl();
				} catch {
					try{
						instruments[i + 1].showControl();
					} catch {
						try{
							instruments[0].showControl();
						} catch {
							document.getElementById('seq-controls').innerHTML = '';
						}
					}
				}
			}
		}
		delete instruments[name];
		seqrow.remove();
	}

	this.allIndicators = [];
	this.indicators = makeElement('div', {
		style: {
			display: "inline-flex",
			marginLeft: "110px",
		}
	});

	//indicators
	(() => {
		for(let i = 0; i < numPads; i++){
			let newIndicator = makeElement('div', {
				style: {
					height: "5px",
					width: "10px",
					margin: "16px",
					backgroundColor: "#EDEDED",
				},
			});

			this.allIndicators.push(newIndicator);
			this.indicators.appendChild(newIndicator);
		}
	})();

	this.instrumentWrapper = makeElement('div', {});

	this.addButton = makeElement('button', {
		innerHTML: "+",
		style: {
			width: "20px"
		},
		onclick: function(){
			let numInstruments = Object.keys(instruments).length;
			this.parentElement.addInstrument(`inst ${numInstruments}`);
		}
	}, genericButton);

	this.wrapper.appendChild(this.indicators);
	this.wrapper.appendChild(this.instrumentWrapper);
	this.wrapper.appendChild(this.addButton);
}
