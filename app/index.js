import Vue from "vue";
import Vuex from "vuex";
import {QPlayer, QPlugin, EqualizerPlugin, VolumePlugin, KeyInputPlugin} from "./js/player.js";

class CustomEffectPlugin extends QPlugin{
	constructor(){
		super();
	}

	connect(ctx, player){

	}
}

const qmxtr = {};

qmxtr.equalizer = new EqualizerPlugin;
qmxtr.volume = new VolumePlugin;
qmxtr.keyInput = new KeyInputPlugin;
qmxtr.sdvx = new CustomEffectPlugin;

qmxtr.player = new QPlayer({
	PLUGINS: [
		qmxtr.equalizer,
		qmxtr.volume,
		qmxtr.keyInput,
		qmxtr.sdvx
	]
});

Vue.use(Vuex);

qmxtr.store = new Vuex.Store({
	state: qmxtr.player.defaultStates,
	mutations: qmxtr.player.defaultMutations
});

qmxtr.player.attachToVuexStore(qmxtr.store);

window.Qmxtr = qmxtr;
