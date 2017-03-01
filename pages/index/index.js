
var event = require('../../utils/event.js')
// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');
var util = require('../../utils/util.js')
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
        list:[],
        /*friends:[{
            openId:0,
                              avatarUrl:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            nickName:"memeda",
            lastMessage:"初始数据，我们把服务地址显示在页面上", //nearestMessage
            unReadMessage:["使用 Page 初始化页面，具体可参考微信公众平台上的文档",''],
            //unreadNumber:3,                               //newMessages
            lastTime:"14:00",
            messages:[]
        },{
            openId:1,
            avatarUrl:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            nickName:"heheda",
            lastMessage:"qcloud.request() 方法和 wx.request() 方法使用是一致的",
            unReadMessage:["使用 Page 初始化页面，具体可参考微信公众平台上的文档"],
            unreadNumber:0,
            lastTime:"15:00",
            messages:[]
        }],//friends 包含了 好友和群聊会话，所以拉取了好友之后需要和群会话整合
        */
        messages:[],
        friendsInfo:[],
        friendsMessasges:[],
        groupMessage:[],
        userInfo:{},
        loginUrl: config.service.loginUrl,
        requestUrl: config.service.requestUrl,
        groupList:[],
    },

    onLoad:function(options){
        var that = this
        console.log("index/onLoad  我么次都会打开")
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

        event.on('getFriendsList',this,function(list){
            var friendsInfo = that.data.friendsInfo
            console.log("FriendsList",list[i])
            var time, hour, minute
            for (var i = 0; i < list.length; i++) {
                time = list[i].nearestMessage.date
               // hour = parseInt(time%1000000/10000) 
               // minute = parseInt(time%10000/100)
                list[i].lastTime = util.getTime(time)//添加lastTime 和 messages 字段
                list[i].messages = list[i].newMessages
                list[i].type = "friend"          
                friendsInfo.push(list[i])
                console.log('list[i].messages',list[i].messages)
            }
            
            that.setData({
                friendsInfo
            })
           /* console.log("friendsInfo",friendsInfo)
            for (var i = 0; i < that.data.friendsInfo.length; i++) {
                console.log("friendsInfoOpenId",that.data.friendsInfo[i].openId)
                
            }
            */
        })

        event.on('getGroupId',this,function(group){
            /*var openId = group.groupId
            var nickName = group.groupName
            var avatarUrl = 'http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0'
            //设置群昵称和头像
            */
            console.log("。。。。。。。。。。。。。。。。",group)
            var friendsInfo = that.data.friendsInfo
            var time, hour, minute
            for (var i = 0; i < group.length; i++) {
                time = group[i].nearestMessage.date
               // hour = parseInt(time%1000000/10000) 
              //  minute = parseInt(time%10000/100)
                group[i].lastTime = util.getTime(time)
                group[i].messages = group[i].newMessages
                group[i].type = "group"
                group[i].nickName = group[i].groupName
                friendsInfo.unshift(group[i])
            }
            
           /* friendsInfo.unshift({
                'openId':openId,
                'nickName':nickName,
                'avatarUrl':avatarUrl,
            })
            */
            that.setData({
                friendsInfo
            })
            console.log("添加了群了呀大兄弟",that.data.friendsInfo)
            //需要切换成friend
        })

        event.on('getGroupNumber',this,function(groupList1){
            //获得群成员
            var groupList = that.data.groupList
            groupList.push(groupList1)
            that.setData({
                groupList
            })
        })

        event.on('addFriend',this,function(friend){
            //添加好友 确认还未处理先添加进来
            var friendsInfo = that.data.friendsInfo
            friendsInfo.unshift(friend)
            that.setData({
                friendsInfo
            })
        })

        event.on('deleteFriend',this,function(friend){
            //被删除了
            var length = that.data.friendsInfo.length
            var friendsInfo = that.data.friendsInfo
            for(var i=0;i<length;i++){
                if(friendsInfo[i].openId == friend.sourceId){
                    friendsInfo.splice(i,1)
                }
            }
            that.setData({
                friendsInfo
            })
        })

        event.on('friendMessage',this,function(friendMessage){
            //好友消息
            var friendsList = that.data.friendsInfo
            var sourceId = friendMessage.sourceId
            for(var i=0; i<friendsList.length;i++){
                    if(sourceId == friendsList[i].openId){
                        friendsList[i].newMessages.push(speak)                        
                        friendsList[i].nearestMessage = speak
                        //时间处理
                        var temp = friendsList[i]
                        friendsList.splice(i,1)
                        friendsList.unshift(temp)
                        that.setData({
                            friendsInfo:friendsList //可能需要添加
                        })
                    }
            }
        })

        event.on('groupMessage',this,function(groupMessage){
            //群消息
           var friendsList = that.data.friendsInfo
            var targetId = groupMessage.targetId
            for(var i=0; i<friendsList.length;i++){
                    if(targetId == friendsList[i].openId){
                        friendsList[i].newMessages.push(groupMessage.data)
                        //console.log('friendsList[i].newMessages',friendsList[i].newMessages)                        
                        friendsList[i].nearestMessage = groupMessage.data
                        //时间处理
                        var temp = friendsList[i]
                        friendsList.splice(i,1)
                        friendsList.unshift(temp)
                        that.setData({
                            friendsInfo:friendsList//可能需要添加
                        })
                    }
            }
            
            
        })
    
        event.on('enterGroup',this,function(openId){
            var friendsInfo = that.data.friendsInfo
            console.log("就是在这里")
            for (var i = 0; i < friendsInfo.length; i++) {
                if (friendsInfo[i].openId == openId) {
                    friendsInfo[i].newMessages = []
                    console.log("friendsInfo[i].newMessages",friendsInfo[i].newMessages)
                }
            }
            that.setData({
                friendsInfo
            })
        })

        event.on('enterPersonalChat',this,function(openId){
            var friendsInfo = that.data.friendsInfo
            console.log("就是在这里")
            for (var i = 0; i < friendsInfo.length; i++) {
                if (friendsInfo[i].openId == openId) {
                    friendsInfo[i].newMessages = []
                    console.log("friendsInfo[i].newMessages",friendsInfo[i].newMessages)
                }
            }
            that.setData({
                friendsInfo
            })
        })

        if (this.data.friendsInfo.length == 0 && appInstance.globalData.groupsInfo.length != 0) {
            var friendsInfo = this.data.friendsInfo
            var group = appInstance.globalData.groupsInfo
            var time, hour, minute
            for (var i = 0; i < group.length; i++) {
                time = group[i].nearestMessage.date
                hour = parseInt(time%1000000/10000) 
                minute = parseInt(time%10000/100)
                group[i].lastTime = hour+":"+minute
                group[i].messages = group[i].newMessages
                group[i].type = "group"
                group[i].nickName = group[i].groupName
                friendsInfo.unshift(group[i])
            }
            that.setData({
                friendsInfo
            })
        }

        if (this.data.friendsInfo.length == 0 && appInstance.globalData.friends.length != 0) {
            var friendsInfo = that.data.friendsInfo
            var list = appInstance.globalData.friends
            var time, hour, minute
            for (var i = 0; i < list.length; i++) {
                time = list[i].nearestMessage.date
                hour = parseInt(time%1000000/10000) 
                minute = parseInt(time%10000/100)
                list[i].lastTime = hour+":"+minute //添加lastTime 和 messages 字段
                list[i].messages = list[i].newMessages
                list[i].type = "friend"          
                friendsInfo.push(list[i])
                console.log('list[i].messages',list[i].messages)
            }
            
            that.setData({
                friendsInfo
            })
        }

        if (this.data.groupList.length == 0 && appInstance.globalData.groupMember.length != 0) {
            var groupList = this.data.groupList
            groupList.push(groupList1)
            that.setData({
                groupList
            })
        }

    },
    onUnload:function(){
        event.remove('getFriendsList',this);
        event.remove('getGroupId',this);
        event.remove('getGroupNumber',this);
        event.remove('addFriend',this);
        event.remove('deleteFriend',this);
        event.remove('friendMessage',this);
        event.remove('groupMessage',this);
        event.remove('enterGroup',this);
        event.remove('enterPersonalChat',this);
    },

    /*listenTunnel() {
        var that = this
        var tunnel = this.tunnel = appInstance.globalData.tunnel
        console.log('tunnel',tunnel)
        tunnel.on('delete',delete1 =>{
            console.log(delete1)
        })

        tunnel.on('add',add =>{
            console.log(add)
        })

        tunnel.on('online',online =>{
            console.log('page/index/online',online)
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
                for(var i=0; i<friendsList.length;i++){
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
                for(var i=0; i<friendsList.length;i++){
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
        });  

        // 打开信道
    },*/


    /**
     * 点击「聊天室」按钮，跳转到聊天室综合 Demo 的页面
     */
    openChat(args) {
        var openId = args.currentTarget.dataset.openId
        var type = args.currentTarget.dataset.type
        console.log("openIdOpenChat",openId)
        console.log("util.formatTime",Date.now())
        if (type == "group") {
            var url = '../chat/chat?openId='+openId
             wx.navigateTo({
                url: url,
                success: function(res){

                }
            })
             event.emit('enterGroup',openId)
        }
        else if (type == "friend") {
            var url = '../personalChat/personalChat?openId='+openId
            wx.navigateTo({
                url: url,
                success: function(res){
                    event.emit('enterPersonalChat',openId)
                }
            })
        }
        /*var nickName = args.currentTarget.dataset.nickName
        var id = args.currentTarget.dataset.id
        var avatarUrl = args.currentTarget.dataset.avatarUrl
        var isFriend = true
        var url = "../personalChat/personalChat?nickName="+nickName+"&id="+id+"&avatarUrl="+avatarUrl+"&isFriend="+isFriend
        wx.navigateTo({ url: url});
        */
    },

    openGoupChat(args){

        wx.navigateTo({
          url: '../chat/chat',
          success: function(res){
              appInstance.globalData.enterGroupId = args.openId //传入ID
          }
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
