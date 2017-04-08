<template>
	<main class="q-workspace">
		<slot></slot>
	</main>
</template>

<style lang="less" scoped>
	@import "~theme";
	.q-workspace {
		top: 0;
		left: 0;
		right: @aside-size;
		bottom: @controlbar-size;
		position: fixed;
	}
</style>

<script>
	export default {};
</script>
