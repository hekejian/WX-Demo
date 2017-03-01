
// 引入 QCloud 小程序增强 SDK
var event = require('../../utils/event.js')
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');
var util = require('../../utils/util.js')
/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
    if (!msgUuid.next) {
        msgUuid.next = 0;
    }
    return 'msg-' + (++msgUuid.next);
}
function createSystemMessage(content) {
    return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
    return { id: msgUuid(), type: 'speak', content, user, isMe };
}

var hasDelete = false
var appInstance = getApp();
Page({
    data:{
         messages: [],
         friendInfo:{},
         lastMessageId:'none',
         inputContent: '大家好啊',
    },

    onLoad(options){
        console.log(options)
        var that = this
        var openId = options.openId
        var friends = appInstance.globalData.friends
        var friendInfo
        for (var i = 0; i < friends.length; i++) {
            if (friends[i].openId == openId) {
                friendInfo = friends[i]
                that.setData({
                    friendInfo
                })
            }
        }
        
        this.tunnel = appInstance.globalData.tunnel
        this.me = appInstance.globalData.userData

        event.on('openTunel',this,function(tunnel){
           this.tunnel = tunnel
        })

        event.on('addFriend',this,function(add){
           //添加好友可能需要 当聊天对方向你添加时
        })

        event.on('deleteFriend',this,function(delete1){
           //当对方删除你时
           if (delete1.sourceId == friendInfo.openId) {
                hasDelete = true
           }
           
        })

        event.on('friendMessage',this,function(speak){
           //双方说话时
          
            if (speak.data.sourceId == friendInfo.openId) {
                var isMe = false
                var who = {
                    "nickName":speak.sourceName,
                    "avatarUrl":speak.sourceAvatar,
                }

                that.pushMessage(createUserMessage(speak.data.content,who,isMe))
           }
        })

        event.on('myMessage',this,function(speak){
            if (speak.data.sourceId == appInstance.globalData.myId && speak.targetId == friendInfo.openId) {
                var isMe = true
                var who = {
                    "nickName":speak.data.sourceName,
                    "avatarUrl":speak.data.sourceAvatar,
                }
                that.pushMessage(createUserMessage(speak.data.content,who,isMe))
            }   
        })


    },

    onUnload(){
        event.remove('openTunel',this);
        event.remove('addFriend',this);
        event.remove('deleteFriend',this);
        event.remove('friendMessage',this);
    },

    onReady() {
        wx.setNavigationBarTitle({ title: this.data.friendInfo.nickName});
        
    },

    addFriend(){
        //添加对方为好友
    },

    deleteFriend(){
        //删除对方好友
    },

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
            this.pushMessage(createSystemMessage('对不起你还未连接'));
            return;
        }
         if (hasDelete) {
            this.pushMessage(createSystemMessage('对不起对方已经将你删除，你不能向对方发消息'));
            return;
        }

        setTimeout(() => {
            if (this.data.inputContent && this.tunnel) {
                //this.tunnel.emit('speak', { word: this.data.inputContent });

                var date = Date.now()
                console.log(this.tunnel)
                this.tunnel.emit('speak',{
                    "targetType":"friend",
                    "targetId":this.data.friendInfo.openId,
                    "data":{
                        "sourceId":appInstance.globalData.myId,
                        "sourceName":appInstance.globalData.userInfo.nickName,
                        "sourceAvatar":appInstance.globalData.userInfo.avatarUrl,
                        "date":Date.now(),
                        "content":this.data.inputContent
                    }
                })
                this.setData({ inputContent: '' });
            }
        });
    },
    
})