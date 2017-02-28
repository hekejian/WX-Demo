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
        groupInfo:null, // openId  groupName  groupSign avatarUrl nearestMessage newMessages
        messages: [],
        inputContent: '大家好啊',
        lastMessageId: 'none',
        scrollTop:99999,
        groupNumber:[], //list
        show:false,
    },
   
    onLoad(options){
        console.log("chat/onLoad")
        var that = this
        var getInfo = false
        var groupOpenId = options.openId
        if (appInstance.globalData.groupsInfo) {
            var groupsInfo = appInstance.globalData.groupsInfo
            for (var i = 0; i < groupsInfo.length; i++) {
                if(groupsInfo[i].openId == groupOpenId){
                    //已经存在获取数据
                    getInfo = true
                    that.setData({
                        groupInfo : groupsInfo[i],
                        messages : groupsInfo[i].newMessages
                    })
                    var groupsNumber = appInstance.globalData.groupMember
                    for (var j = 0; j < groupsNumber.length; j++) {
                        if (groupOpenId == groupsNumber[j].openId) {
                            console.log("getGroupNumber",groupsNumber[j].list)
                            that.setData({
                                groupNumber : groupsNumber[j].list
                            })
                        }
                    }
                }
            }
        }

        if (getInfo == false) {
            //加群
            this.addGroup(groupOpenId)
            console.log("没有加群")
        }
        
        this.tunnel = appInstance.globalData.tunnel
        this.me = appInstance.globalData.userData
        
       /* if(appInstance.globalData.inGroup == false){
            this.addGroup() //加群是什么鬼
        }
        */
        

        event.on('getGroupId',this,function(group){
            //设置群昵称和头像
            //设置不对，没做判断，获取groupId 的途径也不对
            for (var i = 0; i < group.length; i++) {
                if (group[i].openId == groupOpenId) {
                    that.setData({
                        groupInfo:group[i]
                    })
                }
                
            }
            
        })

        event.on('getGroupNumber',this,function(groupList){
            //获得群成员
            if(groupList.openId == groupOpenId){
                that.setData({
                    groupNumber:groupList.list
                })
            }
        })

        event.on('openTunel',this,function(tunnel){
           this.tunnel = tunnel
        })

        event.on('groupNumberOnline',this,function(online){

        })

        event.on('groupNumberOffline',this,function(offline){

        })

        event.on('addGroup',this,function(add){
            if(add.targetId == groupOpenId){
                var total = that.data.groupNumber.length+1
                that.pushMessage(createSystemMessage(`${add.data.sourceName}已加入群聊，共 ${total} 人`))
            }
            if(add.targetId == groupOpenId && add.data.openId == appInstance.globalData.myId){
                event.emit('addNewGroup',groupOpenId)
            }
        })

        event.on('deleteGroupNumber',this,function(delete1){
            if(delete1.targetId == groupOpenId){
                if(delete1.data.sourceId != appInstance.globalData.myId){
                    var groupNumber = that.data.groupNumber
                    for(var i=0; i<groupNumber; i++){
                        if(groupNumber[i].openId == delete1.data.sourceId){
                            groupNumber.splice(i,1)
                            that.setData({
                                groupNumber 
                            })
                        }
                    }
                }
            }
        })

        event.on('groupMessage',this,function(speak){
            console.log("wo收到消息了哈哈哈")
            if(speak.targetId == groupOpenId){
                var speakData = speak.data //sourceId sourceName date content
                var isMe = false
                if(speakData.sourceId == appInstance.globalData.myId){
                      isMe = true
                }
                var who = {
                    "nickName":speakData.sourceName,
                    "avatarUrl":speakData.sourceAvatar,
                }
                console.log("使这里错了吗")  
                that.pushMessage(createUserMessage(speakData.content,who,isMe))
            }
        })

        
    },

    onUnload:function(){
        event.remove('getGroupId',this);
        event.remove('getGroupNumber',this);
        event.remove('openTunel',this);
        event.remove('groupNumberOnline',this);
        event.remove('groupNumberOffline',this);
        event.remove('addGroup',this);
        event.remove('deleteGroupNumber',this);
        event.remove('groupMessage',this);
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
        wx.setNavigationBarTitle({ title: this.data.groupInfo.groupName});
         //this.pushMessage(createSystemMessage('正在加入群聊...'));
        //this.tunnelListener()
        //this.requsetFriends("")
        // this.popMessage() //删除上一条消息
    },

    /**
     * 后续后台切换回前台的时候，也要重新启动聊天室
     */
    onShow() {
        //重新启动需要做什么吗？
    },

    addGroup(groupOpenId){
         setTimeout(() => {
            if (this.tunnel) {
                var date = Date.now()
                this.tunnel.emit('add',{
                    "targetType":"group",
                    "targetId":groupOpenId,
                    "data":{
                       
                    }
                    /*
                     "sourceId":appInstance.globalData.myId,
                        "sourceName":appInstance.globalData.userInfo.nickName,
                        "sourceAvatar":appInstance.globalData.userInfo.avatarUrl,
                        "date":1451692802008 业务服务器会注入
                    */
                })
            }
        });
    },
    /**
     * 连接到聊天室信道服务
     */
    /*tunnelListener() {
        var tunnel = this.tunnel;
        // 获取信道

        tunnel.on('delete',delete1 =>{
            if(delete1.targetType == "group" && delete1.targetId == this.data.groupInfo.groupId){
                if(delete1.data.sourceId != appInstance.globalData.myId){
                    //删除离开的人，刷新List数据
                }
                else if(delete1.data.sourceId == appInstance.globalData.myId){
                    //离开这个讨论群
                }
            }
        })

         tunnel.on('add',add => {
             if(add.targetType == "group" && add.targetId == this.data.groupInfo.groupId ){
                 //其他人加入
                 if(add.data.sourceId == appInstance.globalData.myId){
                    appInstance.globalData.inGroup = true
                 }
                 var total = this.data.list.length+1
                 this.pushMessage(createSystemMessage(`${add.data.sourceName}已加入群聊，共 ${total} 人`))
                 //生成一条系统消息，有人加入
                 //刷新list数据
             }
        })

        tunnel.on('speak', speak => {
            if(speak.targetType =="group" && speak.targetId == this.data.groupInfo.groupId){
                var speakData = speak.data //sourceId sourceName date content
                var isMe = false
                if(speakData.sourceId == appInstance.globalData.myId){
                      isMe = true
                }
                var who = {
                    "nickName":speakData.sourceName,
                    "avatarUrl":speakData.sourceAvatar,
                }  
                this.pushMessage(createUserMessage(speakData.content,who,isMe))

            }

          //  const { word, who } = speak;
          // this.pushMessage(createUserMessage(word, who, who.openId === appInstance.globalData.userData.openId));
        });



        // 聊天室有人加入或退出，反馈到 UI 上

        // 有人说话，创建一条消息

    },


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
               console.log("信道还未打开")
            }
            return;
        }

        setTimeout(() => {
            if (this.data.inputContent && this.tunnel) {
                //this.tunnel.emit('speak', { word: this.data.inputContent });

                var date = Date.now()
                console.log(this.tunnel)
                this.tunnel.emit('speak',{
                    "targetType":"group",
                    "targetId":this.data.groupInfo.openId,
                    "data":{
                        "sourceId":appInstance.globalData.myId,
                        "sourceName":appInstance.globalData.userInfo.nickName,
                        "sourceAvatar":appInstance.globalData.userInfo.avatarUrl,
                        "date":1451692802008,
                        "content":this.data.inputContent
                    }
                })
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
