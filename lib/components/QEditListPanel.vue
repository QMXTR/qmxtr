<template>
	<q-panel class="panel-wrapper" column>
		<div class="hover">
			<h1 v-text="`Editing ${context}`"></h1>

			<q-panel class="toolkit">
				<q-panel class="toolkit-panel toolkit-check">
					<q-button direction="top" @click="checkall" tooltip>
						<q-icon icon="checkbox-multiple-marked-outline"></q-icon>
						<span slot="tooltip">Uncheck/Check All</span>
					</q-button>

					<q-button direction="top" @click="invert" tooltip>
						<q-icon icon="select-inverse"></q-icon>
						<span slot="tooltip">Invert selection</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-copy">
					<q-button :disabled="isQueue" @click="enqueue" tooltip>
						<q-icon icon="library-plus"></q-icon>
						<span slot="tooltip">Add to Queue</span>
					</q-button>

					<q-button @click="copy" tooltip>
						<q-icon icon="content-copy"></q-icon>
						<span slot="tooltip">Copy to another Playlist</span>
					</q-button>
				</q-panel>

				<q-panel class="toolkit-panel toolkit-manipulate">
					<q-button :disabled="!hasCheck || !canModify" @click="up" tooltip>
						<q-icon icon="chevron-up"></q-icon>
						<span slot="tooltip">Up</span>
					</q-button>

					<q-button :disabled="!hasCheck || !canModify" @click="down" tooltip>
						<q-icon icon="chevron-down"></q-icon>
						<span slot="tooltip">Down</span>
					</q-button>

					<q-button :disabled="!hasCheck || !canModify" @click="removeFrom" tooltip>
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
			</q-panel>

			<div class="input">
				<input type="text" :id="`search-playlist${modalId}`" v-model="search" :data-value="search">
				<label :for="`search-playlist${modalId}`">
					Search...
				</label>
				<div class="decorator"></div>
			</div>
		</div>

		<q-panel class="q-editor">
			<section class="q-edit-list-panel">
				<draggable
					v-model="blurryContent"
					class="q-list-editor-list"
					:options="sortableOptions"
					@change="propagate">

					<transition-group name="q-list" :duration="400">
						<div
							class="q-list-editor-item"
							v-for="(element, index) in blurryContent"
							:key="element.src">

							<div class="q-list-editor-handle" :class="{disabled: sortableOptions.disabled}">
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

		<q-select-list-modal ref="listChooser"></q-select-list-modal>
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
		transform: translateX(50px);
		height: 0 !important;
		overflow: hidden;
	}

	.q-list-editor-handle {
		line-height: 50px;
		cursor: move;
		color: @editor-color;
		position: relative;

		&.disabled {
			cursor: not-allowed;
		}
	}

	.q-list-editor-item {
		height: 150px;
		display: flex;
		align-items: center;
		font-family: @font;
		font-weight: @aside-font-weight;
		position: relative;
		transition: all .4s ease;
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
		width: 100%;
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
		width: 100%;
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
	import swal from "sweetalert";

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
				authorUnicode: false,
				search: "",
				modalId: Math.random().toString(36).slice(2)
			};
		},

		computed: {
			content() {
				return this.playlist.content;
			},

			blurryContent() {
				const query = this.search.toLowerCase();

				return this.content.filter((v) => {
					return v.title.toLowerCase().includes(query) || v.author.toLowerCase().includes(query);
				});
			},

			isQueue() {
				return this.playlist.isQueue;
			},

			hasCheck() {
				return this.checkedList.length > 0;
			},

			canModify() {
				return this.search === "";
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

			invert() {
				this.checkedList = this.content.map((v) => v.src).filter((v) => !this.checkedList.includes(v));
			},

			checkall() {
				if(this.hasCheck)
					this.checkedList = [];
				else this.checkedList = this.blurryContent.map((v) => v.src);
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
				this.$refs.listChooser.$off('select');
				this.$refs.listChooser.$once('select', (id) => {
					const target = this.playlist.player.playlist[id];
					let source = this.content.filter((v) => this.checkedList.includes(v.src));
					if(source.length === 0) source = this.content;
					source.forEach((v) => target.add(v));

					swal({
						title: "Copied!",
						text: `Successfully copied to playlist ${target.title}.`,
						type: "success",
						customClass: "q-success-alert"
					});
				});

				this.$refs.listChooser.open();
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
				const unfinished = [];

				this.checkedList.forEach((v) => {
					const result = this.playlist.remove(v);
					if(result === false && this.playlist.isLibrary) {
						unfinished.push(this.content.find((v1) => v1.src === v).title);
					}
				});

				if(unfinished.length > 0) {
					swal({
						title: "Removed with warnings",
						text: `Can't remove songs: ${unfinished.join(', ')}. ` +
							`Please remove the songs from other playlists. ` +
							`Since this playlist is library, you can't remove songs which consist other playlists.`,
						type: "warning"
					});
				}
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
			},

			search() {
				this.sortableOptions.disabled = (this.search !== "");
			}
		}
	};
</script>
