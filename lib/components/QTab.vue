<template>
	<div class="q-tab">
		<div class="q-tab-content">
			<slot></slot>
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

	.q-tab {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.q-tab-content {
		width: 100%;
		flex: 1;
		overflow: hidden;
	}

	.q-tab-bar {
		width: 100%;
		height: 30px;
		padding-left: 10px;
		display: flex;
		overflow-x: hidden;
		overflow-y: visible;
		box-shadow: inset 0px 1px 0 0.1px @tabbar-border;

		&:hover {
			overflow-x: auto;
		}

		a {
			line-height: 29px;
			height: 29px;
			padding: 0 10px;
			color: @tabbar-color;
			font-family: @font;
			font-weight: @tabbar-weight;
			transition: all .3s ease;
			cursor: pointer;
			border-top: 1px solid transparent;

			&:hover {
				border-top: 1px solid @tabbar-border-hover;
				background: @tabbar-hover;
			}

			&.active {
				border-top: 1px solid @tabbar-border-active;
				color: @tabbar-active;
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
