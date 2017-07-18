<template>
	<section class="q-workspace">
		<slot></slot>
	</section>
</template>

<style lang="less" scoped>
	@import "~theme";
	.q-workspace {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>

<script>
	export default {};
</script>
