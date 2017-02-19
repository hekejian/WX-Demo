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
function createSystemMessage(content) {
    return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
    return { id: msgUuid(), type: 'speak', content, user, isMe };
}

var user = {};
App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        qcloud.setLoginUrl(config.service.loginUrl);
        var that = this;
        qcloud.login({
            success(result) {
                showSuccess('登录成功');
                console.log('登录成功', result);
                that.globalData.userInfo = result;
            },
            fail(error) {
                showModel('登录失败', error);
                console.log('登录失败', error);
            },
            complete(){
               
            }
        });

        if(this.globalData.tunnel == null){
            this.openTunel();
        }
        this.getUser()
    },

    openTunel:function(){
        var that = this;
        var tunnel= new qcloud.Tunnel(config.service.tunnelUrl);
        tunnel.on('connect', () => {
            console.log('WebSocket 信道已连接');
             console.log("caonima")
            that.globalData.tunnelStatus = 'connected'
        });

        tunnel.on('close', () => {
            console.log('WebSocket 信道已断开');
            that.globalData.tunnelStatus = 'closed'
            tunnel.open();
        });

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            showBusy('正在重连');
        });

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            showSuccess('重连成功');
            that.globalData.tunnelStatus = 'connected'
        });

        tunnel.on('error', error => {
            showModel('信道发生错误', error);
            console.error('信道发生错误：', error);
        });

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            //const { word, who } = speak;
            that.globalData.messages.push(speak)
            console.log('APP init收到说话消息：', speak);
        });

        // 打开信道
        tunnel.open();
        that.globalData.tunnel = tunnel
    },

    getUser:function(){
        var that = this
         qcloud.request({
            url: `https://${config.service.host}/user`,
            login: true,
            success: (response) => {
                console.log("卧槽你这是shenm 数据啊"+response)
                console.log(response)
                that.globalData.userData = response.data.data.userInfo
                }
            });
    },


    getUserInfo:function(arg){
        var that = this;
        if(this.globalData.userInfo){
            console.log("我已经有数据了")
            typeof arg=="function" && arg(this.globalData.userInfo)
        }else{
            console.log("我还没有数据")
            qcloud.login({
                success(result) {
                    showSuccess('登录成功');
                    console.log('登录成功', result);
                    that.globalData.userInfo = result;
                    typeof arg=="function" && arg(that.globalData.userInfo)
            },
            fail(error) {
                showModel('登录失败', error);
                console.log('登录失败', error);
            },
            complete(){
               
            }
        });
        }
    },
    globalData:{
        messages:[],
        userInfo:null,
        friends:{},
        tunnelStatus: 'closed',
        tunnel:null,
        userData:null
    }
});