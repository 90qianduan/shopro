<template>
	<view class="page_box">
		<view class="content_box pad">
			<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
				<u-form-item required prop="type" :borderBottom="false" :label-position="'top'" :label="'请选择类型'" :labelStyle="labelStyle" label-width="150">
					<u-radio-group v-model="model.type" :active-color="'#ECBE60'" :wrap="true">
						<view class="x-f" :style="{ height: '80rpx', width: '100%' }" v-for="(item, index) in typeList" :key="index">
							<u-radio labelSize="28rpx" shape="circle" :name="item.name">{{ item.name }}</u-radio>
						</view>
					</u-radio-group>
				</u-form-item>

				<view class="form-item">
					<label>
						<view class="inp-title">相关描述</view>
						<view class="area-box">
							<u-form-item required prop="content" :borderBottom="false">
								<u-input
									type="textarea"
									:placeholderStyle="placeholderStyle"
									placeholder="客官~您对我们的服务还满意吗，请给予我们你的意见我 们将做的更好~"
									v-model="model.content"
								/>
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
					</label>
				</view>
				<u-form-item required :borderBottom="false" :labelStyle="labelStyle" label-position="top" label="联系方式" prop="phone" label-width="150">
					<view :style="{ width: '100%', background: 'rgba(249, 250, 251, 1)', 'border-radius': '20rpx', paddingLeft: '20rpx' }">
						<u-input :placeholderStyle="placeholderStyle" placeholder="请输入您的联系电话" v-model="model.phone" type="number"></u-input>
					</view>
				</u-form-item>
			</u-form>
		</view>
		<view class="foot_box x-bc pad">
			<button class="cu-btn post-btn" @tap="addFeedback">提交</button>
			<button class="cu-btn contact-btn" v-if="addons.includes('kefu')" @tap="onService">联系客服</button>
		</view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			addons: uni.getStorageSync('addons'),
			typeList: [],

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
						message: '请选择任意种反馈类型',
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
		this.getFeedbackType();
	},
	methods: {
		// 跳转客服
		onService() {
			this.$Router.push('/pages/public/kefu/index');
		},

		// 获取意见分类
		getFeedbackType() {
			let that = this;
			that.$api('feedback.type').then(res => {
				if (res.code === 1) {
					that.typeList = res.data;
				}
			});
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

		// 提交反馈
		addFeedback() {
			let that = this;
			this.$refs.uForm.validate(valid => {
				if (valid) {
					that.$api('feedback.add', that.model).then(res => {
						if (res.code === 1) {
							that.$tools.toast('提交成功');
							setTimeout(() => {
								that.$Router.back();
							}, 300);
						}
					});
				} else {
					console.log('验证失败');
				}
			});
		}
	}
};
</script>

<style lang="scss">
.page_box {
	background: #fff;
}
.form-item {
	margin-top: 30rpx;
	.inp-title {
		font-size: 30rpx;
		font-family: PingFang SC;
		font-weight: bold;
		color: rgba(51, 51, 51, 1);
		align-items: center;
		margin-bottom: 30rpx;
	}
}
.area-box {
	width: 690rpx;
	min-height: 306rpx;
	background: rgba(249, 250, 251, 1);
	border-radius: 20rpx;
	padding: 28rpx;

	.img-box {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 20rpx;
		.choose-img {
			width: 130rpx;
			height: 130rpx;
			background: rgba(249, 250, 251, 1);
			border: 1rpx solid rgba(223, 223, 223, 1);
			margin-right: 25rpx;
			margin-bottom: 25rpx;
			position: relative;
			.cuIcon-cameraadd {
				font-size: 50rpx;
				color: #dfdfdf;
			}
		}
	}
}
.foot_box {
	border-top: 1rpx solid #eeeeee;
	height: 100rpx;
	.contact-btn {
		flex: 1;
		height: 70rpx;
		background: linear-gradient(90deg, rgba(103, 104, 105, 1), rgba(82, 82, 82, 1));
		box-shadow: 0px 2rpx 5rpx 0px rgba(102, 103, 104, 0.46);
		border-radius: 35rpx;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(255, 255, 255, 1);
	}
	.post-btn {
		flex: 1;
		height: 74rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		box-shadow: 0px 7rpx 6rpx 0rpx rgba(229, 138, 0, 0.22);
		border-radius: 37rpx;
		font-size: 28rpx;
		font-family: PingFang SC;
		font-weight: 500;
		color: rgba(255, 255, 255, 1);
	}
}
</style>
