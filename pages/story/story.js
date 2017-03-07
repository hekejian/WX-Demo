// 引入 QCloud 小程序增强 SDK
var event = require('../../utils/event.js')
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

var util = require('../../utils/util.js')

var appInstance = getApp()
Page({
    data:{
        groupInfo:null,
        groupStorys:[],
        imageList:[],
        color:["#D6EAF8","#D0ECE7","#D5F5E3","#FCF3CF","#FAE5D3","#EBDEF0","#F2F3F4"],
    },

    onLoad(){
        var that = this
        event.on('addGroup',this,function(add){
            // var  重新拉取群数据 有待测试
            var groupInfo = add
            var openId = add.openId
            that.refreshData(openId)
            that.setData({
                groupInfo
            })
        })

        if (appInstance.globalData.groupsInfo) {
            //拉取第一个，后面重新设置，只能有一个群
            var groupInfo = appInstance.globalData.groupsInfo
            this.requstStory(groupInfo.openId)

            this.setData({
                groupInfo
            })
        }
        else{
            wx.showModal({
                title:'提示',
                content:'你还未扫码进入，查看不到发表在群里的故事',
                showCancel:false,
                confirmText:'确认',
                confirmColor:'#6C5BB7',
            })
            //显示您还未添加进群，不能查看story
            return 
        }

        event.on('addStory',this,function(story){
            var imageList = that.data.imageList
            imageList.unshift = story.imageList
            var groupStorys = that.data.groupStorys
            var date = Date.now()
            var time = util.formatTime(date)
            var story1 = {
                content:story.text,
                date:date,
                groupId:that.data.groupInfo.openId,
                source:that.data.userData,
                time:time,
                videos:null,
                voices:null

                //后续补上videos voices
            }
            groupStorys.unshift(story1)
            that.setData({
                groupStorys,
                imageList
            })
            //that.imageList.unshift()
        })

    },
    onShow(){
    },

    onReady() {
        wx.setNavigationBarTitle({ title: this.data.groupInfo.groupName});
        //console.log("好开心啊啊，我执行了耶",this.data.groupInfo)
   },

   onUnload(){
        event.remove('addGroup',this);
        event.remove('addStory',this)
   },

  previewImage: function (e) {
    console.log(e)
    console.log(e.target.dataset.imagesSrc)
    console.log(e.target.dataset.src)
    var current = e.target.dataset.src
    var imagesSrc = e.target.dataset.imagesSrc
    wx.previewImage({
      current: current,
      urls: imagesSrc,
    })
  },

  requstStory(openId){
    var url = `https://${config.service.host}/share/group/`+ openId
    var that = this
    var imageList = new Array()
    var imagestemp = []
    qcloud.request({
        url:url,
        success: (response) => {
            console.log("group response",response)
            var list = response.data.data.list
            for (var i = 0; i < list.length; i++) {
                list[i].time = util.formatTime(list[i].date)
                imagestemp = []
                for (var j = 0; j < list[i].images.length; j++) {
                    console.log('list[i].images[j].path',list[i].images[j].path)
                    //imageList[i][j] = list[i].images[j].path
                    imagestemp[j] = list[i].images[j].path
                }
                imageList[i] = imagestemp
            }
            that.setData({
                groupStorys:list,
                imageList
            })
            appInstance.globalData.groupStorys = list
        },

    })
  },

  refreshData(openId){
    this.requstStory(openId)
  },

   note(args){
        wx.navigateTo({
          url: '../notes/notes',
          success: function(res){
            // success
          },
        })
    }
})
