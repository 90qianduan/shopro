<template>
	<!-- 轮播 -->
	<view class="banner-swiper-box mb10" v-if="detail.list">
		<u-swiper
			@change="swiperChange"
			:borderRadius="0"
			:height="350"
			:list="detail.list"
			:bgColor="bgcolor"
			:title="title"
			:effect3d="effect3d"
			:indicator-pos="indicatorPos"
			:mode="mode"
			:interval="3000"
			@click="onImage"
		></u-swiper>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			swiperCurrent: 0, //轮播下标
			title: false,
			mode: 'round',
			indicatorPos: 'bottomCenter',
			effect3d: false,
			bgcolor: ''
		};
	},
	props: {
		detail: {
			type: Object,
			default: null
		}
	},
	computed: {},
	created() {
		this.initBgColor();
	},
	methods: {
		// 轮播切换
		swiperChange(current) {
			this.swiperCurrent = current;
			this.initBgColor();
		},
		// 初始化背景颜色，轮播图没滚动前
		initBgColor() {
			this.bgcolor = this.detail.list[this.swiperCurrent].bgcolor;
			this.$emit('getbgcolor', this.bgcolor);
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		// 点击图片
		onImage(index) {
			let path = this.detail.list[index].path;
			this.$tools.routerTo(path);
		}
	}
};
</script>

<style lang="scss">
// 轮播
.banner-swiper-box {
	background: #fff;
}
</style>
