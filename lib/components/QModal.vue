<template>
	<transition name="modal" :duration="400">
		<div v-if="opened">
			<div class="backdrop" @click="backdropClose"></div>
			<section class="q-modal">
				<a @click="closeModal" class="modal-closer" v-if="backdropClosable">&times;</a>
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

	.q-modal {
	   position: fixed;
	   left: 15vw;
	   top: 15vh;
	   width: 70vw;
	   height: 70vh;
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

	.q-modal, .backdrop{
		transition: all .4s ease;
	}

	.modal-enter, .modal-leave-active {
		.q-modal, .backdrop {
			opacity: 0;
			transform: scale(1.1);
		}
	}
</style>

<script>
	export default {
		props: {
			backdropClosable: {
				type: Boolean
			},

			opened: {
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
