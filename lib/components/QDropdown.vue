<template>
	<div class="dropdown">
		<div class="input">
			<input type="text"
				:id="`dropdown${id}`"
				v-model="text"
				:data-value="text"
				@blur="checkValue"
				@change="updateValue"
				@keydown="quick">

			<label :for="`dropdown${id}`" v-text="dropdownText"></label>

			<div class="decorator"></div>
			<q-icon class="icon-button" icon="unfold-more-horizontal"></q-icon>
			<div class="available">
				<button class="available-item"
					v-for="(item, key) in search"
					v-text="item"
					@mousedown="check(item)">
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	@import "~theme";

	.dropdown {
		padding: 30px;
		font-family: @font;

		.available {
			position: absolute;
			top: 50px;
			left: 0;
			width: 100%;
			transform-origin: top;
			transform: scaleY(0);
			opacity: 0;
			transition: all .4s ease;
			display: flex;
			flex-direction: column;
			box-shadow: 0 1px 5px rgba(0, 0, 0, .2),
			 	0 2px 2px rgba(0, 0, 0, .14),
				0 3px 2px -2px rgba(0, 0, 0, .12);

			button {
				display: block;
				color: @grey;
				width: 100%;
				padding: 15px 30px;
				background: #fff;
				text-align: left;

				&:hover {
					background: #f5f5f5;
				}
			}
		}

		.icon-button {
			position: absolute;
			top: .8em;
			right: 0;
			font-size: 1rem;
			transition: transform .4s ease;
		}

		.input {
			input {
				color: @grey;

				&:focus {
					~ .icon-button {
						transform: rotate(180deg);
					}

					~ .available {
						transform: scaleY(1);
						opacity: 1;
					}
				}
			}
		}
	}
</style>

<script>
	export default {
		data() {
			return {
				id: Math.random().toString(36).slice(2),
				text: ''
			};
		},

		model: {
			prop: 'value',
			event: 'change'
		},

		props: {
			value: {
				default: ''
			},

			available: {
				type: Array,
				required: true
			},

			dropdownText: {
				type: String,
				default: "Select"
			}
		},

		computed: {
			search() {
				return this.available.filter((v) => v.toLowerCase().includes(this.text.toLowerCase()));
			}
		},

		methods: {
			checkValue() {
				if(!this.updateValue()) {
					this.text = this.value;
				}
			},

			updateValue() {
				let contain = false;
				if(this.available.includes(this.text)){
					contain = true;
				} else {
					let text = this.available.find((v) => v.toLowerCase() === this.text.toLowerCase());

					if(text) {
						this.text = text;
						contain = true;
					}
				}

				if(contain) {
					this.$emit('change', this.text);
					return true;
				}

				return false;
			},

			check(item) {
				this.text = item;
			},

			quick(evt) {
				if(evt.key === 'Tab') {
					this.text = this.search[0];
					this.updateValue();
				}
			}
		},

		mounted() {
			if(this.value) this.text = this.value;
		}
	};
</script>
