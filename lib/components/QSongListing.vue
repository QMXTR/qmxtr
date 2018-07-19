<template>
	<q-panel class="q-song-listing">
		<div class="q-song" v-for="elem in content">
			<div class="q-song-img" :class="{'cover-default': !elem.albumArt}">
				<img class="q-song-img-content" :src="elem.albumArt" v-if="elem.albumArt">
			</div>

			<h2 class="q-song-title" v-text="elem.title" :title="elem.title"></h2>
			<span class="q-song-author" v-text="elem.author" :title="elem.author"></span>

			<a class="q-song-overlay" @click="addToQueue(elem)">
				<q-icon icon="play"></q-icon>
			</a>
		</div>
		<slot></slot>
	</q-panel>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-song-listing {
		flex-wrap: wrap;
		overflow: auto;

		.q-song {
			// flex-grow: 1;
			width: ~"calc(25% - 60px)";
			height: 33%;
			box-sizing: border-box;
			margin: 30px;
			display: flex;
			flex-direction: column;
			position: relative;

			.q-song-overlay {
				background: rgba(0, 0, 0, .4);
				color: #fff;
				font-size: 3rem;
				position: absolute;
				top: -15px;
				left: -15px;
				width: ~"calc(100% + 30px)";
				height: ~"calc(100% + 30px)";
				display: flex;
				align-items: center;
				justify-content: center;
				opacity: 0;
				transition: opacity .4s ease;
				cursor: pointer;
			}

			&:hover {
				.q-song-overlay {
					opacity: 1;
				}
			}

			.q-song-img {
				flex: 1;
				overflow: hidden;

				.q-song-img-content {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				&.cover-default {
					background: @light-grey;
					position: relative;

					&::after {
						content: 'No Cover';
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						color: #fff;
						font-family: @font;
					}
				}
			}

			.q-song-title {
				font-size: 1.2rem;
				line-height: 1.7rem;
				margin-top: 10px;
				padding: 0;
			}

			.q-song-title, .q-song-author {
				color: @grey;
				font-family: @font;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		}
	}
</style>

<script>
	export default {
		props: {
			content: {
				type: Array,
				required: true
			}
		},

		methods: {
			addToQueue(elem) {
				this.$store.dispatch('add-to-queue-wrapped', elem);
			}
		}
	};
</script>
