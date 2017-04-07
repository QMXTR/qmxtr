<template>
	<draggable v-model="queue" class="q-playlist" :options="{handle:'.q-playlist-handle'}">
		<transition-group>
			<div class="q-playlist-item" v-for="element in queue" :key="element.src">
				<div class="q-playlist-handle">
					<q-icon icon="menu"></q-icon>
				</div>

				<template v-if="element._playing">
					<button class="q-playlist-play q-disabled">
						<div class="q-inner">
							<q-icon icon="play-box-outline"></q-icon>
						</div>
					</button>
				</template>
				<template v-else>
					<button class="q-playlist-play" @click="playpause.bind(this, element)">
						<div class="q-inner">
							<q-icon icon="play"></q-icon>
						</div>
					</button>
				</template>

				<span class="q-playlist-text">
					{{element.title}} - {{element.author}}
				</span>
			</div>
		</transition-group>
	</draggable>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-playlist-handle {
		color: @aside-item-handle;
		line-height: 50px;
	}

	.q-playlist-play {
		border: none;
		background: transparent;
		cursor: pointer;
		outline: none;
		&.q-disabled {
			cursor: default;
		}

		.q-inner {
			background: @aside-item-background;
			color: @aside-text;
			display: inline-block;
			width: 30px;
			height: 30px;
			border-radius: 100%;
			font-size: 15px;
			line-height: 30px;
		}
	}

	.q-playlist-item {
		height: 50px;
		display: flex;
	}

	.q-playlist-text {
		flex: 1;
		line-height: 50px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		color: @aside-text;
	}

	.q-playlist {
		width: 100%;
	}
</style>

<script>
	import draggable from "vuedraggable";

	export default {
		components: {
			//TODO
			draggable
		},

		computed: {
			queue(){
				return this.$store.state.queue;
			},

			playing(){
				return this.$store.state.play;
			}
		},

		methods: {
			playpause(elem){
				//FIXME
				this.$store.dispatch('play-queue', elem.src);
			}
		}
	}
</script>
