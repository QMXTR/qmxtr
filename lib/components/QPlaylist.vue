<template>
	<q-panel column>
		<q-panel class="playlist-titlebar">
			<h1 v-text="playlist.title"></h1>

			<q-panel>
				<q-button @click="edit">
					<div class="button-inner">
						<q-icon icon="pencil"></q-icon>
					</div>
				</q-button>

				<q-button @click="select">
					<div class="button-inner">
						<q-icon icon="menu"></q-icon>
					</div>
				</q-button>
			</q-panel>
		</q-panel>

		<q-edit-list-modal ref="editor" :playlist="playlist"></q-edit-list-modal>
		<q-select-list-modal ref="selector"></q-select-list-modal>

		<div class="q-playlist">
			<draggable v-model="queue" class="q-playlist-list" :options="sortableOptions" @change="move">
				<transition-group name="q-list">
					<div
						class="q-playlist-item"
						v-for="element in queue"
						:key="element.src"
						@contextmenu="open(element, $event)">

						<div class="q-playlist-handle">
							<q-icon icon="menu"></q-icon>
						</div>

						<template v-if="isQueue">
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
						</template>
						<template v-else>
							<button class="q-playlist-play" @click="addWrapped(element)">
								<div class="q-inner">
									<q-icon icon="plus"></q-icon>
								</div>
							</button>
						</template>

						<span class="q-playlist-text" :class="{playing: element._playing}">
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
	</q-panel>
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
		cursor: move;
		line-height: 50px;
	}

	.playlist-titlebar {
		height: 50px;
		justify-content: space-between;
		flex: none;
		padding-left: 10px;
		box-sizing: border-box;

		h1 {
			font-family: @font;
			color: #fff;
			margin: 0;
			line-height: 50px;
			text-overflow: ellipsis;
			flex: 3;
			overflow: hidden;
			white-space: nowrap;
			font-size: 1rem;
			font-weight: 400;

			&:hover {
				text-overflow: initial;
				overflow: auto;
			}
		}

		.q-button {
			height: 50px;
			width: 50px;
			flex: none;
		}
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
		&.playing {
			font-weight: @aside-playing-weight;
		}
	}

	.q-playlist {
		overflow-x: hidden;
		overflow-y: auto;
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
	import iziToast from "izitoast";

	export default {
		data(){
			return {
				sortableOptions: {
					handle:'.q-playlist-handle',
					animation: 150
				},
				opened: false,
				currentPlaylist: "queue",
				unwatch: undefined
			};
		},

		components: {
			draggable
		},

		computed: {
			queue(){
				return this.playlist.content;
			},

			playlist() {
				let playlist = this.$store.state.playlist.find((v) => v.id === this.currentPlaylist);
				if(!playlist){
					this.currentPlaylist = "queue";
					playlist = this.$store.state.playlist.find((v) => v.id === this.currentPlaylist);
				}

				return playlist;
			},

			playing(){
				return this.$store.state.play;
			},

			isQueue() {
				return this.playlist.isQueue;
			}
		},

		methods: {
			play(elem){
				this.$store.dispatch('play-queue', elem.src);
			},

			reserve(elem){
				if(!this.isQueue) {
					this.add(elem);
					iziToast.show({
						title: 'Reserved',
						message: 'Successfully added to queue and reserved!',
						color :'green'
					});
				}
				this.$store.dispatch('reserve-next', elem.src);
			},

			addWrapped(elem) {
				this.add(elem);

				iziToast.show({
					title: 'Added',
					message: 'Successfully added to queue!',
					color :'green'
				});
			},

			add(elem) {
				this.playlist.player.addToQueueWrapped(elem);
			},

			remove(elem){
				const result = this.playlist.remove(elem.src);
				if(result === false) {
					if(this.playlist.isLibrary) {
						iziToast.show({
							title: `Couldn't remove.`,
							message: `Please remove the songs from other playlists. ` +
							`Since this playlist is library, you can't remove songs which consist other playlists.`,
							color :'yellow'
						});
					} else {
						iziToast.show({
							title: `Couldn't remove.`,
							message: `You can't remove the song from the playlist.`,
							color :'yellow'
						});
					}
				} else {
					iziToast.show({
						title: 'Removed',
						message: 'Successfully removed!',
						color :'green'
					});
				}
			},

			move(evt){
				if(evt.moved)
					this.playlist.reorderIndex(evt.moved.oldIndex, evt.moved.newIndex);
				else if(evt.removed)
					this.playlist.remove(evt.removed.element.src);
			},

			open(elem, evt){
				this.opened = elem.src;
				evt.preventDefault();
			},

			close(){
				this.opened = false;
			},

			edit() {
				this.$refs.editor.open();
			},

			select() {
				this.$refs.selector.$off('select');
				this.$refs.selector.$once('select', (id) => {
					this.currentPlaylist = id;
				});
				this.$refs.selector.open();
			}
		},

		watch: {
			playlist: {
				immediate: true,
				handler() {
					if(this.unwatch) this.unwatch();
					this.checkedList = [];
					this.unwatch = this.$store.watch(this.playlist.watcher, () => {
						this.$forceUpdate();
					});
				}
			}
		}
	}
</script>
