import Vue from "vue";
import Vuex from "vuex";

import App from "./App.vue";
import QmxtrUI from "./js/player-ui.js";

import {QPlayer, QPlugin, EqualizerPlugin, VolumePlugin, KeyInputPlugin} from "./js/player.js";

class CustomEffectPlugin extends QPlugin{
	constructor(){
		super();
	}

	connect(ctx, player){

	}
}

const qmxtr = {};

qmxtr.equalizer = new EqualizerPlugin({
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
});
qmxtr.volume = new VolumePlugin(1, 0);
qmxtr.keyInput = new KeyInputPlugin({});
qmxtr.sdvx = new CustomEffectPlugin;

qmxtr.vis = document.createElement('div');
qmxtr.player = new QPlayer({
	visualizer: qmxtr.vis,
	plugins: [
		qmxtr.volume,
		//qmxtr.equalizer,
		qmxtr.keyInput,
		qmxtr.sdvx
	]
});

Vue.use(Vuex);
Vue.use(QmxtrUI);

qmxtr.store = new Vuex.Store({
	state: qmxtr.player.defaultStates,
	mutations: qmxtr.player.defaultMutations,
	actions: qmxtr.player.defaultActions
});

qmxtr.player.attachToVuexStore(qmxtr.store);

qmxtr.app = new Vue({
	el: '#app',
	render(h){
		return h(App);
	},
	store: qmxtr.store
});

document.addEventListener('load', () => {
	const visualizer = document.querySelector('#visualizer');
	if(!visualizer) return;
	visualizer.appendChild(qmxtr.vis);
}, false);

window.Qmxtr = qmxtr;
