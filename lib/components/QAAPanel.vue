<template>
	<div class="q-aa-panel" :style="{backgroundImage: albumArt}">
		<h1 class="q-title" v-if="loaded">
			<span v-text="loaded.title"></span>
		</h1>

		<h3 class="q-author" v-if="loaded">
			<span v-text="loaded.author"></span>
		</h3>

		<div class="q-bar" :class="{loaded: loaded}">
			<div id="visualizer"></div>
			<button class="q-playpause" @click="togglePlay" v-show="loaded">
				<q-icon icon="pause" v-if="playing"></q-icon>
				<q-icon icon="play" v-else></q-icon>
			</button>
		</div>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-aa-panel {
		//position: relative;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		background-color: @aa-default;
		width: 100%;
		height: 100%;
	}

	.q-aa-text {
		padding-left: 10%;
		padding-top: 30px;
		padding-left: 30px;
		font-family: @font;
		font-weight: 100;
		width: 80%;
		margin: 0;
		color: @aa-color;
		span {
			background: @aa-background;
		    display: inline-block;
			max-width: 100%;
			text-overflow: ellipsis;
			overflow: hidden;
			padding: 10px;
		}
	}

	.q-title {
		.q-aa-text;
		font-size: 54px;
	}

	.q-author {
		.q-aa-text;
		font-size: 32px;
	}

	.q-bar {
		position: absolute;
		bottom: 30px;
		left: 30px;
		right: 30px;
		height: 128px;
		padding: 15px;
		&.loaded {
			background: @aa-bar-background;
		}
	}

	.q-playpause {
		border: 1px solid @aa-button-color;
		width: @aa-button-size;
		height: @aa-button-size;
		font-size: @aa-button-font-size;
		color: @aa-button-color;
		border-radius: 100%;
		position: absolute;
		bottom: calc(15px + 64px - @aa-button-size / 2);
	}

	#visualizer {
		position: absolute;
		bottom: 15px;
		left: calc(30px + @aa-button-size);
		width: ~"calc(100% - 60px - @{aa-button-size})";
		height: 128px;
	}
</style>

<script>
	export default {
		computed: {
			playing(){
				return this.$store.state.play;
			},

			loaded(){
				return this.$store.state.playing;
			},

			albumArt(){
				if(!this.$store.state.playing ||
					!this.$store.state.playing.albumArt) return '';
				return `url("${this.$store.state.playing.albumArt}")`;
			}
		},

		methods: {
			togglePlay(){
				this.$store.dispatch('toggle-play');
			}
		}
	};
</script>
