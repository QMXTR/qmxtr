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
	}
</style>
