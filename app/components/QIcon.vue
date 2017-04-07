<template>
	<i :class="className"></i>
</template>

<script>
	import "mdi/css/materialdesignicons.css";
	
	export default {
		props: {
			icon: {
				type: String,
				required: true
			}
		},

		computed: {
			className(){
				return `q-icon mdi mdi-${this.icon}`;
			}
		}
	};
</script>
