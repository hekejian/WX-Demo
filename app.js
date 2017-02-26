/**
 * @fileOverview 微信小程序的入口文件
 */
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

/**
 * 生成聊天室的聊天消息
 */

var user = {};
App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        console.log("onLaunch")
        if(this.globalData.userInfo == null){
            console.log("wozaihoumian")
            this.login()
        }

        if(this.globalData.userData == null)
            this.getUser()

        

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

    requestFriends:function(){
        var that = this
        qcloud.request({
            url:"",
            login: true,
            success: (response) => {
                    this.me = response.data.data.userInfo;
                    this.connect();
                }
        })
    },

    openTunel:function(){
        var that = this;
        var tunnel= new qcloud.Tunnel(config.service.tunnelUrl);

        tunnel.open();
        that.globalData.tunnel = tunnel
        console.log("tunnel 已经打开了")  
        
        tunnel.on('online',online => {
            console.log('online',online)
            that.globalData.tunnelStatus = 'connected'
        })

        tunnel.on('offline',offline => {
            console.log('offline')
            console.log(offline)
            tunnel.open();
        })

        tunnel.on('add',add => {
            console.log('add')
            console.log(add)
        })
        
        tunnel.on('delete',delete1 => {
            console.log('delete1')
            console.log(delete1)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            //const { word, who } = speak;
            that.globalData.messages.push(speak)
           
            console.log(speak)
            console.log('APP init收到说话消息：', speak);
        });

        // 打开信道
    },


    getGroupId: function(){
        var that = this
        var url = `https://${config.service.host}/group/all/`+this.globalData.myId
        qcloud.request({
             url:url,
             success: (response) => {
                var data = response.data.data.list[0]
                console.log('getGroupId',data)
                that.globalData.groupInfo = data
                },
            fail:(error)=> {
                console.log(error)    
            }
        })
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
                that.getGroupId()
            }
        });
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
        myId:null,
        friendsMessages:[],
        userInfo:null,
        friends:{},
        tunnelStatus: 'closed',
        tunnel:null,
        userData:null,
        groupInfo:null,
        groupStory:null,
        groupMember:null,
        groupMessage:[],
        inGroup:false
    }
});