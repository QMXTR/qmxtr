<template>
	<transition name="modal">
		<div>
			<div class="backdrop" @click="backdropClose"></div>
			<section class="q-modal">
				<a @click="closeModal" class="modal-closer">&times;</a>
				<slot></slot>
			</section>
		</div>
	</transition>
</template>

<style lang="less" scoped>
	@import "~theme";

	.backdrop {
	   background: rgba(0, 0, 0, 0.6);
	   position: fixed;
	   left: 0;
	   top: 0;
	   width: 100vw;
	   height: 100vh;
	   z-index: 99;
	}

	.modal {
	   position: fixed;
	   left: 50%;
	   top: 50%;
	   transform: translate(-50%, -50%);
	   background: @modal-background;
	   z-index: 100;
	}

	.modal-closer {
	   color: @modal-closer;
	   cursor: pointer;
	   font-size: 20px;
	   position: absolute;
	   top: 10px;
	   right: 10px;
	}

	.modal-enter {
		opacity: 0;
	}

	.modal-leave-active {
		opacity: 0;
	}

	.modal-enter .modal-container,
	.modal-leave-active .modal-container {
		-webkit-transform: scale(1.1);
		transform: scale(1.1);
	}
</style>

<script>
	export default {
		props: {
			backdropClosable: {
				type: Boolean
			}
		},

		methods: {
			closeModal() {
				this.$emit('close');
			},

			backdropClose() {
				if(this.backdropClosable)
					this.$emit('close');
			}
		}
	};
</script>
