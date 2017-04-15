<template>
	<div class="q-panel" :class="{column}">
		<slot></slot>
	</div>
</template>

<style lang="less" scoped>
	.q-panel {
		width: 100%;
		height: 100%;
		display: flex;
		flex: 1;

		&.column {
			flex-direction: column;
		}
	}
</style>

<script>
	export default {
		props: {
			column: {
				type: Boolean
			}
		}
	};
</script>
