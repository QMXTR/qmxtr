<template>
	<q-modal :opened="opened">
		<q-select-list-panel @cancel="close" @select="select"></q-select-list-panel>
	</q-modal>
</template>

<script>
	export default {
		data() {
			return {
				opened: false
			};
		},

		methods: {
			open() {
				this.opened = true;
			},

			close() {
				this.opened = false;
			},

			select(id) {
				this.close();
				this.$emit('select', id);
			}
		}
	}
</script>
