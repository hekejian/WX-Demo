
// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
    if (!msgUuid.next) {
        msgUuid.next = 0;
    }
    return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
    return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
    return { id: msgUuid(), type: 'speak', content, user, isMe };
}

var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};

var appInstance = getApp()
// 声明聊天室页面
Page({

    /**
     * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
     */
    data: {
        roomid:0,
        messages: [],
        inputContent: '大家好啊',
        lastMessageId: 'none',
        scrollTop:99999,
        title:"520520",
        list:[{
            id:1,
            nickName:"wagada1",
            url:"../materials/Image.jpg"
        },{
            id:2,
            nickName:"wagada2",
            url:"../materials/Image.jpg"
        },{
            id:3,
            nickName:"wagada3",
            url:"../materials/Image.jpg"
        },{
            id:4,
            nickName:"wagada3",
            url:"../materials/Image.jpg"
        },{
            id:5,
            nickName:"wagada3",
            url:"../materials/Image.jpg"
        },{
            id:6,
            nickName:"wagada3",
            url:"../materials/Image.jpg"
        }],
        show:false,
    },
   
    onLoad(options){
        this.tunnel = appInstance.globalData.tunnel
        console.log(options)
        this.me = appInstance.globalData.userData
        //this.requsetFriends("")
    },

    //拉取群数据
    requsetFriends(url) {
            var that = this
        // qcloud.request() 方法和 wx.request() 方法使用是一致的，不过如果用户已经登录的情况下，会把用户的会话信息带给服务器，服务器可以跟踪用户
            qcloud.request({
            // 要请求的地址
            url: url,
            // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
            login: true,
            success(result) {
                console.log('request success', result);
                //appInstance.global.friends = result;
                that.setData({
                    list:result
                })
            },
            fail(error) {
                //showModel('加入讨论失败', error);
                console.log('request fail', error);
            },
        });
    },
    /**
     * 页面渲染完成后，启动聊天室
     * */
    onReady() {
        wx.setNavigationBarTitle({ title: this.data.title });

        if (!this.pageReady) {
            this.pageReady = true;
            this.enter();
        }
    },

    /**
     * 后续后台切换回前台的时候，也要重新启动聊天室
     */
    onShow() {
        if (this.pageReady) {
            this.enter();
        }
    },

    /**
     * 启动聊天室
     */
    enter() {
        this.pushMessage(createSystemMessage('正在加入群聊...'));
        this.connect();
    },

    /**
     * 连接到聊天室信道服务
     */
    connect() {
        var tunnel = this.tunnel;
        // 创建信道
       // var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl);

        // 连接成功后，去掉「正在加入群聊」的系统提示
        tunnel.on('add', () => {
            console.log('WebSocket 信道已连接 wocaonima zhognyushoudaole ');
            this.popMessage()
        });
        tunnel.on('connect', () =>{
            console.log("caonima")
            this.popMessage()
        } );

        // 聊天室有人加入或退出，反馈到 UI 上
        tunnel.on('people', people => {
            const { total, enter, leave } = people;
            if (enter) {
                this.pushMessage(createSystemMessage(`${enter.nickName}已加入群聊，当前共 ${total} 人`));
            } else {
                this.pushMessage(createSystemMessage(`${leave.nickName}已退出群聊，当前共 ${total} 人`));
            }
        });

        // 有人说话，创建一条消息
        tunnel.on('speak', speak => {
            const { word, who } = speak;
            console.log(appInstance.globalData.userData)
            this.pushMessage(createUserMessage(word, who, who.openId === appInstance.globalData.userData.openId));
        });

        // 信道关闭后，显示退出群聊
        tunnel.on('close', () => {
            this.pushMessage(createSystemMessage('您已退出群聊'));
        });

        // 重连提醒
        tunnel.on('reconnecting', () => {
            this.pushMessage(createSystemMessage('已断线，正在重连...'));
        });

        tunnel.on('reconnect', () => {
            this.amendMessage(createSystemMessage('重连成功'));
        });
        // 打开信道
    },

    /**
     * 退出聊天室
     */

    /**
     * 通用更新当前消息集合的方法
     */
    updateMessages(updater) {
        var messages = this.data.messages;
        updater(messages);

        this.setData({ messages });

        // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
        var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
        this.setData({ lastMessageId });
    },

    /**
     * 追加一条消息
     */
    pushMessage(message) {
        this.updateMessages(messages => messages.push(message));
    },

    /**
     * 替换上一条消息
     */
    amendMessage(message) {
        this.updateMessages(messages => messages.splice(-1, 1, message));
    },

    /**
     * 删除上一条消息
     */
    popMessage() {
        this.updateMessages(messages => messages.pop());
    },

    /**
     * 用户输入的内容改变之后
     */
    changeInputContent(e) {
        this.setData({ inputContent: e.detail.value });
    },

    /**
     * 点击「发送」按钮，通过信道推送消息到服务器
     **/
    sendMessage(e) {
        // 信道当前不可用
        if (!this.tunnel || !this.tunnel.isActive()) {
            this.pushMessage(createSystemMessage('您还没有加入群聊，请稍后重试'));
            if (this.tunnel.isClosed()) {
                this.enter();
            }
            return;
        }

        setTimeout(() => {
            if (this.data.inputContent && this.tunnel) {
                this.tunnel.emit('speak', { word: this.data.inputContent });
                this.setData({ inputContent: '' });
            }
        });
    },

    kindToggle: function () {
       var show = !this.data.show
       console.log(show)
       this.setData({
           show:show
       })
  },
    
    chatPerson:function(e){
        console.log(e)
        var nickName = e.currentTarget.dataset.nickName
        var id = e.currentTarget.dataset.id
        var avatarUrl = e.currentTarget.dataset.avatarUrl
        var isFriend = false
        var url = "../personalChat/personalChat?nickName="+nickName+"&id="+id+"&avatarUrl="+avatarUrl+"&isFriend="+isFriend
        wx.navigateTo({ url: url});
    },

    chatPerson1: function(e){
        console.log(e)
    }

    
});
