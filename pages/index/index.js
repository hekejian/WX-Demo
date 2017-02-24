

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
            unReadMessage:["使用 Page 初始化页面，具体可参考微信公众平台上的文档"],
            unreadNumber:3,
            lastTime:"14:00",
        },{
            id:1,
            avatarUrl:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            nickName:"heheda",
            lastMessage:"qcloud.request() 方法和 wx.request() 方法使用是一致的",
            unReadMessage:["使用 Page 初始化页面，具体可参考微信公众平台上的文档"],
            unreadNumber:0,
            lastTime:"15:00",
        }],//friends 包含了 好友和群聊会话，所以拉取了好友之后需要和群会话整合

        messasges:[],
        userInfo:{},
        loginUrl: config.service.loginUrl,
        requestUrl: config.service.requestUrl,
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
        this.listenTunnel();
    },


    listenTunnel() {
        var that = this
        var tunnel = this.tunnel = appInstance.globalData.tunnel
        
        tunnel.on('delete',delete1 =>{
            console.log(delete1)
        })

        tunnel.on('add',add =>{
            console.log(add)
        })

        tunnel.on('online',online =>{
            console.log(online)
        })
        
        tunnel.on('offline',offline =>{
            console.log(offline)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            var targetId = speak.targetId
            var sourceId = speak.data.sourceId
            if(speak.targetType == "friend"){
                var friendsList = that.data.friends
                for(var i=0; index<friendsList.length;i++){
                    if(sourceId == friendsList[i].id){
                        that.data.friends[i].unReadMessage.push(speak.data)                        
                        that.data.friends[i].lastMessage = speak.data.content
                        //时间处理
                        var temp = that.data.friends[i]
                        that.data.friends.splice(i,1)
                        that.data.friends.unshift(temp)
                        that.setData({
                            friends //可能需要添加
                        })
                    }
                }
            }
            else if(speak.targetType =="group"){
                var friendsList = that.data.friends
                for(var i=0; index<friendsList.length;i++){
                    if(targetId == friendsList[i].id){
                        that.data.friends[i].unReadMessage.push(speak.data)                        
                        that.data.friends[i].lastMessage = speak.data.content
                        //时间处理
                        var temp = that.data.friends[i]
                        that.data.friends.splice(i,1)
                        that.data.friends.unshift(temp)
                        that.setData({
                            friends //可能需要添加
                        })
                    }
                }
            }
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
