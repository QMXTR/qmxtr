<template>
	<q-panel class="q-select-list">
		<div class="inner-panel">
			<h1>Select Playlist</h1>

			<div class="selector-list">
				<q-panel column>
					<button @click="choose(id)" :class="{active: chosen === id}" v-for="(list, id) in playlist">
						<div class="button-inner" v-text="list.title"></div>
					</button>
				</q-panel>

				<q-panel>
					<input type="text">
					<q-button>
						<div>
							Add
						</div>
					</q-button>
				</q-panel>
			</div>
		</div>
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

	h1 {
		font-family: @font;
	}

	button {
		flex: 1;
		background: @white;
		color: @grey;
		min-height: 50px;
		transition: all .4s ease;

		.button-inner {
			width: 80%;
			margin: 0 auto;
			text-align: left;
			font-family: @font;
			font-size: 1.2rem;
		}

		&:hover {
			background: @white-grey;
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
	}
</style>

<script>
	export default {
		data() {
			return {
				chosen: undefined
			};
		},

		computed: {
			playlist() {
				return this.$store.state.playlist;
			}
		},

		methods: {
			choose(id) {
				if(this.chosen === id) this.chosen = undefined;
				else this.chosen = id;
			}
		}
	};
</script>
