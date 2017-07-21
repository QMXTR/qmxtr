<template>
	<div class="q-button-wrapper" :class="{disabled}">
		<button class="q-button" @click="click">
			<slot></slot>
		</button>

		<div v-if="tooltip" class="tooltip" :class="direction">
			<slot name="tooltip"></slot>
		</div>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";

	.q-button-wrapper {
		background: @button-background;
		display: inline-block;
		min-width: 50px;
		min-height: 50px;
		flex: 1;
	}

	.q-button {
		color: @button-color;
		border: 1.5px solid @button-background;
		border-radius: 2px;
		width: 100%;
		height: 100%;
		padding: 10px 5px;
		position: relative;
		cursor: pointer;
		overflow: hidden;
		transition: all .4s ease;
		box-sizing: border-box;
		font-size: 1.5rem;

		&>* {
			position: relative;
		}

		&:hover {
			border: 1.5px solid @button-background;
			color: @button-background;
		}

		&::before {
			content: '';
			display: block;
			background: @button-color;
			position: absolute;
			top: 0;
			left: ~"calc(-100% - 85px)";
			width: ~"calc(100% + 62px)";
			height: 100%;
			transform: skewX(-45deg);
			transition: left .4s ease;
		}

		&:hover {
			&::before {
				left: -30px;
			}
		}
	}

	.disabled {
		.q-button {
			background: @button-disabled;
			border: 1.5px solid @button-disabled;
			color: @button-disabled-color;
			cursor: not-allowed;

			&:hover::before {
				border: 1.5px solid @button-disabled;
				color: @button-disabled-color;
				left: ~"calc(-100% - 85px)";
			}
		}
	}

	.tooltip {
		background: @button-tooltip;
		color: @button-tooltip-color;
		border-radius: 2px;
		position: absolute;
		transition: transform .4s ease;
		padding: 10px;
	    white-space: pre;

		&.left {
			left: -45px;
		}

		&.right {
			right: -45px;
		}

		&.top {
			top: -45px;
		}

		&.bottom {
			bottom: -45px;
		}

		&.bottom, &.top {
			left: 50%;
			transform: rotateY(90deg) translateX(-50%);
			transform-origin: left;
		}

		&.left, &.right {
			top: 50%;
			transform: rotateX(90deg) translateY(-50%);
			transform-origin: top;
		}
	}

	.q-button-wrapper {
		position: relative;
	}

	:not(.disabled)>button:hover+.tooltip {
		&.bottom, &.top {
			transform: rotateY(0deg) translateX(-50%);
		}

		&.left, &.right {
			transform: rotateX(0deg) translateY(-50%);
		}
	}
</style>

<script>
	export default {
		props: {
			direction: {
				type: String,
				default: 'top'
			},

			disabled: {
				type: Boolean
			},

			tooltip: {
				type: Boolean
			}
		},

		methods: {
			click(){
				this.$emit('click');
			}
		}
	};
</script>
