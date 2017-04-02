<template>
	<div id="app">
		<q-workspace>
			<q-panel>
				<q-tab>
					<q-tabbar slot="tabbar">
					</q-tabbar>
					<q-aa-panel></q-aa-panel>
				</q-tab>
			</q-panel>
		</q-workspace>
		<q-aside>
			<q-panel>
				<q-playlist></q-playlist>
			</q-panel>
		</q-aside>
		<q-controlbar>
			<q-panel>
				<q-controller></q-controller>
				<q-seekbar></q-seekbar>
			</q-panel>
		</q-controlbar>
	</div>
</template>

<style lang="less">
	body, html {
		margin: 0;
		padding: 0;
	}
</style>

<script>
	export default {};
</script>
