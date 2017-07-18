<template>
	<div class="q-tab-panel" :class="{active}">
		<slot></slot>
	</div>
</template>

<style lang="less" scoped>
	.q-tab-panel {
		position: absolute;
		width: 100%;
		height: 100%;
		transition: all .5s;

		&:not(.active) {
			opacity: 0;
			z-index: -1;
		}

		&.active {
			opacity: 1;
			z-index: auto;
		}
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
			this.update();
		},

		methods: {
			update() {
				this.$children.forEach((v) => {
					if(typeof v.update === 'function') v.update();
				});
			}
		},

		beforeDestroy(){
			if(this.parent) this.parent.tabs.$remove(this);
		}
	};
</script>
