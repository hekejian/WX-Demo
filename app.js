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
        tunnel.on('connect', () =>{
            console.log('connect success')
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
                    typeof arg=="function" && arg(this.globalData.userInfo)
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
        userInfo:null
    }
});