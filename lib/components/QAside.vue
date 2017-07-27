<template>
	<aside class="q-aside">
		<slot></slot>
	</aside>
</template>

<style lang="less" scoped>
	@import "~theme";
	.q-aside {
		background: @aside-color;
		width: @aside-size;
		top: 0;
		right: 0;
		height: 100%;
		flex: none;
	}
</style>

<script>
	import QTab from "./QTab.vue";

	export default {
		components: {
			QTab
		}
	}
</script>
