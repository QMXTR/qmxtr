<template>
	<div v-show="active" class="q-tab-panel" :class="{active}">
		<slot></slot>
	</div>
</template>

<style lang="less" scoped>
	.q-tab-panel {
		display: none;
		width: 100%;
		height: 100%;

		&.active {
			display: flex;
			flex: 1;
		}
	}
</style>

<script>
	export default {
		data(){
			return {
				active: false
			};
		},

		props: ['title'],

		created(){
			if(!this.$parent && this.$parent.is === 'tab'){
				console.error('Error! A tab panel should be a child of tab');
			}

			this.$parent.tabs.push(this);
		},

		beforeDestroy(){
			this.$parent.tabs.$remove(this);
		}
	};
</script>
