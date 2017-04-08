<template>
	<div class="q-tab">
		<div class="q-tab-content">
			<transition name="fade">
				<slot></slot>
			</transition>
		</div>

		<div class="q-tab-bar">
			<template v-for="header in tabs">
				<a :class="{active: header.active}" @click="open(header, $event)" v-html="header.title"></a>
			</template>
		</div>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";
	.fade-enter-active, .fade-leave-active {
		transition: opacity .5s;
	}

	.fade-enter, .fade-leave-to {
		opacity: 0;
	}

	.q-tab {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.q-tab-content {
		width: 100%;
		flex: 1;
	}

	.q-tab-bar {
		width: 100%;
		height: 30px;
		padding-left: 10px;
		display: flex;
		overflow: hidden;
		border-top: 1px solid @tabbar-border;

		&:hover {
			overflow: auto;
		}

		a {
			line-height: 30px;
			padding: 0 10px;
			color: @tabbar-color;
			font-family: @font;
			font-weight: @tabbar-weight;
			transition: all .3s ease;
			cursor: pointer;

			&:hover {
				border-top: 1px solid @tabbar-border-hover;
				background: @tabbar-hover;
			}

			&.active {
				border-top: 1px solid @teal;
				color: @teal;
			}
		}
	}
</style>

<script>
	export default {
		data(){
			return {
				tabs: [],
				is: 'tab'
			};
		},
		methods: {
			open(tab, event){
				this.tabs.forEach((v) => v.active = false);
				tab.active = true;
				event.preventDefault();
			}
		}
	};
</script>
