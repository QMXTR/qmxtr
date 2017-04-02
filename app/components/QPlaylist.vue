<template>
	<draggable v-model="queue">
		<transition-group>
			<div v-for="element in queue" :key="element.src">
				{{element.title}} - {{element.author}}
			</div>
		</transition-group>
	</draggable>
</template>

<script>
	import draggable from "vuedraggable";

	export default {
		components: {
			draggable
		},

		computed: {
			queue(){
				return this.$store.state.queue;
			}
		}
	}
</script>
