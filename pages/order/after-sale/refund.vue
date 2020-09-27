<template>
	<view class="page_box">
		<view class="content_box">
			<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
				<view class="goods-box">
					<shopro-mini-card :type="'order'" :detail="orderItemDetail"><block slot="goodsBottom"></block></shopro-mini-card>
				</view>
				<view class="refund-item">
					<u-form-item required prop="type" :borderBottom="false" :label-position="'top'" :label="'请选择售后类型'" :labelStyle="labelStyle" label-width="150">
						<u-radio-group v-model="model.type" :active-color="'#ECBE60'" :wrap="true">
							<view class="x-f" :style="{ height: '80rpx', width: '100%' }" v-for="(item, index) in refundTypeList" :key="index">
								<u-radio labelSize="28rpx" shape="circle" :name="item.value">{{ item.title }}</u-radio>
							</view>
						</u-radio-group>
					</u-form-item>
				</view>
				<view class="goods-item x-bc" @tap="onSelCause">
					<text class="item-title">选择申请原因</text>
					<view class="x-f refund-cause">
						<text style="margin-right: 20rpx;">{{ refundCause }}</text>
						<text class="cuIcon-right"></text>
					</view>
				</view>
				<!-- 联系方式 -->
				<view class="refund-item mb20">
					<u-form-item required :borderBottom="false" :labelStyle="labelStyle" label-position="top" label="联系方式" prop="phone" label-width="150">
						<view :style="{ width: '100%', background: 'rgba(249, 250, 251, 1)', 'border-radius': '20rpx', paddingLeft: '20rpx' }">
							<u-input :placeholderStyle="placeholderStyle" placeholder="请输入您的联系电话" v-model="model.phone" type="number"></u-input>
						</view>
					</u-form-item>
				</view>
				<!-- 留言 -->
				<view class="refund-item" style="margin-bottom: 20rpx;" v-show="!showModal">
					<view class="item-title">相关描述</view>
					<view class="describe-box">
						<u-form-item required prop="content" :borderBottom="false">
							<u-input type="textarea" :placeholderStyle="placeholderStyle" placeholder="客官~请描述您遇到的问题，建议上传照片" v-model="model.content" />
						</u-form-item>
						<u-form-item prop="images" label-width="150" :borderBottom="false">
							<u-upload
								:showProgress="false"
								@on-uploaded="uploadSuccess"
								@on-remove="uploadRemove"
								:action="`${this.$API_URL}/index/upload`"
								width="136"
								height="136"
								customBtn
								maxCount="9"
							>
								<block slot="addBtn">
									<view class="img-box">
										<view class="choose-img x-c"><text class="cuIcon-cameraadd"></text></view>
									</view>
								</block>
							</u-upload>
						</u-form-item>
					</view>
				</view>
			</u-form>
		</view>
		<view class="foot_box x-bc">
			<button class="cu-btn sub-btn" @tap="postAftersale">提交</button>
			<button class="cu-btn contcat-btn" v-if="addons.includes('kefu')" @tap="onService">联系客服</button>
		</view>
		<shopro-modal v-model="showModal" :modalType="'bottom-modal'">
			<block slot="modalContent">
				<view class="modal-box page_box">
					<view class="modal-head head_box x-c">{{ modalDetail.title }}</view>
					<view class="modal-content content_box">
						<view class="y-f">
							<label class="sel-item x-bc" @tap="onRefundCause(item.val)" v-for="item in modalDetail.list" :key="item.id">
								<text>{{ item.val }}</text>
								<checkbox class="orange radio round sel-radio" :class="{ checked: refundCause == item.val }" :checked="refundCause == item.val"></checkbox>
							</label>
						</view>
					</view>
					<view class="modal-foot foot_box x-c"><button class="cu-btn close-btn" @tap="onClose">确定</button></view>
				</view>
			</block>
		</shopro-modal>
	</view>
</template>

<script>
import shoproMiniCard from '@/components/shopro-mini-card/shopro-mini-card.vue';
import shoproModal from '@/components/shopro-modal/shopro-modal.vue';
export default {
	components: {
		shoproMiniCard,
		shoproModal
	},
	data() {
		return {
			addons: uni.getStorageSync('addons'),
			showModal: false,
			orderId: 0, //订单ID
			orderItemDetail: {}, //订单信息
			modalDetail: {},
			refundCause: '', //退款原因
			refundTypeList: [
				{
					title: '退款',
					value: 'refund'
				},
				{
					title: '退货',
					value: 'return'
				},
				{
					title: '其他',
					value: 'other'
				}
			],
			refundList: {
				title: '申请原因',
				list: [
					{
						id: 1,
						val: '卖家发错货了'
					},
					{
						id: 2,
						val: '退运费'
					},
					{
						id: 3,
						val: '大小/重量于商品描述不符'
					},
					{
						id: 4,
						val: '生产日期、保质期与商品不符'
					},
					{
						id: 5,
						val: '质量问题'
					}
				]
			},
			// 表单
			errorType: ['toast'],
			labelStyle: {
				'font-size': '30rpx',
				'font-weight': 'bold',
				color: 'rgba(51, 51, 51, 1)'
			},
			placeholderStyle: 'font-size: 26rpx;color: rgba(177, 179, 199, 1);',
			model: {
				type: '',
				content: '',
				images: [],
				phone: ''
			},
			rules: {
				type: [
					{
						required: true,
						message: '请选择申请售后类型',
						trigger: 'change'
					}
				],
				content: [
					{
						required: true,
						message: '请填写相关描述'
					},
					{
						max: 120,
						message: '描述最多120个字符',
						trigger: 'change'
					}
				],
				phone: [
					{
						required: true,
						message: '请输入手机号',
						trigger: ['change', 'blur']
					},
					{
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						// 触发器可以同时用blur和change，二者之间用英文逗号隔开
						trigger: ['change', 'blur']
					}
				]
			}
		};
	},
	computed: {},
	onReady() {
		this.$refs.uForm.setRules(this.rules);
	},
	onLoad() {
		this.getOrderItemDetail();
	},
	methods: {
		// 跳转客服
		onService() {
			this.$Router.push('/pages/public/kefu/index');
		},
		// 上传图片成功
		uploadSuccess(lists, index) {
			this.model.images = [];
			lists.forEach(item => {
				let imgPath = item.response.data.full_url;
				this.model.images.push(imgPath);
			});
		},

		// 移除图片
		uploadRemove(index, lists) {
			this.model.images.splice(index, 1);
		},

		// 选择售后原因
		onRefundCause(value) {
			this.refundCause = value;
		},
		// 订单item详情
		getOrderItemDetail() {
			let that = this;
			that.$api('order.itemDetail', {
				id: that.$Route.query.orderId,
				order_item_id: that.$Route.query.orderItemId
			}).then(res => {
				if (res.code === 1) {
					that.orderItemDetail = res.data;
				}
			});
		},
		// 提交售后
		postAftersale() {
			let that = this;
			uni.showLoading();
			this.$refs.uForm.validate(valid => {
				if (valid) {
					that.$api('order.aftersale', {
						order_id: that.$Route.query.orderId,
						order_item_id: that.$Route.query.orderItemId,
						reason: that.refundCause,
						...that.model
					}).then(res => {
						if (res.code === 1) {
							//  #ifdef MP-WEIXIN
							this.$store.dispatch('getMessageIds', 'aftersale');
							//  #endif
							uni.hideLoading();
							that.$Router.replace('/pages/order/after-sale/list');
						}
					});
				} else {
					console.log('验证失败');
				}
			});
		},
		// 选择申请原因
		onSelCause() {
			this.modalDetail = this.refundList;
			this.showModal = true;
		},
		// 关闭
		onClose() {
			this.showModal = false;
		}
	}
};
</script>

<style lang="scss">
// 售后项目
.refund-item {
	background-color: #fff;
	border-bottom: 1rpx solid #f5f5f5;
	padding: 30rpx;
	.item-title {
		font-size: 30rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: rgba(51, 51, 51, 1);
		margin-bottom: 20rpx;
	}
	// 留言
	.describe-box {
		width: 690rpx;
		padding: 20rpx;
		background: rgba(249, 250, 251, 1);
		border-radius: 20rpx;
	}
}

.goods-box {
	background: #fff;
	padding: 30rpx 25rpx;
	margin-bottom: 20rpx;
}

.goods-item {
	height: 95rpx;
	background: #fff;
	padding: 0 25rpx;
	margin-bottom: 20rpx;
	border-top: 1rpx solid rgba(#dfdfdf, 0.5);

	// 售后原因
	.refund-cause {
		font-size: 26rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(177, 179, 199, 1);
	}

	&:nth-of-type(2n) {
		margin-bottom: 0;
		border-top: 0;
	}

	.item-title {
		font-size: 28rpx;
	}

	.cuIcon-right {
		font-size: 32rpx;
	}

	.price {
		font-size: 28rpx;
		color: #a8700d;
	}
}

.img-box {
	display: flex;
	align-items: center;
	flex-wrap: wrap;

	.choose-img {
		width: 130rpx;
		height: 130rpx;
		background: rgba(249, 250, 251, 1);
		border: 1rpx solid rgba(223, 223, 223, 1);
		position: relative;
		margin: 10rpx;
		.cuIcon-cameraadd {
			font-size: 50rpx;
			color: #dfdfdf;
		}
	}
}

.foot_box {
	height: 100rpx;
	background-color: #fff;
	padding: 0 30rpx;
	.sub-btn {
		flex: 1;
		height: 74rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 38rpx;
		color: rgba(#fff, 0.9);
		font-size: 28rpx;
	}
	.contcat-btn {
		flex: 1;
		height: 74rpx;
		background: rgba(238, 238, 238, 1);
		border-radius: 38rpx;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 400;
		color: rgba(51, 51, 51, 1);
	}
}

.modal-box {
	width: 750rpx;
	height: 680rpx;
	border-radius: 30rpx 30rpx 0 0;
	background: #fff;

	.modal-head {
		height: 100rpx;
		font-size: 30rpx;
	}

	.modal-content {
		font-size: 28rpx;

		.sel-item {
			height: 100rpx;
			width: 100%;
			padding: 0 20rpx;
			border-bottom: 1rpx solid rgba(223, 223, 223, 0.5);

			.sel-radio {
				transform: scale(0.7);
			}
		}
	}

	.modal-foot {
		.close-btn {
			width: 710rpx;
			height: 80rpx;
			background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
			border: 1rpx solid rgba(238, 238, 238, 1);
			border-radius: 40rpx;
			color: rgba(#fff, 0.9);
		}
	}
}
</style>
