

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');



// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};       

/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
var appInstance = getApp();

Page({

    /**
     * 初始数据，我们把服务地址显示在页面上
     */
    data: {
        friends:[{
            friendInfo:appInstance.globalData.userInfo,
            lastMessage:"初始数据，我们把服务地址显示在页面上",
            unReadMessage:"使用 Page 初始化页面，具体可参考微信公众平台上的文档",
            unreadNumber:3,
            lastTime:"14:00",
        },{
            friendInfo:appInstance.globalData.userInfo,
            lastMessage:"qcloud.request() 方法和 wx.request() 方法使用是一致的",
            unReadMessage:"使用 Page 初始化页面，具体可参考微信公众平台上的文档",
            unreadNumber:2,
            lastTime:"15:00",
        }],

        loginUrl: config.service.loginUrl,
        requestUrl: config.service.requestUrl,
        tunnelUrl: config.service.tunnelUrl,
        tunnelStatus: 'closed',
        tunnelStatusText: {
            closed: '已关闭',
            connecting: '正在连接...',
            connected: '已连接'
        }
    },

    onLoad:function(options){
        var that = this
        appInstance.getUserInfo(function(userInfo){
                that.setData({
                    userInfo:userInfo
                })
            })
    },

    doRequest() {
        showBusy('正在请求');

        // qcloud.request() 方法和 wx.request() 方法使用是一致的，不过如果用户已经登录的情况下，会把用户的会话信息带给服务器，服务器可以跟踪用户
        qcloud.request({
            // 要请求的地址
            url: this.data.requestUrl,

            // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
            login: true,

            success(result) {
                showSuccess('请求成功完成');
                console.log('request success', result);
            },

            fail(error) {
                showModel('请求失败', error);
                console.log('request fail', error);
            },

            complete() {
                console.log('request complete');
            }
        });
    },

    openTunnel() {
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(this.data.tunnelUrl);

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            console.log('WebSocket 信道已连接');
            this.setData({ tunnelStatus: 'connected' });
        });

        tunnel.on('close', () => {
            console.log('WebSocket 信道已断开');
            this.setData({ tunnelStatus: 'closed' });
        });

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            showBusy('正在重连');
        });

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            showSuccess('重连成功');
        });

        tunnel.on('error', error => {
            showModel('信道发生错误', error);
            console.error('信道发生错误：', error);
        });

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            showModel('信道消息', speak);
            console.log('收到说话消息：', speak);
        });

        // 打开信道
        tunnel.open();

        this.setData({ tunnelStatus: 'connecting' });
    },


    /**
     * 点击「聊天室」按钮，跳转到聊天室综合 Demo 的页面
     */
    openChat() {
        // 微信只允许一个信道再运行，聊天室使用信道前，我们先把当前的关闭
        wx.navigateTo({ url: '../chat/chat' });
        console.log(appInstance.globalData.userInfo)
        console.log(this.data.friends[0].lastTime)
    },

});
