<template>
	<div class="q-playlist">
		<draggable v-model="queue" class="q-playlist-list" :options="sortableOptions" @change="move">
			<transition-group name="q-list">
				<div class="q-playlist-item" v-for="element in queue" :key="element.src" @contextmenu="open(element, $event)">
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
						<button class="q-playlist-play" @click="play(element)">
							<div class="q-inner">
								<q-icon icon="play"></q-icon>
							</div>
						</button>
					</template>

					<span class="q-playlist-text">
						{{element.title}} - {{element.author}}
					</span>

					<div class="q-playlist-menu" :class="{opened: opened === element.src}">
						<button class="q-playlist-menu-button" @click="close">
							<q-icon icon="ios-arrow-back-outline" ionic></q-icon>
						</button>

						<button class="q-playlist-menu-button" @click="reserve(element)">
							<q-icon icon="ios-timer-outline" ionic></q-icon>
						</button>

						<button class="q-playlist-menu-button" @click="remove(element)">
							<q-icon icon="ios-trash-outline" ionic></q-icon>
						</button>
					</div>
				</div>
			</transition-group>
		</draggable>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";
	.fade-enter-active, .fade-leave-active {
		transition: opacity .5s
	}

	.fade-enter, .fade-leave-to {
		opacity: 0
	}
	
	.q-list {
		padding: 4px;
		margin-top: 4px;
		border: solid 1px;
		transition: all 1s;
	}

	.q-list-enter, .q-list-leave-active {
		opacity: 0;
	}

	.q-playlist-handle {
		color: @aside-item-handle;
		line-height: 50px;
	}

	.q-playlist-play {
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
		background: @aside-color;
		font-family: @font;
		font-weight: @aside-font-weight;
		position: relative;
	}

	.sortable-ghost {
		opacity: .2;
	}

	.q-playlist-text {
		flex: 1;
		line-height: 50px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		color: @aside-text;
	}

	.q-playlist, .q-playlist-list {
		width: 100%;
	}

	.q-playlist-menu {
		position: absolute;
		top: 0;
		left: @aside-size;
		width: @aside-size;
		height: 50px;
		background: @context-menu-background;
		display: flex;
		transition: left .3s ease;

		&.opened {
			left: 0;
		}

		.q-playlist-menu-button {
			color: @context-menu-color;
			font-size: 20px;
			flex: 1;
			text-align: center;
		}
	}
</style>

<script>
	import draggable from "vuedraggable";

	export default {
		data(){
			return {
				sortableOptions: {
					handle:'.q-playlist-handle',
					animation: 150
				},
				opened: false
			};
		},

		components: {
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
			play(elem){
				this.$store.dispatch('play-queue', elem.src);
			},

			reserve(elem){
				this.$store.dispatch('reserve-next', elem.src);
			},

			remove(elem){
				this.$store.dispatch('remove-from-queue', elem.src);
			},

			move(evt){
				if(evt.moved)
					this.$store.dispatch('change-index-order', {
						currentIndex: evt.moved.oldIndex,
						newIndex: evt.moved.newIndex
					});
				else if(evt.removed)
					this.$store.dispatch('remove-from-queue', {
						src: evt.removed.element.src
					});
			},

			open(elem, evt){
				this.opened = elem.src;
				evt.preventDefault();
			},

			/*isOpened(elem){
				return `q-playlist-menu${(this.opened === elem.src) ? ' opened' : ''}`;
			},*/

			close(){
				this.opened = false;
			}
		}
	}
</script>
