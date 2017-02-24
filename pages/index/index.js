

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
            id:0,
                              avatarUrl:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            nickName:"memeda",
            lastMessage:"初始数据，我们把服务地址显示在页面上",
            unReadMessage:"使用 Page 初始化页面，具体可参考微信公众平台上的文档",
            unreadNumber:3,
            lastTime:"14:00",
        },{
            id:1,
            avatarUrl:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            nickName:"heheda",
            lastMessage:"qcloud.request() 方法和 wx.request() 方法使用是一致的",
            unReadMessage:"使用 Page 初始化页面，具体可参考微信公众平台上的文档",
            unreadNumber:0,
            lastTime:"15:00",
        }],

        messasges:[],
        userInfo:{},
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
        if(appInstance.globalData.userInfo == null){
            appInstance.getUserInfo(function(userInfo){
                that.setData({
                    userInfo:userInfo
                })
            })
        }else{
            that.setData({
                    userInfo:appInstance.globalData.userInfo
                })
        }
        this.openTunnel();
    },

    requsetFriends(url) {
            var that = this
        // qcloud.request() 方法和 wx.request() 方法使用是一致的，不过如果用户已经登录的情况下，会把用户的会话信息带给服务器，服务器可以跟踪用户
            qcloud.request({
            // 要请求的地址
            url: url,

            // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
            login: true,

            success(result) {
                showSuccess('请求成功完成');
                console.log('request success', result);
                //appInstance.global.friends = result;
                that.setData({
                    friends:result
                })
            },
            fail(error) {
                showModel('请求失败', error);
                console.log('request fail', error);
            },

        });
    },

    openTunnel() {
        // 创建信道，需要给定后台服务地址
       // var tunnel = this.tunnel = new qcloud.Tunnel(this.data.tunnelUrl);
        var that = this
        var tunnel = this.tunnel = appInstance.globalData.tunnel
        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
       /* tunnel.on('connect', () => {
            console.log('WebSocket 信道已连接');
        });
        
        
        tunnel.on('close', () => {
            console.log('WebSocket 信道已断开');
        });

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            showBusy('正在重连');
        });

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            showSuccess('重连成功');
            console.log("wocao laozi yeneng chonglian")
        });

        tunnel.on('error', error => {
            showModel('信道发生错误', error);
            console.error('信道发生错误：', error);
        });
        */
        tunnel.on('add',add =>{
            console.log(add)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            console.log("speak")
            console.log(speak)
            that.data.messasges.push(speak)
            this.setData({
                messasges
            })
        });

        // 打开信道
    },


    /**
     * 点击「聊天室」按钮，跳转到聊天室综合 Demo 的页面
     */
    openChat(args) {
        var nickName = args.currentTarget.dataset.nickName
        var id = args.currentTarget.dataset.id
        var avatarUrl = args.currentTarget.dataset.avatarUrl
        var isFriend = true
        var url = "../personalChat/personalChat?nickName="+nickName+"&id="+id+"&avatarUrl="+avatarUrl+"&isFriend="+isFriend
        wx.navigateTo({ url: url});
    },

    openGoupChat(args){
        wx.navigateTo({
          url: '../chat/chat',
        })
    },

    note(args){
        wx.navigateTo({
          url: '../notes/notes',
          success: function(res){
            // success
          },
        })
    }
});
