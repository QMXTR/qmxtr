<template>
	<q-panel class="q-editor">
		<section class="q-edit-list-panel">
			<h1 v-text="`Editing ${context}`"></h1>

			<q-panel class="toolkit">
				<q-panel class="toolkit-panel">
					<q-button direction="top" @click="checkall">
						<q-icon icon="checkbox-multiple-marked-outline"></q-icon>
						<span slot="tooltip">Uncheck/Check All</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-copy">
					<q-button :disabled="isQueue">
						<q-icon icon="library-plus"></q-icon>
						<span slot="tooltip">Add to Queue</span>
					</q-button>

					<q-button>
						<q-icon icon="content-copy"></q-icon>
						<span slot="tooltip">Copy to another Playlist</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-manipulate">
					<q-button>
						<q-icon icon="chevron-up"></q-icon>
						<span slot="tooltip">Up</span>
					</q-button>

					<q-button>
						<q-icon icon="chevron-down"></q-icon>
						<span slot="tooltip">Down</span>
					</q-button>

					<q-button>
						<q-icon icon="delete"></q-icon>
						<span slot="tooltip">Delete from {{context}}</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-sort">
					<q-button>
						<q-icon icon="shuffle"></q-icon>
						<span slot="tooltip">Shuffle</span>
					</q-button>

					<q-button>
						<q-icon icon="account-switch"></q-icon>
						<span slot="tooltip">Sort by Artist</span>
					</q-button>

					<q-button>
						<q-icon icon="sort-alphabetical"></q-icon>
						<span slot="tooltip">Sort by Title</span>
					</q-button>

					<q-button>
						<q-icon icon="sort-numeric"></q-icon>
						<span slot="tooltip">Sort by Date</span>
					</q-button>

					<q-button>
						<q-icon icon="format-vertical-align-top"></q-icon>
						<span slot="tooltip">Reverse</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel">
					<q-button :disabled="!removable">
						<q-icon icon="playlist-remove"></q-icon>
						<span slot="tooltip">Remove {{context}}</span>
					</q-button>
				</q-panel>
			</q-panel>

			<draggable
				v-model="content"
				class="q-list-editor-list"
				:options="sortableOptions"
				@change="propagate">

				<transition-group name="q-list">
					<div
						class="q-list-editor-item"
						v-for="(element, index) in content"
						:key="element.src">

						<div class="q-list-editor-handle">
							<q-icon icon="menu"></q-icon>
							{{index + 1}}
						</div>

						<img class="q-list-editor-img" :src="element.albumArt">

						<span class="q-list-editor-text">
							{{element.title}} - {{element.author}}
						</span>

						<label>
							<input type="checkbox" :value="element.src" v-model="checkedList">
							<span></span>
						</label>
					</div>
				</transition-group>
			</draggable>
		</section>
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

	.q-list-editor-handle {
		line-height: 50px;
		cursor: move;
		color: @editor-color;
	}

	.q-list-editor-item {
		height: 150px;
		display: flex;
		align-items: center;
		font-family: @font;
		font-weight: @aside-font-weight;
		position: relative;
		&>* {
			margin: 5px;
		}
	}

	.sortable-ghost {
		opacity: .2;
	}

	.q-list-editor-text {
		flex: 1;
		font-size: 1.5rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		color: @editor-color;
	}

	.q-edit-list-panel {
		max-width: 768px;
		margin: 0 auto;
	}

	.toolkit {
		justify-content: center;
	    flex-wrap: wrap;
		height: auto !important;

		&>.toolkit-panel {
			width: auto;
			flex: 0;
			margin: 5px;
		}
	}

	.q-editor {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: auto;
	}

	.q-list-editor-img {
		width: 100px;
		height: 100px;
	}


</style>

<script>
	import Draggable from "vuedraggable";

	export default {
		data() {
			return {
				sortableOptions: {
					handle:'.q-list-editor-handle',
					animation: 150
				},
				unwatch: undefined,
				checkedList: []
			};
		},

		computed: {
			content() {
				return this.playlist.content;
			},

			isQueue() {
				return this.playlist.isQueue;
			},

			removable() {
				return this.playlist.removable;
			}
		},

		props: {
			context: {
				type: String,
				required: true
			},

			playlist: {
				required: true
			}
		},

		methods: {
			propagate(evt){
				if(evt.moved)
					this.playlist.reorderIndex(evt.moved.oldIndex, evt.moved.newIndex);
				else if(evt.removed)
					this.playlist.remove(evt.removed.element.src);
			},

			checkall() {
				if(this.checkedList.length > 0)
					this.checkedList = [];
				else this.checkedList = this.content.map((v) => v.src);
			}
		},

		components: {
			Draggable
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
	};
</script>
