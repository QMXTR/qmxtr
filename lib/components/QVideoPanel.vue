<template>
	<div class="q-vid-panel" :style="{backgroundImage: albumArt}">
		<div class="cover"></div>
		<video ref="video" v-show="loaded && loaded.video" muted></video>
		<img
			ref="aa"
			v-if="loaded && !loaded.video  && loaded.albumArt"
			:src="loaded.albumArt">
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-vid-panel {
		//position: relative;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		background-color: @aa-default;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;

		.cover {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background: rgba(0, 0, 0, .3);
		}

		&>img {
			width: 50vw;
			max-width: 50vh;
			height: 50vw;
			max-height: 50vh;
			position: relative;
			box-shadow: 0 0 30px rgba(0, 0, 0, .5);
		}

		&>video {
			width: 100%;
			height: 100%;
			position: relative;
		}
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
			togglePlay() {
				this.$store.dispatch('toggle-play');
			}
		},

		mounted() {
			const vid = this.$refs.video;
			const onVid = (cb) => {
				if(this.loaded && this.loaded.video) cb();
			};

			this.$store.watch((state) => state.play, (v) => onVid(() => {
				if(v && vid.src === this.loaded.video) {
					if(vid.paused) vid.play();
				} else {
					if(!vid.paused) vid.pause();
				}
			}));

			this.$store.watch((state) => state.time, (v) => onVid(() => {
				const diff = Math.abs(vid.currentTime - v / 1000);
				if(diff > 0.3) {
					vid.currentTime = this.$store.state.time / 1000;
				}
			}));

			this.$store.watch((state) => state.playing, (v) => {
				if(!vid.paused && vid.currentTime > 0 && !vid.ended) vid.pause();

				if(v && v.video) vid.src = v.video;
				if(v.player.playing) {
					vid.play();
				}
			});
		}
	};
</script>
