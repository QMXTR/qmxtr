<template>
	<footer class="q-controlbar">
		<slot></slot>
	</footer>
</template>

<style lang="less" scoped>
	@import "~theme";
	.q-controlbar {
		background: @controlbar-color;
		height: @controlbar-size;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}
</style>
