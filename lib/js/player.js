import "babel-polyfill";
import "whatwg-fetch";
import "roboto-fontface";
import "typeface-notosans-jp";
import "typeface-nanum-square";
import "sweetalert/dist/sweetalert.css";
import "../less/sweetalert.less";
import emitterize from 'event-emitter';
import md5 from "crypto-js/md5";
import WaveSurfer from "wavesurfer.js";

import QAAPanel from "../components/QAAPanel.vue";
import QAside from "../components/QAside.vue";
import QButton from "../components/QButton.vue";
import QControlBar from "../components/QControlBar.vue";
import QController from "../components/QController.vue";
import QEditListModal from "../components/QEditListModal.vue";
import QEditListPanel from "../components/QEditListPanel.vue";
import QIcon from "../components/QIcon.vue";
import QLyricPanel from "../components/QLyricPanel.vue";
import QMain from "../components/QMain.vue";
import QModal from "../components/QModal.vue";
import QPanel from "../components/QPanel.vue";
import QQueue from "../components/QQueue.vue";
import QSeekbar from "../components/QSeekbar.vue";
import QSelectListModal from "../components/QSelectListModal.vue";
import QSelectListPanel from "../components/QSelectListPanel.vue";
import QTab from "../components/QTab.vue";
import QTabPanel from "../components/QTabPanel.vue";
import QVideoPanel from "../components/QVideoPanel.vue";
import QWorkspace from "../components/QWorkspace.vue";

const shuffle = (array) => array.sort(() => 0.5 - Math.random());
const unicodeSort = (v1, v2) => (v1 === v2) ? 0 : (v1 > v2) ? 1 : -1;
const toKebab = (str) => str.replace(/[A-Z]/g, (str) => '-' + str.toLowerCase());

class Qmxtr{
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
			container: this.settings.visualizer,
			barWidth: 3,
			cursorWidth: 5,
			cursorColor: "rgba(0, 0, 0, .4)"
		});
		this.lyrics = undefined;
		this.activatedLyric = undefined;
		this.plugins = [];
		this.queuePlaylist = new QueuePlaylist(this);
		this.playlist = {
			"queue": this.queuePlaylist
		};
		this.commands = [];
		this.loadQueue = [];
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
			},

			updatePlaylist(state, {id, playlist}) {
				let i = state.playlist.findIndex((v) => v.id === id);
				if(i === -1) state.playlist.push(playlist);
				else if(playlist !== undefined) state.playlist[i] = playlist;
				else state.playlist.splice(i, 1);
			}
		};

		this.vuexStates = {
			play: false,
			shuffle: false,
			repeat: false,
			queue: [],
			playlist: Object.keys(this.playlist).map((k) => this.playlist[k]),
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
			'skip',
			'drawWave',
			'newPlaylist',
			'removePlaylist'
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
			if(this.current) {
				this._pointer = newQueue.findIndex((v) => v.src === this.current.src);
			}
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

	addToQueue(music){
		this.addToQueueWrapped(new AudioWrapper(this, music));
	}

	addToQueueWrapped(wrapper) {
		if(this.originalQueue.find((v) => v.src === wrapper.src)) return false;

		if(this.shuffle){
			this.queue.splice(Math.floor(Math.random() * this.queue.length), 0, wrapper);
		}else this.queue.push(wrapper);

		this.updateAudio();
		this.emit('addQueue', {audio: wrapper, queue: this.queue});
		this.originalQueue.push(wrapper);
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
			this.updateAudio();
			this.play();
		}else if(currentIndex < this.pointer){
			this.pointer--;
		}
		audio.unload();
	}

	playQueue(src){
		const currentIndex = this.queue.findIndex((v) => v.src === src);

		if(typeof currentIndex !== 'number' || currentIndex === -1) return false;
		this.pointer = currentIndex;

		this.stop();
		this.play();
	}

	changeOrder({src, newIndex}){
		const currentIndex = this.queue.findIndex((v) => v.src === src);
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
		const currentIndex = this.queue.findIndex((v) => v.src === src);
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
		this.stop();
		this.pointer = next;
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
		this.stop();
		this.pointer = prev;
		this.play();
	}

	seek(time){
		this.surfer.seekTo(time / this.surfer.getDuration() / 1000);
	}

	skip(delta) {
		this.surfer.skip(delta);
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
				if(!this.surfer.isPlaying()) return;
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
		try{
			this.surfer.pause();
		}catch(e) {
			return false;
		}
	}

	togglePlay(){
		if(!this.playing) this.play();
		else this.pause();
	}

	stop(){
		if(!this.playing) return;
		this.emit('stop');
		this.playing = false;
		try{
			this.surfer.stop();
		}catch(e) {
			return false;
		}
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

	addToLoadQueue(music) {
		if(this.loadQueue.length > 3) this.loadQueue.shift().unload();
		this.loadQueue.push(music);
	}

	newPlaylist(title) {
		const id = md5(`${title}${Date.now()}${Math.random()}`).toString();
		const playlist = new Playlist(this, title, id, []);

		this.playlist[id] = playlist;
		this.emit('updatePlaylist', {id, playlist, descriptor: "create"});
	}

	removePlaylist(id) {
		if(!this.playlist[id].removable) return false;

		this.playlist[id] = undefined;
		delete this.playlist[id];

		this.emit('updatePlaylist', {id, playlist: undefined, descriptor: "delete"})
	}

	get library() {
		const library = {};

		Object.keys(this.playlist).forEach((k) => {
			this.playlist[k].content.forEach((v) => {
				library[v.src] = v;
			});
		});

		return Object.values(library);
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

	install(Vue){
		Vue.component('q-aa-panel', QAAPanel);
		Vue.component('q-aside', QAside);
		Vue.component('q-button', QButton);
		Vue.component('q-controlbar', QControlBar);
		Vue.component('q-controller', QController);
		Vue.component('q-edit-list-modal', QEditListModal);
		Vue.component('q-edit-list-panel', QEditListPanel);
		Vue.component('q-icon', QIcon);
		Vue.component('q-lyric-panel', QLyricPanel);
		Vue.component('q-main', QMain);
		Vue.component('q-modal', QModal);
		Vue.component('q-panel', QPanel);
		Vue.component('q-queue', QQueue);
		Vue.component('q-seekbar', QSeekbar);
		Vue.component('q-select-list-modal', QSelectListModal);
		Vue.component('q-select-list-panel', QSelectListPanel);
		Vue.component('q-tab', QTab);
		Vue.component('q-tab-panel', QTabPanel);
		Vue.component('q-video-panel', QVideoPanel);
		Vue.component('q-workspace', QWorkspace);

		this.settings.plugins.forEach((v) => {
			if(v && v.install) v.install(Vue);
		});
	}
}

class AudioWrapper {
	constructor(player, {src, title, author, albumArt, video}){
		this.title = title;
		this.author = author;
		this.player = player;
		this.src = src;
		this.loading = false;
		this.blob = undefined;
		this.albumArt = albumArt;
		this.video = video;
		this._playing = false;
		this.date = Date.now();
	}

	async load(){
		this.player.addToLoadQueue(this);
		this.loading = true;
		if(this.video) await (() => new Promise((resolve, reject) => {
			fetch(this.video)
			.then((v) => v.blob())
			.then((v) => {
				this._video = this.video;
				this.video = URL.createObjectURL(v);
				resolve();
			});
		}))();

		await (async () => {
			const audioReq = await fetch(this.src);
			this.blob = await audioReq.blob();
		})();

		this.loading = false;
		if(this.playing) this.player.play();
	}

	unload() {
		if(!this.loaded) return;
		this.blob = undefined;
		if(this.video) {
			URL.revokeObjectURL(this.video);
			this.video = this._video;
		}
	}

	get loaded(){
		return this.blob !== undefined;
	}

	get playing(){
		return this.player.current.src === this.src;
	}
}

emitterize(Qmxtr.prototype);


class Lyric{
	constructor(timestamp, content){
		this.timestamp = timestamp;
		this.content = content;
		this.activated = false;
	}
}

class Playlist {
	constructor(player, title, id, content) {
		this.player = player;
		this.id = id;
		this.title = title;
		this.content = content;

		Object.defineProperty(this, 'isQueue', {
			value: false
		});

		Object.defineProperty(this, 'removable', {
			value: true
		});
	}

	get watcher() {
		return (state) => state.playlist;
	}

	add(audio) {
		if(this.content.find((v) => v.src === audio.src)) return false;
		audio.date = Date.now();

		this.content.push(audio);
		this.propagate();
	}

	remove(src) {
		const currentIndex = this.findIndex(src);
		if(currentIndex === null) return false;

		this.content.splice(currentIndex, 1);
		this.propagate();
	}

	rename(title){
		this.title = title;
		this.propagate();
	}

	reorderDelta(src, delta) {
		const currentIndex = this.findIndex(src);

		const target = Math.max(0,
			Math.min(this.content.length, currentIndex + delta)
		);

		return this.reorderIndex(currentIndex, target);
	}

	reorder(src, target) {
		return this.reorderIndex(this.findIndex(src), target);
	}

	reorderIndex(currentIndex, target) {
		if(target === currentIndex) return false;
		if(currentIndex === null) return false;

		const audio = this.content.splice(currentIndex, 1);
		this.content.splice(target, 0, audio);
		this.propagate();
	}

	findIndex(src) {
		const currentIndex = this.queue.findIndex((v) => v.src === src);
		if(typeof currentIndex !== 'number' || currentIndex === -1) return null;

		return currentIndex;
	}

	sort(order) {
		switch(order) {
			case "author":
				this.content = this.content.sort((v1, v2) => {
					return v1.author.localeCompare(v2.author);
				});
				break;

			case "date":
				this.content = this.content.sort((v1, v2) => {
					return v1.date - v2.date;
				});
				break;

			case "title":
				this.content = this.content.sort((v1, v2) => {
					return v1.title.localeCompare(v2.title);
				});
				break;

			case "shuffle":
				this.content = shuffle(this.content);
				break;
		}

		this.propagate();
	}

	reverse() {
		this.content = this.content.reverse();
	}

	propagate() {
		this.player.emit('updatePlaylist', {playlist: this, id: this.id, descriptor: "update"});
	}
}

class QueuePlaylist {
	constructor(player) {
		this.player = player;
		this.title = "Queue";
		this.id = "queue";

		Object.defineProperty(this, 'isQueue', {
			value: true
		});

		Object.defineProperty(this, 'removable', {
			value: false
		});
	}

	get watcher() {
		return (state) => state.queue;
	}

	get content() {
		return this.player.queue;
	}

	set content(queue) {
		this.player.queue = queue;
		this.player.originalQueue = queue;
		if(this.player.current) {
			this.player._pointer = queue.findIndex((v) => {
				return v.src === this.player.current.src;
			});
		}
		this.player.emit('reorderQueue', {queue: this.player.queue});
	}

	add(audio) {
		this.player.addToQueueWrapped(audio);
	}

	remove(src) {
		this.player.removeFromQueue(src);
	}

	rename() {
		return false;
	}

	reorderDelta(src, delta) {
		const currentIndex = this.player.queue.findIndex((v) => v.src === src);
		const target = Math.max(0,
			Math.min(this.player.originalQueue.length, currentIndex + delta)
		);

		if(currentIndex === target) return false;

		return this.player.changeIndexOrder({currentIndex, newIndex: target});
	}

	reorder(src, target) {
		return this.player.changeOrder({src, newIndex: target});
	}

	reorderIndex(currentIndex, target) {
		return this.player.changeIndexOrder({currentIndex, newIndex: target});
	}

	findIndex(src) {
		const currentIndex = this.player.queue.findIndex((v) => v.src === src);
		if(typeof currentIndex !== 'number' || currentIndex === -1) return null;

		return currentIndex;
	}

	sort(order, isUnicodeOrder) {
		switch(order) {
			case "author":
				this.content = this.player.queue.sort((v1, v2) => {
					if(isUnicodeOrder)
						return unicodeSort(v1.author, v2.author);

					return v1.author.localeCompare(v2.author);
				});
				break;

			case "date":
				this.content = this.player.queue.sort((v1, v2) => {
					return v1.date - v2.date;
				});
				break;

			case "title":
				this.content = this.player.queue.sort((v1, v2) => {
					if(isUnicodeOrder)
						return unicodeSort(v1.title, v2.title);

					return v1.title.localeCompare(v2.title);
				});
				break;

			case "shuffle":
				this.content = shuffle(this.player.queue);
				break;
		}
	}

	reverse() {
		this.content = this.content.reverse();
	}

	propagate() {}
}

Qmxtr.AudioWrapper = AudioWrapper;
Qmxtr.Lyric = Lyric;
Qmxtr.Playlist = Playlist;
Qmxtr.QueuePlaylist = QueuePlaylist;

export default Qmxtr;
