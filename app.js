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
        var that;
        qcloud.login({
             that = this,
            success(result) {
                showSuccess('登录成功');
                console.log('登录成功', result);
                user = result;
                 console.log(user.nickName+"出来了");
                 console.log(that.globalData.userNickName+"dayin1")
            },
            fail(error) {
                showModel('登录失败', error);
                console.log('登录失败', error);
            },
            complete(){
               
            }
        });
        console.log(that.globalData.userNickName+"dayin1")
        console.log(that.globalData.userAvatarUrl + "dayin2")
        var tunnel= new qcloud.Tunnel(config.service.tunnelUrl);
        tunnel.on('connect', () =>{
            console.log('connect success')
        });
        

    },

    globalData:{
        userInfo:{},
        userAvatarUrl:"../materials/Image.jpg",
        userNickName:"wagada",
        province:"GuangDong",
        userCity:"ShenZhen",
        gender:1,
        country:"CN",
        language:"zh_cn"

    }
});