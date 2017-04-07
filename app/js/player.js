import emitterize from 'event-emitter';
import WaveSurfer from "wavesurfer.js";

const shuffle = (a) => {
	for (let i = a.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[a[i - 1], a[j]] = [a[j], a[i - 1]];
	}
};

const toKebab = (str) => str.replace(/[A-Z]/g, (str) => '-' + str.toLowerCase());

class QPlayer{
	constructor(settings){
		if(typeof settings !== 'object') settings = {};

		this.settings = {
			preloadEnabled: true,
			lyricCallback: undefined,
			plugins: [],
			visualizer: '#visualizer',
		};

		Object.keys(settings).forEach((k) => {
			this.settings[k] = settings[k];
		});

		this.originalQueue = [];
		this.queue = [];
		this._pointer = 0;
		this.loadedPointer = undefined;
		this._shuffle = false;
		this._repeat = false;
		this.surfer = WaveSurfer.create({
			container: this.settings.visualizer
		});
		this.lyrics = undefined;
		this.activatedLyric = undefined;
		this.plugins = [];
		this.commands = [];
		this.playing = false;

		this.vuexMutations = [
			'play',
			'pause',
			'stop',
			'next',
			'prev',
			'processAudio',
			'shuffle',
			'addQueue',
			'removeQueue',
			'swapQueue'
		];

		this.vuexMutationDefinitions = {
			play(state){
				state.play = true;
			},

			pause(state){
				state.play = false;
			},

			stop(state){
				state.play = false;
				state.time = 0;
			},

			next(state, playing){
				state.playing = playing;
				state.time = 0;
			},

			prev(state, playing){
				state.playing = playing;
				state.time = 0;
			},

			shuffle(state, shuffle){
				state.shuffle = shuffle;
			},

			processAudio(state, milliseconds){
				state.time = milliseconds;
			},

			addQueue(state, {queue}){
				state.queue = queue;
			},

			removeQueue(state, {queue}){
				state.queue = queue;
			},

			swapQueue(state, {queue}){
				state.queue = queue;
			}
		};

		this.vuexStates = {
			play: false,
			shuffle: false,
			queue: [],
			playing: undefined,
			time: 0
		};

		[
			'play',
			'pause',
			'stop',
			'togglePlay',
			'playQueue',
			'nextTrack',
			'prevTrack',
			'toggleShuffle',
			'toggleRepeat'
		].forEach((k) => {
			this.commands[toKebab(k)] = () => this[k]();
		});

		if(this.settings.plugins.length >= 1){
			this.plugins = this.settings.plugins.map((v) => {
				return v.connect(this.surfer.backend.ac, this);
			});

			const last = this.plugins.reduce((prev, curr) => {
				if(!Array.isArray(prev) || prev.length !== 2) return curr;
				if(!Array.isArray(curr) || curr.length !== 2) return prev;

				prev[1].connect(curr[0]);
				return curr;
			})[1];

			const first = this.plugins.reduceRight((prev, curr) => {
				if(!Array.isArray(prev) || prev.length !== 2) return curr;
				if(!Array.isArray(curr) || curr.length !== 2) return prev;

				return curr;
			})[0];

			this.surfer.backend.disconnectFilters();
			this.surfer.backend.analyser.disconnect();
			this.surfer.backend.analyser.connect(first);
			last.connect(this.surfer.backend.gainNode);
		}

		this.surfer.on('finish', () => this.nextTrack());
		this.surfer.on('audioprocess', (ev) => {
			const timestamp = Math.round(ev.playbackTime * 1000);
			if(this.lyrics !== undefined && this.lyrics[timestamp]){
				if(this.activatedLyric !== undefined) this.activatedLyric.activated = false;
				this.activatedLyric = this.lyrics[timestamp];
				this.activatedLyric.activated = true;
			}
			this.emit('processAudio', timestamp);
		});
	}

	get current(){
		return this.queue[this.pointer];
	}

	set current(v){}

	get nextTrackPointer(){
		return this.pointer + 1;
	}

	set nextTrackPointer(v){}

	get prevTrackPointer(){
		return this.pointer - 1;
	}

	set prevTrackPointer(v){}

	get shuffle(){
		return this._shuffle;
	}

	set shuffle(v){
		this.emit('shuffle', v);
		if(v){
			this._shuffle = true;
			const newQueue = shuffle(this.queue);
			this.pointer = newQueue.findIndex((v) => v.src === this.current.src);
			this.queue = newQueue;
		}else{
			this._shuffle = false;
			this.queue = this.originalQueue.slice();
		}
	}

	get repeat(){
		return this._repeat;
	}

	set repeat(v){
		this.emit('repeat', v);
		this._repeat = v;
	}

	set pointer(v){
		this._pointer = v;
		this.updateAudio();
	}

	get pointer(){
		return this._pointer;
	}

	addCommand(plugin, commandName, callback){
		this.commands[`${plugin.getName()}:${commandName}`] = callback;
	}

	execCommand(commandName, payload){
		const command = this.commands[commandName];
		if(typeof command !== 'function') return false;

		this.emit('execCommand', commandName, payload);

		command(payload);
	}

	toggleShuffle(){
		if(this.shuffle === false) this.shuffle = true;
		else this.shuffle = false;
	}

	addToQueue(src, title, author){
		if(this.originalQueue.find((v) => v.src === src)) return false;

		const wrapper = new AudioWrapper(this, src, title, author);

		this.originalQueue.push(wrapper);

		if(this.shuffle){
			this.queue.splice(Math.floor(Math.random() * this.queue.length), 0, wrapper);
		}else this.queue.push(wrapper);

		this.updateAudio();
		this.emit('addQueue', {audio: wrapper, queue: this.queue});
	}

	removeFromQueue(src){
		const currentOriginalIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(typeof currentOriginalIndex !== 'number') return false;

		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(typeof currentIndex !== 'number') return false;

		const audio = this.originalQueue[currentOriginalIndex];
		this.originalQueue.splice(currentOriginalIndex, 1);
		this.queue.splice(currentIndex, 1);

		this.updateAudio();
		this.emit('removeQueue', {audio, queue: this.queue});

		if(this.pointer === currentIndex){
			this.stop();
			this.play();
		}
	}

	playQueue(src){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);

		if(typeof currentIndex !== 'number') return false;
		this.pointer = currentIndex;

		this.stop();
		this.play();
	}

	changeOrder(src, newIndex){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		return this.changeIndexOrder(currentIndex, newIndex);
	}

	changeIndexOrder(currentIndex, newIndex){
		if(currentIndex === this.pointer) return false;

		if(typeof currentIndex !== 'number') return false;


		const extracted = this.queue.splice(currentIndex, 1);
		this.queue.splice(newIndex, 0, extracted);

		if(currentIndex < this.pointer && newIndex >= this.pointer) this.pointer--;
		if(currentIndex > this.pointer && newIndex <= this.pointer) this.pointer++;

		this.emit('swapQueue', {
			previousIndex: currentIndex,
			currentIndex: newIndex,
			queue: this.queue
		});
	}

	reserveNext(src){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(currentIndex === this.pointer + 1) return false;
		return this.changeIndexOrder(currentIndex, this.pointer + 1);
	}

	nextTrack(){
		if(this.queue.length < 1) return false;

		let next = this.nextTrackPointer;
		if(!this.queue[next]){
			if(this.repeat) next = 0;
			else return this.stop();
		}

		this.emit('next', this.queue[next]);
		this.pointer = next;
		this.stop();
		this.play();
	}

	prevTrack(){
		if(this.queue.length < 1) return false;

		let prev = this.prevTrackPointer;
		if(!this.queue[prev]){
			if(this.repeat) prev = this.queue.length - 1;
			else return this.stop();
		}

		this.emit('prev', this.queue[prev]);
		this.pointer = prev;
		this.stop();
		this.play();
	}

	seek(time){
		this.surfer.seekTo(time / this.surfer.getDuration());
	}

	play(){
		if(this.current === undefined) return false;

		if(this.current.loaded) {
			if(this.loadedPointer !== this.pointer){
				this.loadedPointer = this.pointer;
				const thiz = this;
				const event = function(){
					thiz.play();
					thiz.surfer.un('ready', event);
				};

				this.surfer.on('ready', event);
				this.surfer.loadBlob(this.current.blob);
				this.emit('insertMedia', this.current);
				return;
			}

			if(this.playing){
				this.pause();
			}
			this.lyrics = undefined;
			this.activatedLyric = undefined;

			if(this.settings.lyricCallback){
				this.settings.lyricCallback(this.current, (audio, lyric) => {
					if(audio.src !== this.current.src) return false;
					this.lyrics = {};
					lyric.forEach((v) => this.lyrics[v[0]] = new Lyric(v[0], v[1]));
				});
			}

			this.playing = true;
			this.emit('play', this.current);
			this.surfer.play();
		}else{
			if(!this.current.loading){
				this.emit('load', this.current);
				this.current.load();
			}
		}
	}

	pause(){
		if(!this.playing) return;
		this.emit('pause');
		this.playing = false;
		this.surfer.pause();
	}

	togglePlay(){
		if(!this.playing) this.play();
		else this.pause();
	}

	stop(){
		if(!this.playing) return;
		this.emit('stop');
		this.playing = false;
		this.surfer.stop();
	}

	attachToVuexStore(store){
		this.vuexMutations.forEach((v) => {
			this.on(v, (payload) => {
				store.commit(v, payload);
			});
		});
	}

	updateAudio(){
		this.queue.forEach((v, k) => {
			if(this.pointer === k){
				v._playing = true;
			}else v._playing = false;
		});
	}

	get defaultMutations(){
		return this.vuexMutationDefinitions;
	}

	get defaultStates(){
		return this.vuexStates;
	}

	get defaultActions(){
		const actions = [];
		Object.keys(this.commands).forEach((v) => actions[v] = (ctx, payload) => {
			this.execCommand(v, payload);
		});
		return actions;
	}
}

class AudioWrapper {
	constructor(player, audioSrc, title, author){
		this.title = title;
		this.author = author;
		this.player = player;
		this.src = audioSrc;
		this.loading = false;
		this.blob = undefined;
		this._playing = false;
	}

	load(){
		this.loading = true;
		const xhr = new XMLHttpRequest;
		xhr.open('GET', this.src, true);
		xhr.responseType = 'blob';

		xhr.onload = () => {
			this.blob = xhr.response;
			this.loading = false;
			if(this.playing) this.player.play();
		};
		xhr.send();
	}

	get loaded(){
		return this.blob !== undefined;
	}

	get playing(){
		return this.player.current.src === this.src;
	}
}

emitterize(QPlayer.prototype);


class Lyric{
	constructor(timestamp, content){
		this.timestamp = timestamp;
		this.content = content;
		this.activated = false;
	}
}

class QPlugin{
	connect(ctx, player){
		return [];
	}

	getName(){
		return '';
	}
}

class VolumePlugin extends QPlugin{
	constructor(l, r){
		super();
		this._volumeL = l;
		this._volumeR = r;
	}

	getName(){
		return 'volume';
	}

	connect(ctx, player){
		this.player = player;
		this.splitter = ctx.createChannelSplitter(2);

		this.lgain = ctx.createGain();
		this.lgain.gain.value = this.volumeL;

		this.rgain = ctx.createGain();
		this.rgain.gain.value = this.volumeR;

		this.merger = ctx.createChannelMerger(2);

		this.splitter.connect(this.lgain, 0, 0);
		this.splitter.connect(this.rgain, 1, 0);

		this.lgain.connect(this.merger, 0, 0);
		this.rgain.connect(this.merger, 0, 1);

		player.addCommand(this, "up", () => {
			this.volumeL += 0.1;
			this.volumeR += 0.1;
		});

		player.addCommand(this, "down", () => {
			this.volumeL -= 0.1;
			this.volumeR -= 0.1;
		});

		player.addCommand(this, "lup", () => {
			this.volumeL += 0.1;
		});

		player.addCommand(this, "ldown", () => {
			this.volumeR -= 0.1;
		});

		player.addCommand(this, "rup", () => {
			this.volumeR += 0.1;
		});

		player.addCommand(this, "rdown", () => {
			this.volumeR -= 0.1;
		});

		player.vuexMutations.push('volume-l', 'volume-r');
		player.vuexMutationDefinitions['volume-l'] = (state, vol) => {
			state['volume-l'] = vol;
		};
		player.vuexMutationDefinitions['volume-r'] = (state, vol) => {
			state['volume-r'] = vol;
		};

		player.vuexStates['volume-l'] = this.volumeL;
		player.vuexStates['volume-r'] = this.volumeR;
		return [this.splitter, this.merger];
	}

	get volumeL(){
		return this._volumeL;
	}

	set volumeL(v){
		this._volumeL = Math.max(0, Math.min(2, v));
		this.player.emit('volume-l', this._volumeL);
		this.updateVolume();
	}

	get volumeR(){
		return this._volumeR;
	}

	set volumeR(v){
		this._volumeR = Math.max(0, Math.min(2, v));
		this.player.emit('volume-r', this._volumeR);
		this.updateVolume();
	}

	updateVolume(){
		this.lgain.gain.value = this.volumeL;
		this.rgain.gain.value = this.volumeR;
	}
}

class EqualizerPlugin extends QPlugin{
	constructor(eq){
		super();
		this.eq = {
			60: 1,
			170: 1,
			310: 1,
			600: 1,
			1000: 1,
			3000: 1,
			6000: 1,
			12000: 1,
			14000: 1,
			16000: 1
		};

		Object.keys(eq).forEach((k) => {
			this.eq[k] = eq[k];
		});

		this.nodes = [];
	}

	getName(){
		return 'equalizer';
	}

	connect(ctx, player){
		this.ctx = ctx;
		this.nodes = [];
		this.player = player;

		Object.keys(this.eq).forEach((hz, i, arr) => {
			player.vuexMutations.push(`eq-${hz}`);
			player.vuexMutationDefinitions[`eq-${hz}`] = (state, db) => {
				state[`eq-${hz}`] = db;
			};

			player.vuexStates[`eq-${hz}`] = this.eq[hz];

			const node = ctx.createBiquadFilter();

			if(i === 0) {
				node.type = 'lowshelf';
			}else if(i === arr.length - 1){
				node.type = 'highshelf';
			}else {
				node.type = 'peaking';
				node.Q.value = 0.5;
			}

			node.gain.value = this.eq[hz];
			node.frequency.value = parseInt(hz);

			this.nodes[i] = node;
		});

		this.nodes.reduce((prev, curr) => {
			prev.connect(curr);
			return curr;
		});

		return [this.nodes[0], this.nodes[this.nodes.length - 1]];
	}

	updateEQ(){
		Object.keys(this.eq).forEach((hz, i) => {
			this.player.emit(`eq-${hz}`, this.eq[hz]);

			if(this.nodes[i]){
				this.nodes[i].gain.value = this.eq[hz];
			}
		});
	}
}

class KeyInputPlugin extends QPlugin{
	constructor(keymap){
		super();
		this.keymap = {
			"z": "prev",
			"x": "play",
			"c": "pause",
			"v": "next",
			"arrowup": "volume:up",
			"arrowdown": "volume:down"
		};
	}

	getName(){
		return 'key-input';
	}

	connect(ctx, player){
		document.addEventListener('keydown', (ev) => {
			let keyString = '';

			if(ev.ctrlKey) keyString += 'ctrl-';
			if(ev.alt) keyString += 'alt-'
			if(ev.shiftKey) keyString += 'shift-';
			if(ev.metaKey) keyString += 'cmd-';

			keyString += ev.key.toLowerCase();

			const key = this.keymap[keyString];
			if(key){
				if(typeof key === 'string') player.execCommand(key);
				else if(typeof key === 'object' && key.commandName){
					player.execCommand(key.commandName, key.payload);
				}
			}
		});
	}
}

export {QPlayer, QPlugin, EqualizerPlugin, VolumePlugin, KeyInputPlugin};
