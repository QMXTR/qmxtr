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

qmxtr.equalizer = new EqualizerPlugin({});
qmxtr.volume = new VolumePlugin(1, 1);
qmxtr.keyInput = new KeyInputPlugin({});
qmxtr.sdvx = new CustomEffectPlugin;

qmxtr.vis = document.createElement('div');
qmxtr.player = new QPlayer({
	VISUALIZER: qmxtr.vis,
	PLUGINS: [
		qmxtr.equalizer,
		qmxtr.volume,
		qmxtr.keyInput,
		qmxtr.sdvx
	]
});

Vue.use(Vuex);
Vue.use(QmxtrUI);

qmxtr.store = new Vuex.Store({
	state: qmxtr.player.defaultStates,
	mutations: qmxtr.player.defaultMutations
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
