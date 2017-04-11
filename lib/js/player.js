import emitterize from 'event-emitter';
import WaveSurfer from "wavesurfer.js";

const shuffle = (array) => array.sort(() => 0.5 - Math.random());

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

		const _player = this;

		this.originalQueue = [];
		this.queue = [];
		this._pointer = -1;
		this.loadedSrc = undefined;
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
				state.time = 0;
			},

			prev(state, playing){
				state.time = 0;
			},

			shuffle(state, shuffle){
				state.shuffle = shuffle;
			},

			repeat(state, repeat){
				state.repeat = repeat;
			},

			insertMedia(state, media){
				state.playing = media;
				state.duration = _player.surfer.getDuration() * 1000;
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
			},

			reorderQueue(state, {queue}){
				state.queue = queue;
			}
		};

		this.vuexStates = {
			play: false,
			shuffle: false,
			repeat: false,
			queue: [],
			playing: undefined,
			time: NaN,
			duration: NaN
		};

		[
			'play',
			'pause',
			'stop',
			'playFromStart',
			'togglePlay',
			'nextTrack',
			'prevTrack',
			'toggleShuffle',
			'toggleRepeat',
			'addToQueue',
			'removeFromQueue',
			'playQueue',
			'changeOrder',
			'changeIndexOrder',
			'reserveNext',
			'seek',
			'drawWave'
		].forEach((k) => {
			this.commands[toKebab(k)] = (...args) => this[k](...args);
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
			const timestamp = Math.round(ev * 1000);
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
		this.emit('reorderQueue', {queue: this.queue});
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

	drawWave(){
		if(this.surfer.backend.buffer) this.surfer.drawBuffer();
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

	toggleRepeat(){
		if(this.repeat === false) this.repeat = true;
		else this.repeat = false;
	}

	addToQueue({src, title, author}){
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
		if(typeof currentOriginalIndex !== 'number' || currentOriginalIndex === -1) return false;

		const currentIndex = this.queue.findIndex((v) => v.src === src);
		if(typeof currentIndex !== 'number' || currentIndex === -1) return false;

		const audio = this.originalQueue[currentOriginalIndex];
		this.originalQueue.splice(currentOriginalIndex, 1);
		this.queue.splice(currentIndex, 1);

		this.updateAudio();
		this.emit('removeQueue', {audio, queue: this.queue});

		if(this.pointer === currentIndex){
			this.stop();
			this.play();
		}else if(currentIndex < this.pointer){
			this.pointer--;
		}
	}

	playQueue(src){
		console.log(src);
		const currentIndex = this.queue.findIndex((v) => v.src === src);

		if(typeof currentIndex !== 'number' || currentIndex === -1) return false;
		this.pointer = currentIndex;

		this.stop();
		this.play();
	}

	changeOrder({src, newIndex}){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		return this.changeIndexOrder({currentIndex, newIndex});
	}

	changeIndexOrder({currentIndex, newIndex}){
		if(typeof currentIndex !== 'number') return false;

		const extracted = this.queue.splice(currentIndex, 1)[0];
		this.queue.splice(newIndex, 0, extracted);

		if(currentIndex < this.pointer && newIndex >= this.pointer) this.pointer--;
		else if(currentIndex > this.pointer && newIndex <= this.pointer) this.pointer++;
		else if(currentIndex === this.pointer) this.pointer = newIndex;

		this.emit('swapQueue', {
			previousIndex: currentIndex,
			currentIndex: newIndex,
			queue: this.queue
		});
	}

	reserveNext(src){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(currentIndex === this.pointer + 1 || currentIndex === -1) return false;
		return this.changeIndexOrder({currentIndex, newIndex: this.pointer + 1});
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
		this.surfer.seekTo(time / this.surfer.getDuration() / 1000);
	}

	playFromStart(){
		this.stop();
		this.play();
	}

	play(){
		if(this.pointer < 0) this.pointer = 0;

		if(this.current === undefined) return false;
		if(this.current.loaded) {
			if(this.loadedSrc !== this.current.src){
				this.loadedSrc = this.current.src;
				const event = () => {
					this.play();
					this.emit('insertMedia', this.current);
					this.surfer.un('ready', event);
				};

				this.surfer.on('ready', event);
				this.surfer.loadBlob(this.current.blob);

				const next = this.queue[this.nextTrackPointer];
				if(next && !next.loading && !next.loaded && this.settings.preloadEnabled){
					next.load();
				}
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
		Object.keys(this.vuexMutationDefinitions).forEach((v) => {
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

export default QPlayer;
