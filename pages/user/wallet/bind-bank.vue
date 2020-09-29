<template>
	<view class="bank-wrap">
		<view class="form-box">
			<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
				<u-form-item required :labelStyle="labelStyle" label-width="150" label-position="left" label="持卡人" prop="real_name">
					<u-input placeholder="请输入持卡人姓名" v-model="model.real_name" type="text"></u-input>
				</u-form-item>

				<u-form-item required :labelStyle="labelStyle" label-width="150" label-position="left" label="银行卡号" prop="card_no">
					<u-input placeholder="请输入银行卡号" v-model="model.card_no" type="number"></u-input>
				</u-form-item>
				<u-form-item required :labelStyle="labelStyle" label-width="150" label-position="left" label="开户行" prop="bank_name">
					<u-input placeholder="请输入开户行" v-model="model.bank_name" type="text"></u-input>
				</u-form-item>
			</u-form>
		</view>

		<view class="notice flex align-center">请填写持卡人本人的银行卡信息</view>
		<view class="btn-box flex align-center justify-center"><button class="cu-btn confirem-btn" @tap="editBankInfo">确定</button></view>
	</view>
</template>

<script>
export default {
	components: {},
	data() {
		return {
			// 表单
			model: {
				real_name: '',
				card_no: '',
				bank_name: ''
			},
			// 表单
			errorType: ['message'],
			labelStyle: {
				'font-size': '30rpx',
				'font-weight': 'bold',
				color: 'rgba(51, 51, 51, 1)'
			},
			placeholderStyle: 'font-size: 26rpx;color: rgba(177, 179, 199, 1);',
			rules: {
				real_name: [
					{
						required: true,
						message: '请输入持卡人姓名',
						trigger: ['change', 'blur']
					}
				],
				card_no: [
					{
						required: true,
						message: '请输入银行卡号',
						trigger: ['change', 'blur']
					}
				],
				bank_name: [
					{
						required: true,
						message: '请输入开户行',
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
		this.getBankInfo();
	},

	methods: {
		//获取银行卡信息
		getBankInfo() {
			let that = this;
			that.$api('user_bank.info').then(res => {
				if (res.code === 1) {
					if (res.data) {
						that.model = res.data;
					}
				}
			});
		},
		//修改银行卡信息
		editBankInfo() {
			let that = this;
			this.$refs.uForm.validate(valid => {
				if (valid) {
					that.$api('user_bank.edit', that.model).then(res => {
						if (res.code === 1) {
							that.$tools.toast('保存成功');
							setTimeout(() => {
								that.$Router.back();
								// #ifdef H5
								window.history.back(-1);
								// #endif
							}, 1000);
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
.form-box {
	background: #fff;
	padding: 30rpx;
	.form-item {
		height: 96rpx;
		border-bottom: 1rpx solid rgba(#dfdfdf, 0.9);
		padding: 0 25rpx;
		.item-title {
			color: #333;
			font-size: 28rpx;
			font-weight: 600;
		}
		.item-input {
			font-size: 28rpx;
			color: #333;
			padding-left: 20rpx;
		}
		.pl-input {
			color: #999;
		}
	}
}
.notice {
	color: #999;
	font-size: 24rpx;
	padding: 0 25rpx;
	height: 90rpx;
}
.btn-box {
	.confirem-btn {
		width: 710rpx;
		height: 80rpx;
		background: linear-gradient(90deg, rgba(233, 180, 97, 1), rgba(238, 204, 137, 1));
		border: 1rpx solid rgba(238, 238, 238, 1);
		border-radius: 40rpx;
		font-size: 30rpx;
		color: rgba(#fff, 0.9);
	}
}
</style>
