<template>
	<i :class="className"></i>
</template>

<script>
	import "mdi/css/materialdesignicons.css";
	import "ionicons/dist/css/ionicons.css";

	export default {
		props: {
			icon: {
				type: String,
				required: true
			},

			ionic: {
				type: Boolean
			}
		},

		computed: {
			className(){
				if(!this.ionic) return `q-icon mdi mdi-${this.icon}`;
				return `q-icon icon ion-${this.icon}`;
			}
		}
	};
</script>
