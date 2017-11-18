<template>
	<q-panel column>
		<h1>Library</h1>
		<q-song-listing :content="library.content"></q-song-listing>
	</q-panel>
</template>

<style lang="less" scoped>
	@import "~theme";
	h1 {
		font-family: @font;
		padding-left: 20px;
	}
</style>

<script>
	export default {
		computed: {
			library() {
				return this.$store.state.playlist.find((v) => v.id === 'library');
			}
		}
	};
</script>
