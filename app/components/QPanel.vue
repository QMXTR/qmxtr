<template>
	<div :class="className">
		<slot></slot>
	</div>
</template>

<style lang="less" scoped>
	.q-panel {
		width: 100%;
		height: 100%;
		display: flex;
		flex: 1;
	}
</style>

<script>
	export default {
		props: {
			column: {
				type: Boolean
			}
		},

		computed: {
			className(){
				return `q-panel${this.column ? ' column' : ''}`;
			}
		}
	};
</script>
