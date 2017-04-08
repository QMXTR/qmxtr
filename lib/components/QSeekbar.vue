<template>
	<q-panel class="q-seekbar">
		<span class="q-seekbar-timestamp" v-html="getTimestamp(time)"></span>
		<vue-slider ref="slider" height="3" style="flex: 1" :tooltip="false" :min="0" :max="1000" :value="0" @callback="seek" @drag-start="pause" @drag-end="play"></vue-slider>
		<span class="q-seekbar-timestamp" v-html="getTimestamp(duration)"></span>
	</q-panel>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-seekbar {
		align-items: center;
		margin: 0 10px;
	}

	.q-seekbar-timestamp {
		color: @seekbar-color;
		margin: 0 5px;
		font-family: @font;
		font-weight: @seekbar-font-weight;
	}
</style>

<style lang="less">
	@import "~variables";

	.q-seekbar .vue-slider {
		background: @seekbar-background !important;
	}

	.q-seekbar .vue-slider-process {
		background: @seekbar-process !important;
	}

	.q-seekbar .vue-slider-dot {
		background: @controlbar-color !important;
		border: 4px solid @seekbar-dot;
		height: 8px !important;
		width: 8px !important;
		box-shadow: initial !important;
		outline: none;

		&:hover {
			border: 4px solid @seekbar-dot-hover;
		}

		&:active {
			background: @seekbar-dot-click !important;
			border: 4px solid @seekbar-dot-click;
		}
	}
</style>

<script>
	import VueSlider from 'vue-slider-component';

	export default {
		computed: {
			time(){
				return this.$store.state.time;
			},

			duration(){
				return this.$store.state.duration;
			}
		},

		methods: {
			normalizeTime(num){
				if(!isFinite(num) || num < 0) return '--';
				num = Math.floor(num);

				if(num < 10) return `0${num}`;

				return String(num);
			},

			getTimestamp(_duration){
				const duration = _duration / 1000;

				const minutes = this.normalizeTime(duration / 60);
				const seconds = this.normalizeTime(duration % 60);

				return `${minutes}:${seconds}`;
			},

			seek(val){
				const progress = this.$refs.slider.val;
				console.log(this.$refs.slider.val, this.$refs.slider.value);
				const newTime = this.duration / 1000 * progress;
				if(isFinite(newTime))
					this.$store.dispatch('seek', newTime);
				else
					this.$refs.slider.setValue(0);
			},

			pause(){
				//this.$store.dispatch('pause');
			},

			play(){
				//this.$store.dispatch('play');
			}
		},

		components: {
			VueSlider
		},

		mounted(){
			this.$store.watch((state) => state.time, () => {
				const progress = Math.round(this.time / this.duration * 1000);
				if(isFinite(progress)){
					this.$refs.slider.val = progress;
					this.$refs.slider.setPosition();
				}
			});
		}
	};
</script>
