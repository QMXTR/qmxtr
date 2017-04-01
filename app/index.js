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
