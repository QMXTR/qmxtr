<template>
	<q-panel column>
		<q-panel class="top-searchbar">
			<div class="search-wrapper">
				<div class="input">
					<input type="text"
						:id="`query${id}`"
						v-model="query"
						:data-value="query"
						@keydown="quickSearch">

					<label :for="`query${id}`">
						Search...
					</label>
					<div class="decorator"></div>
				</div>
			</div>
			<q-dropdown :available="providerNames" v-model="providerName" dropdown-text="Select Provider"></q-dropdown>
			<button class="button search-button" :class="{disabled: !provider}" @click="search">
				<div class="button-inner">
					Search
					<q-icon icon="magnify" class="secondary-icon"></q-icon>
				</div>
			</button>
		</q-panel>
		<q-song-listing :content="queryResult">
			<div class="pagination" v-if="!searchFinished">
				<a class="pagination-wrapper" @click="queryNext">
					<span class="page-number">{{pagination}} / {{pages}}</span>
				</a>
			</div>
		</q-song-listing>
	</q-panel>
</template>

<style lang="less" scoped>
	@import "~theme";

	.top-searchbar {
		flex: none;
		height: initial;
	}

	.pagination {
		position: relative;
		margin: 4rem;
		font-family: @font;
		font-size: 1.3rem;
		background: @grey;
		height: 200px;
		text-align: center;
		width: 100%;
	}

	.pagination-wrapper {
		display: block;
		text-decoration: none;
		position: relative;
		padding: 12px;
		height: 60px;
		width: 100px;
		margin: 6px auto;
		top: 80px;
		cursor: pointer;

		.page-number {
			font-family: @font;
			color: @grey;
			position: absolute;
			font-size: 1rem;
			z-index: 1;
			left: 50%;
			top: ~"calc(50% - 0.5rem)";
			transform: translate(-50%, -50%);
			transition: all .4s ease;
		}

		&:before, &:after {
			content: '';
			background: @white;
			width: 62px;
			height: 60px;
			position: absolute;
			top: 0;
			transition: all .5s ease;
		}

		&:before {
			left: 0;
			transform: skew(0deg, 20deg);
		}

		&:after {
			right: 0;
			transform: skew(0deg, -20deg);
		}

		&:hover {
			&:after, &:before {
				background: @teal;
			}

			.page-number {
				color: @white;
			}
		}
	}

	button.button.search-button {
		flex: 0.2;
		padding: 0 30px;
		margin: 30px 30px 30px -30px;
		max-height: 50px;
	}

	.search-wrapper {
		flex: 1;
		padding: 30px;
		padding-right: 0;
		margin-right: -30px;
	}

	@media (max-width: 1024px) {
		.secondary-icon {
			display: none;
		}
	}
</style>

<script>
	import swal from "sweetalert";

	export default {
		data() {
			return {
				query: '',
				queryResult: [],
				providerName: '',
				searching: false,
				id: Math.random().toString(36).slice(2),
				last: 0,
				itemsPerSearch: 25,
				pagination: 0,
				pages: 0,
				total: 0
			};
		},

		computed: {
			providers() {
				return this.$store.state.providers;
			},

			providerNames() {
				return this.providers.map((v) => v.getName());
			},

			provider() {
				return this.providers.find((v) => v.getName() === this.providerName);
			},

			searchFinished() {
				return this.queryResult.length === this.total;
			}
		},

		methods: {
			quickSearch(evt) {
				if(evt.key === 'Enter') {
					this.search();
				}
			},

			search() {
				this.queryResult = [];
				this.last = 0;
				this.total = Infinity;
				this.queryNext();
			},

			queryNext() {
				if(!this.provider) return;
				if(this.searching) return;
				if(this.searchFinished) return;

				this.searching = true;

				(async () => {
					try {
						const result = await this.provider.query(this.query, this.last, this.itemsPerSearch);
						this.queryResult.push(...result.content);
						this.last += result.content.length;
						this.total = result.total;
						this.pagination = Math.ceil(this.last / this.itemsPerSearch);
						this.pages = Math.ceil(this.total / this.itemsPerSearch);
					} catch(e) {
						swal("Oops!", `Unfortunately, you've encountered an unknown error: ${e.toString()}`, "error");
					}

					this.searching = false;
				})();
			}
		}
	};
</script>
