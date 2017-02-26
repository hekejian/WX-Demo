/**
 * @fileOverview 微信小程序的入口文件
 */
var event = require('./utils/event.js')
var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
});

var showModel = (title, content) => {
    wx.hideToast();
    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};


var user = {};
App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        console.log("onLaunch")
        if(this.globalData.userInfo == null){
            this.login()
        }

        if(this.globalData.userData == null){
            this.getUser()
        }
    },

    login:function(){
        qcloud.setLoginUrl(config.service.loginUrl);
        var that = this;
        qcloud.login({
            success(result) {
                showSuccess('登录成功');
                console.log('login', result);
                that.globalData.userInfo = result;
            },
            fail(error) {
                showModel('登录失败', error);
            },
        });
    },

     getUser:function(){
        var that = this
         qcloud.request({
            url: `https://${config.service.host}/user`,
            login: true,
            success: (response) => {
                console.log('getUser',response)
                that.globalData.userData = response.data.data.userInfo
                that.globalData.myId = response.data.data.userInfo.openId
                if(that.globalData.tunnel == null){
                  this.openTunel()
                }
                that.requestFriends()
                that.getGroupId()
            }
        });
    },

    requestFriends:function(){
        var that = this
        var url = `https://${config.service.host}/friend/list/`+this.globalData.myId
        qcloud.request({
            url:url,
            login: true,
            success: (response) => {
                    that.globalData.friends = response.data.list;
                    event.emit('getFriendsList',response.data.list)
                }
        })
    },

    getGroupId: function(){
        var that = this
        var url = `https://${config.service.host}/group/all/`+this.globalData.myId
        qcloud.request({
             url:url,
             success: (response) => {
                var data = response.data.data.list[0]
                console.log('getGroupId',data)
                that.globalData.groupsInfo.push(data)
                event.emit('getGroupId',data)
                that.getGroupNumber(data.groupId)
                },

            fail:(error)=> {
                console.log(error)    
            }
        })
    },

    getGroupNumber:function(groupId){
        var that = this
        var url = `https://${config.service.host}/group/member/`+ groupId
        qcloud.request({
             url:url,
             success: (response) => {
                var groupList = response.data.list
                that.globalData.groupMember.push(groupList)
                console.log('getGroupNumber',groupList)
                event.emit('getGroupNumber',groupList)
                },

            fail:(error)=> {
                console.log(error)    
            }
        })
    },
    openTunel:function(){
        var that = this;
        var tunnel= new qcloud.Tunnel(config.service.tunnelUrl);

        tunnel.open();
        that.globalData.tunnel = tunnel
        
        tunnel.on('online',online => {
            if(online.targetType == "friend" && online.targetId == that.globalData.myId){
                event.emit('openTunel',tunnel)
            }
            else if(online.targetType == "group"){
                event.emit('groupNumberOnline',online)
            }
            

        })

        tunnel.on('offline',offline => {
            if(offline.targetType == "group"){
                 event.emit('groupNumberOffline',offline.data)
            }
           
            
        })

        tunnel.on('add',add => {
            if(add.targetType == "friend" && add.targetId == that.globalData.myId){
                 event.emit('addFriend',add.data)
            }else if(add.targetType == "group"){
                 event.emit('addGroup',add)
            }
        })
        
        tunnel.on('delete',delete1 => {
             if(delete1.targetType == "friend" && delete1.targetId == that.globalData.myId){
                 event.emit('deleteFriend',delete1.data)
            }else if(add.targetType == "group"){
                 event.emit('deleteGroupNumber',delete1)
            }
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            if(speak.targetType == "friend" && speak.targetId == that.globalData.myId){
                that.globalData.friendsMessages.push(speak.data)
                event.emit('friendMessage',speak.data)
            }
            else if(speak.targetType == "group" && speak.targetId == that.globalData.myId){
                that.globalData.groupMessage.push(speak)
                event.emit('groupMessage',speak)
            }
            that.globalData.messages.push(speak)
           
            console.log('APP init收到说话消息：', speak);
        });

        // 打开信道
    },

    getUserInfo:function(arg){
        var that = this;
        if(this.globalData.userInfo){
            typeof arg=="function" && arg(this.globalData.userInfo)
        }else{
            qcloud.login({
                success(result) {
                    showSuccess('登录成功');
                    console.log('登录成功', result);
                    
                    that.globalData.userInfo = result;
                    if(that.globalData.userData == null)
                        that.getUser()

                    typeof arg=="function" && arg(that.globalData.userInfo)
            },
            fail(error) {
                showModel('登录失败', error);
                console.log('登录失败', error);
            },
        });
        }
    },
    
    globalData:{
        userInfo:null,
        myId:null,
        friendsMessages:[],
        groupMessage:[],
        friends:[],
        tunnel:null,
        userData:null,
        groupsInfo:[], //groupId groupName groupSign
        groupStory:null, //还未获得
        groupMember:[],
       //inGroup:false
    }
});