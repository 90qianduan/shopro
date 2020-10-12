/**
 * vuex 用户相关
 * @module - 用户信息，是否登录，订单信息，消息订阅等。
 */
import api from '@/common/request/index'
import store from '@/common/store'
import router from '@/common/router.js'
import tools from '@/common/utils/tools'

import {
	USER_INFO,
	LOGIN_TIP,
	ORDER_NUMBER,
	MESSAGE_IDS,
	OUT_LOGIN,
	// #ifdef MP-WEIXIN
	FORCE_OAUTH,
	// #endif
} from '../types.js'
const state = {
	userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {}, //用户个人信息
	showLoginTip: false, //是否显示登录提示
	orderNum: {}, //用户订单数量角标
	// #ifdef MP-WEIXIN
	forceOauth: false, //微信登录提示，全屏弹窗。
	// #endif
	messageIds: {}, //小程序订阅消息模板ids

}

const actions = {
	//设置token并返回上次页面
	setTokenAndBack({
		commit
	}, token) {
		uni.setStorageSync('token', token); //token存入缓存
		store.dispatch('getUserInfo'); //请求用户信息
		let fromLogin = uni.getStorageSync('fromLogin'); //存入登录前路径。
		if (fromLogin) {
			tools.routerTo(fromLogin.path, fromLogin.query, true);
			uni.removeStorageSync('fromLogin')
		} else {
			//默认跳转首页
			router.replaceAll('/pages/index/index')
		}
	},

	// 获取用户信息
	getUserInfo({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('user.info').then(res => {
				store.dispatch('getCartList') //请求购物车数据
				commit('LOGIN_TIP', false); //隐藏登录提示
				commit('USER_INFO', res.data); //更新用户信息
				uni.setStorageSync('userInfo', res.data); //缓存用户信息
				store.dispatch('getOrderNum'); //获取用户各类订单数量信息
				//添加推广记录
				let share_id = uni.getStorageSync('share_id');
				let url = uni.getStorageSync('url');
				let shareParams = {};
				// if(share_id && res.data.id >share_id) {
				if (share_id) {
					shareParams.share_id = share_id;
					shareParams.url = url;
					api('share.add', shareParams).then(res => {
						if (res.code === 1) {
							uni.removeStorageSync('share_id');
							uni.removeStorageSync('url');
						}
					})
				}
				resolve(res)

			}).catch(e => {
				reject(e)
			})
		})
	},
	// 订单信息
	getOrderNum({
		commit
	}) {
		return new Promise((resolve, reject) => {
			api('order.statusNum').then(res => {
				commit('ORDER_NUMBER', res.data);
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
	// 获取订阅消息模板ids;
	getMessageIds({
		commit
	}, type) {
		return new Promise((resolve, reject) => {
			api('messageIds').then(res => {
				commit('MESSAGE_IDS', res.data);
				let typeName = []; //模板键
				let obj = res.data; //模板对象
				let arr = []; //模板ids
				switch (type) {
					case 'result': //支付成功后
						typeName = ['order_sended']
						break;
					case 'grouponResult': //拼团支付成功后
						typeName = ['groupon_success', 'groupon_fail', 'order_sended']
						break;
					case 'aftersale': //点击售后
						typeName = ['refund_agree', 'aftersale_change', 'wallet_change']
						break;
					case 'wallet': //提现提醒
						typeName = ['score_change', 'wallet_apply', 'wallet_change']
						break;
					case 'store': //门店新订单通知
						typeName = ['store_order_new']
						break;
					default:
						typeName = []
						break;
				}
				typeName.forEach(item => {
					obj[item] && arr.push(obj[item]) //如果后台返回的消息模板存在，则把当前预设消息类型加入数组中
				})
				uni.requestSubscribeMessage({
					tmplIds: arr,
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.log(err);
					}

				});
				resolve(res)
			}).catch(e => {
				reject(e)
			})
		})
	},
}

const mutations = {
	// 小程序订阅消息模板ids
	[MESSAGE_IDS](state, data) {
		state.messageIds = data
	},
	// 用户个人信息
	[USER_INFO](state, data) {
		state.userInfo = data
	},
	// 是否登录提示
	[LOGIN_TIP](state, data) {
		state.showLoginTip = data
	},
	// 用户订单分类数量信息
	[ORDER_NUMBER](state, data) {
		state.orderNum = data
	},
	// #ifdef MP-WEIXIN
	// 微信端是否全屏登录
	[FORCE_OAUTH](state, data) {
		state.forceOauth = data
		data ? uni.hideTabBar() : uni.showTabBar();
	},
	// #endif
	// 退出登录，清除相关用户信息。
	[OUT_LOGIN](state, data) {
		uni.removeStorageSync('token');
		uni.removeStorageSync('userInfo');
		uni.removeStorageSync('cartNum');
		store.commit('USER_INFO', {});
		store.commit('CART_LIST', []);
		store.commit('CART_NUM');
		store.commit('ORDER_NUMBER', {});
	},

}

const getters = {

}

export default {
	state,
	mutations,
	actions,
	getters
}
