<template>
	<transition name="fade" mode="out-in">
		<div v-show="active" class="q-tab-panel" :class="{active}">
			<slot></slot>
		</div>
	</transition>
</template>

<style lang="less" scoped>
	.q-tab-panel {
		width: 100%;
		height: 100%;
		will-change: opacity;
	}

	.fade-enter-active, .fade-leave-active {
		transition: opacity .5s ease;
	}

	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
</style>

<script>
	export default {
		props: {
			title: {
				type: String,
				required: true
			},

			default: {
				type: Boolean
			}
		},

		data(){
			return {
				active: this.default,
				parent: undefined
			};
		},

		created(){
			let parent = this.$parent;
			while(parent && parent.is !== 'tab'){
				parent = parent.$parent;
			}

			if(!parent || parent.is !== 'tab' || !parent.tabs){
				console.error('Error! A tab panel should be a child of tab');
				return;
			}

			this.parent = parent;
			this.parent.tabs.push(this);

			this.$watch('active', () => this.$store.dispatch('draw-wave'));
		},

		beforeDestroy(){
			if(this.parent) this.parent.tabs.$remove(this);
		}
	};
</script>
