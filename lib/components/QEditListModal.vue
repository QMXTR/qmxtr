<template>
	<q-modal :opened="opened" @close="close" backdropClosable>
		<q-edit-list-panel :playlist="playlist" :context="playlist.title"></q-edit-list-panel>
	</q-modal>
</template>

<script>
	export default {
		data() {
			return {
				opened: false
			};
		},

		props: {
			playlist: {
				required: true
			}
		},

		methods: {
			open() {
				this.opened = true;
			},

			close() {
				this.opened = false;
			}
		}
	}
</script>
