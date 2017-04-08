<template>
	<div class="q-controller">
		<button @click="prev" class="q-controller-button">
			<q-icon icon="chevron-double-left"></q-icon>
		</button>

		<button @click="togglePlay" class="q-controller-button q-play-button">
			<q-icon icon="ios-pause-outline" ionic v-if="playing"></q-icon>
			<q-icon icon="ios-play-outline" ionic v-else></q-icon>
		</button>

		<button @click="next" class="q-controller-button">
			<q-icon icon="chevron-double-right"></q-icon>
		</button>

		<button @click="toggleShuffle" class="q-controller-button q-shuffle-button q-toggle" :class="{'q-active': shuffle}">
			<q-icon icon="ios-shuffle" ionic></q-icon>
		</button>

		<button @click="toggleRepeat" class="q-controller-button q-repeat-button q-toggle" :class="{'q-active': repeat}">
			<q-icon icon="ios-refresh-outline" ionic></q-icon>
		</button>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-controller {
		margin: 0 10px;
		display: inline-flex;
	}

	.q-controller-button {
		color: @controlbar-text;
		font-size: 30px;
	}

	.q-play-button {
		margin-left: 3px;
	}

	.q-shuffle-button {
		margin-left: 10px;
	}

	.q-toggle {
		color: @controlbar-toggle;

		&.q-active {
			color: @controlbar-toggle-active;
		}
	}
</style>

<script>
	export default {
		computed: {
			playing(){
				return this.$store.state.play;
			},

			shuffle(){
				return this.$store.state.shuffle;
			},

			repeat(){
				return this.$store.state.repeat;
			}
		},

		methods: {
			togglePlay(){
				this.$store.dispatch('toggle-play');
			},

			prev(){
				this.$store.dispatch('prev-track');
			},

			next(){
				this.$store.dispatch('next-track');
			},

			toggleShuffle(){
				this.$store.dispatch('toggle-shuffle');
			},

			toggleRepeat(){
				this.$store.dispatch('toggle-repeat');
			}
		}
	};
</script>
