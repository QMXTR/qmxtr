<template>
	<aside class="q-aside">
		<slot></slot>
	</aside>
</template>

<style lang="less" scoped>
	@import "~theme";
	.q-aside {
		position: fixed;
		background: @aside-color;
		width: @aside-size;
		top: 0;
		right: 0;
		bottom: @controlbar-size;
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
