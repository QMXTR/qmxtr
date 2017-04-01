import emitterize from 'event-emitter';
import WaveSurfer from "wavesurfer.js";

const shuffle = (a) => {
	for (let i = a.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[a[i - 1], a[j]] = [a[j], a[i - 1]];
	}
};

class QPlayer{
	constructor(settings){
		if(typeof settings !== 'object') settings = {};

		this.settings = {
			PRELOAD_ENABLED: true,
			REPEAT: true,
			LYRIC_CALLBACK: undefined,
			PLUGINS: [],
			VISUALIZER: '#visualizer',
		};

		Object.keys(settings).forEach((k) => {
			this.settings[k] = settings[k];
		});

		this.originalQueue = [];
		this.queue = [];
		this.pointer = 0;
		this.loadedPointer = 0;
		this._shuffle = false;
		this.surfer = WaveSurfer.create({
			container: this.settings.VISUALIZER
		});
		this.lyrics = undefined;
		this.activatedLyric = undefined;
		this.plugins = [];
		this.commands = [];
		this.playing = false;

		if(this.settings.PLUGINS.length >= 1){
			this.plugins = this.settings.PLUGINS.map((v) => {
				v.connect(this.surfer.backend.ac, this);
			});

			const last = this.plugins.reduce((prev, curr) => {
				if(!Array.isArray(curr) || curr.length !== 2) return prev;

				prev[1].connect(curr[0]);
				return curr;
			})[1];

			const first = this.plugins[0][0];

			this.surfer.setFilter(first, last);
		}

		this.surfer.on('finish', () => this.nextTrack());
		this.surfer.on('audioprocess', (ev) => {
			const timestamp = Math.round(ev.playbackTime / 1000);
			if(this.lyrics !== undefined && this.lyrics[timestamp]){
				if(this.activatedLyric !== undefined) this.activatedLyric.activated = false;
				this.activatedLyric = this.lyrics[timestamp];
				this.activatedLyric.activated = true;
			}
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
		if(!!v === true){
			this._shuffle = true;
			const newQueue = shuffle(this.queue);
			this.pointer = newQueue.findIndex((v) => v.src === this.current.src);
			this.queue = newQueue;
		}else{
			this._shuffle = false;
			this.queue = this.originalQueue.slice();
		}
	}

	addCommand(plugin, commandName, callback){
		this.commands[`${plugin.getName()}:${commandName}`] = callback;
	}

	addToQueue(src, title, author){
		if(this.originalQueue.find((v) => v.src === src)) return false;

		const wrapper = new AudioWrapper(this, src, title, author);
		this.emit('queue', wrapper);

		this.originalQueue.push(wrapper);

		if(this.shuffle){
			this.queue.splice(Math.floor(Math.random() * this.queue.length), 0, wrapper);
		}
	}

	removeFromQueue(src){
		const currentOriginalIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(typeof currentOriginalIndex !== 'number') return false;

		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(typeof currentIndex !== 'number') return false;

		this.originalQueue.splice(currentOriginalIndex, 1);
		this.queue.splice(currentIndex, 1);

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
	}

	reserveNext(src){
		const currentIndex = this.originalQueue.findIndex((v) => v.src === src);
		if(currentIndex === this.pointer + 1) return false;
		return this.changeIndexOrder(currentIndex, this.pointer + 1);
	}

	nextTrack(){
		if(this.queue.length < 1) return false;

		let next = this.nextTrackPointer;
		if(!this.queue[next]) next = 0;

		this.emit('next', next);
		this.pointer = next;
		this.play();
	}

	prevTrack(){
		if(this.queue.length < 1) return false;

		let prev = this.prevTrackPointer;
		if(!this.queue[prev]) prev = this.queue.length - 1;

		this.emit('prev', prev);
		this.pointer = prev;
		this.play();
	}

	play(){
		if(this.current === undefined) return false;

		this.current.playing = true;
		if(this.current.loaded) {
			if(this.loadedPointer !== this.pointer){
				this.loadedPointer = this.pointer;
				this.surfer.loadBlob(this.current.blob);
				this.emit('load media');
			}

			if(this.playing){
				this.pause();
			}
			this.emit('play');
			this.lyrics = undefined;
			this.activatedLyric = undefined;

			if(this.settings.LYRIC_CALLBACK){
				this.settings.LYRIC_CALLBACK(this.current, (audio, lyric) => {
					if(audio.src !== this.current.src) return false;
					this.lyrics = {};
					lyric.forEach((v) => this.lyrics[v[0]] = new Lyric(v[0], v[1]));
				});
			}

			this.playing = true;
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

	stop(){
		if(!this.playing) return;
		this.emit('stop');
		this.playing = false;
		this.surfer.stop();
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
		this.playing = false;
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
	}

	get loaded(){
		return this.blob !== undefined;
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

	connect(ctx){
		this.splitter = ctx.createChannelSplitter(2);

		this.lgain = ctx.createGain();
		this.lgain.gain.value = this.volumeL;

		this.rgain = ctx.createGain();
		this.rgain.gain.value = this.volumeR;

		this.merger = ctx.createChannelMerger(2);

		this.splitter.connect(this.lgain, 0);
		this.splitter.connect(this.rgain, 1);

		this.lgain.connect(this.merger, 0);
		this.rgain.connect(this.merger, 0, 1);

		return [this.splitter, this.merger];
	}

	get volumeL(){
		return this._volumeL;
	}

	set volumeL(v){
		this._volumeL = v;
		this.updateVolume();
	}

	get volumeR(){
		return this._volumeR;
	}

	set volumeR(v){
		this._volumeR = v;
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
			60: 0,
			170: 0,
			310: 0,
			600: 0,
			1000: 0,
			3000: 0,
			6000: 0,
			12000: 0,
			14000: 0,
			16000: 0
		};

		Object.keys(eq).forEach((k) => {
			this.eq[k] = eq[k];
		});

		this.nodes = [];
	}

	getName(){
		return 'equalizer';
	}

	connect(ctx){
		this.ctx = ctx;
		this.nodes = [];

		Object.keys(this.eq).forEach((hz, i, arr) => {
			const node = ctx.createBiquadFilter();

			if(i === 0) {
				node.type = 'lowshelf';
			}else if(i === arr.length - 1){
				node.type = 'highshelf';
			}else {
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
			if(this.nodes[i]){
				this.nodes[i].gain.value = this.eq[hz];
			}
		});
	}
}

class KeyInputPlugin extends QPlugin{
	constructor(keymap){
		super();
		this.keymap = keymap;
	}

	getName(){
		return 'key-input';
	}

	connect(ctx, player){

	}
}

export {QPlayer, QPlugin, EqualizerPlugin, VolumePlugin, KeyInputPlugin};
