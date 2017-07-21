<template>
	<q-panel class="panel-wrapper" column>
		<div class="hover">
			<h1 v-text="`Editing ${context}`"></h1>

			<q-panel class="toolkit">
				<q-panel class="toolkit-panel">
					<q-button direction="top" @click="checkall">
						<q-icon icon="checkbox-multiple-marked-outline"></q-icon>
						<span slot="tooltip">Uncheck/Check All</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-copy">
					<q-button :disabled="isQueue" @click="enqueue">
						<q-icon icon="library-plus"></q-icon>
						<span slot="tooltip">Add to Queue</span>
					</q-button>

					<q-button @click="copy">
						<q-icon icon="content-copy"></q-icon>
						<span slot="tooltip">Copy to another Playlist</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-manipulate">
					<q-button :disabled="!hasCheck" @click="up" tooltip>
						<q-icon icon="chevron-up"></q-icon>
						<span slot="tooltip">Up</span>
					</q-button>

					<q-button :disabled="!hasCheck" @click="down" tooltip>
						<q-icon icon="chevron-down"></q-icon>
						<span slot="tooltip">Down</span>
					</q-button>

					<q-button :disabled="!hasCheck" @click="removeFrom" tooltip>
						<q-icon icon="delete"></q-icon>
						<span slot="tooltip">Delete from {{context}}</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-sort">
					<q-button @click="sort('shuffle')" tooltip>
						<q-icon icon="shuffle"></q-icon>
						<span slot="tooltip">Shuffle</span>
					</q-button>

					<q-button @click="sort('title')" tooltip>
						<q-icon icon="sort-alphabetical"></q-icon>
						<span slot="tooltip">Sort by Title {{unicodeText(titleUnicode)}}</span>
					</q-button>

					<q-button @click="sort('author')" tooltip>
						<q-icon icon="account-switch"></q-icon>
						<span slot="tooltip">Sort by Artist {{unicodeText(authorUnicode)}}</span>
					</q-button>

					<q-button @click="sort('date')" tooltip>
						<q-icon icon="sort-numeric"></q-icon>
						<span slot="tooltip">Sort by Date</span>
					</q-button>

					<q-button @click="reverse" tooltip>
						<q-icon icon="format-vertical-align-top"></q-icon>
						<span slot="tooltip">Reverse</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel">
					<q-button :disabled="!removable" tooltip>
						<q-icon icon="playlist-remove"></q-icon>
						<span slot="tooltip">Remove {{context}}</span>
					</q-button>
				</q-panel>
			</q-panel>
		</div>

		<q-panel class="q-editor">
			<section class="q-edit-list-panel">
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
		overflow: auto;
	}

	.q-list-editor-img {
		width: 100px;
		height: 100px;
	}

	.hover {
		max-width: 768px;
		margin: 0 auto;
		background: #fff;
		position: relative;
		z-index: 2;
	}

	span, h1 {
		font-family: @font;
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
				checkedList: [],
				titleUnicode: false,
				authorUnicode: false
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
			},

			hasCheck() {
				return this.checkedList.length > 0;
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
				if(this.hasCheck)
					this.checkedList = [];
				else this.checkedList = this.content.map((v) => v.src);
			},

			unicodeText(isUnicode) {
				if(isUnicode) return "(Unicode Order)";
				return "(Locale Order)";
			},

			enqueue() {
				let musics = this.playlist.content;

				if(this.hasCheck) {
					musics = this.playlist.content.filter((v) => {
						return this.checkedList.includes(v.src);
					});
				}

				musics.forEach((v) => {
					this.playlist.player.addToQueueWrapped(v);
				});
			},

			copy() {

			},

			up() {
				this.checkedList.sort((v1, v2) => {
					return this.playlist.findIndex(v1) - this.playlist.findIndex(v2);
				}).every((v) => {
					return this.playlist.reorderDelta(v, -1) !== false;
				});
			},

			down() {
				this.checkedList.sort((v1, v2) => {
					return this.playlist.findIndex(v2) - this.playlist.findIndex(v1);
				}).every((v) => {
					return this.playlist.reorderDelta(v, 1) !== false;
				});
			},

			removeFrom() {
				this.checkedList.forEach((v) => {
					this.playlist.remove(v);
				});
			},

			sort(type) {
				switch(type) {
					case "title":
						this.playlist.sort(type, this.titleUnicode);
						this.titleUnicode = !this.titleUnicode;
						break;

					case "author":
						this.playlist.sort(type, this.authorUnicode);
						this.authorUnicode = !this.authorUnicode;
						break;

					default:
						this.playlist.sort(type);
				}
			},

			reverse() {
				this.playlist.reverse();
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
