<template>
	<transition name="fade">
		<div class="q-tab-panel" :class="{active}" v-show="active">
			<slot></slot>
		</div>
	</transition>
</template>

<style lang="less" scoped>
	.q-tab-panel {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.fade-enter-active, .fade-leave-active {
		transition: all .5s;
	}

	.fade-enter, .fade-leave-to {
		opacity: 0;
		transform: translateX(-300px);
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

			this.$watch('active', () => this.$emit('active'));
		},

		beforeDestroy(){
			if(this.parent) this.parent.tabs.$remove(this);
		}
	};
</script>
