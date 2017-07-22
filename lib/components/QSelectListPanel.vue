<template>
	<q-panel class="q-select-list">
		<q-panel class="inner-panel" column>
			<h1>Select Playlist</h1>

			<div class="selector-list">
				<q-panel column>
					<button
						@click="choose(list.id, ...arguments)"
						:class="{active: chosen === list.id}"
						v-for="(list, id) in playlist">

						<div class="button-inner">
							<div class="description">
								<span class="title">
									{{list.title}}
								</span>

								<span class="songs">
									({{list.content.length}})
								</span>
							</div>

							<a
								class="secondary-button"
								@click="remove(list.id, list.title, ...arguments)"
								v-if="list.removable">

								<q-icon icon="delete-forever"></q-icon>
							</a>
						</div>
					</button>
				</q-panel>
			</div>

			<q-panel class="input-layer">
				<div class="input">
					<input type="text" :id="`add-playlist${modalId}`" v-model="playlistTitle" :data-value="playlistTitle">
					<label :for="`add-playlist${modalId}`">
						Playlist Name
					</label>
					<div class="decorator"></div>
				</div>

				<button class="add-button" @click="newPlaylist">
					<div class="button-inner">
						<q-icon icon="playlist-plus"></q-icon>
						Create
					</div>
				</button>
			</q-panel>

			<q-panel class="actions">
				<button class="primary" :class="{disabled: !valid}" @click="emitChosen">
					<div class="button-inner">
						<q-icon icon="check"></q-icon>
						Select
					</div>
				</button>

				<button @click="emitCancel">
					<div class="button-inner">
						<q-icon icon="close"></q-icon>
						Cancel
					</div>
				</button>
			</q-panel>
		</q-panel>
	</q-panel>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-select-list {
		justify-content: center;
	}

	.inner-panel {
		max-width: 768px;
		width: 100%;
	}

	.selector-list {
		flex: 1;
		overflow: auto;

		button {
			flex: none;

			.button-inner {
				width: 80%;
				margin: 0 auto;
				text-align: left;
				font-family: @font;
				font-size: 1.2rem;
				display: flex;
				justify-content: space-between;
			    align-items: center;

				.description {
					display: flex;
					white-space: nowrap;
					text-overflow: ellipsis;

					.songs {
						color: lighten(@grey, 20%);
						font-size: .9rem;
						padding-left: 7px;
						display: inline-block;
					}
				}
			}
		}
	}

	h1 {
		font-family: @font;
	}

	button {
		flex: 1;
		background: @white;
		color: @grey;
		min-height: 50px;
		transition: all .4s ease;

		&.disabled {
			background: @grey;
			cursor: not-allowed;
			&:hover, &:active {
				background: @grey;
			}
		}

		.button-inner {
			font-size: 1.1rem;
			font-family: @font;
			color: @grey;
		}

		&:hover {
			background: lighten(@white-grey, 5%);
		}

		&:active {
			background: mix(@white-grey, @white);
		}

		&.active {
			background: @teal;
			color: #fff;

			&:active {
				background: lighten(@teal, 10%);
			}
		}

		.secondary-button {
			float: right;
			font-size: 1.5rem;
			cursor: pointer;

			&:hover {
				color: @dark-teal;
			}
		}
	}

	.add-button {
		flex: 1;
	}

	.actions, .input-layer {
		margin-top: 10px;
		margin-bottom: 10px;
		height: 50px;
		flex: none;
	}

	.primary {
		background: darken(@teal, 10%);
		.button-inner {
			color: @white;
		}

		&:hover {
			background: lighten(@teal, 5%);
		}

		&:active {
			background: darken(@teal, 2%);
		}
	}
</style>

<script>
	import swal from "sweetalert";

	export default {
		data() {
			return {
				chosen: -1,
				playlistTitle: '',
				modalId: Math.random().toString(36).slice(2)
			};
		},

		computed: {
			playlist() {
				return this.$store.state.playlist;
			},

			valid() {
				return !!this.playlist.find((v) => v.id === this.chosen);
			}
		},

		methods: {
			choose(id) {
				if(this.chosen === id) this.chosen = undefined;
				else this.chosen = id;
			},

			emitChosen() {
				if(this.valid)
					this.$emit('select', this.chosen);
			},

			emitCancel() {
				this.$emit('cancel');
			},

			newPlaylist() {
				this.$store.dispatch('new-playlist', this.playlistTitle);
			},

			remove(id, title) {
				swal({
					title: "Are you sure?",
					text: `You are now deleting playlist ${title}. ` +
						"If you are okay to delete the playlist, enter the name of your playlist here.",
					type: "input",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Delete",
					closeOnConfirm: false,
					inputPlaceholder: `${title}`
				},
				(input) => {
					if(input === false) return false;

					if(input === "") {
						swal.showInputError("You should enter your playlist title here.");
						return false;
					}

					if(input !== title) {
						swal.showInputError("There is something wrong in your title. Please check typo again!");
						return false;
					}

					swal({
						title: "Warning",
						text: "You will not be able to recover the playlist!",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Delete",
						cancelButtonText: "Cancel",
						closeOnConfirm: false,
						closeOnCancel: false
					},
					(isConfirm) => {
						if (isConfirm) {
							this.$store.dispatch('remove-playlist', id);
							swal("Deleted!", "Your playlist has been removed.", "success");
						}
					});
				});
			}
		}
	};
</script>
