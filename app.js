/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

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
        var tunnel= new qcloud.Tunnel(config.service.tunnelUrl);
        tunnel.on('connect', () => {
            console.log('WebSocket 信道已连接');
            that.globalData.tunnelStatus = 'connected'
        });

        tunnel.on('close', () => {
            console.log('WebSocket 信道已断开');
            that.globalData.tunnelStatus = 'closed'
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
        that.globalData.tunnel = tunnel
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
        userInfo:null,
        friends:{},
        tunnelStatus: 'closed',
        tunnel:null
    }
});