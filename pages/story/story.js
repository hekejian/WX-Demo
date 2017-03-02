// 引入 QCloud 小程序增强 SDK
var event = require('../../utils/event.js')
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

var util = require('../../utils/util.js')

var appInstance = getApp()
Page({
    data:{
        groupInfo:[],
        /*groupInfo:{
            title:"78路公交车",
        avatar:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            
        },
        storys:[{
            storyId:0,
            nickName:"kejian",
            avatar:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0",
            time:"12月13号 14：00",
            imageList:[
            "http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0","http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0","http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0","http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0","http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0"
            ],
            audio:{
                poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
                name: '此时此刻',
                author: '许巍',
                src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46',
                audioAction: {
                method: 'pause'
                }
            },
            video:{
                src:"http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400"
            },
            text:"学校被确定为国家高等教育综合改革试验校。2012年4月，教育部同意建校，并赋予学校探索具有中国特色的现代大学制度、探索创新人才培养模式的重大使命。根据办学目标，学校致力于建设成为聚集和培养拔尖创新人才的学府，以及创造国际一流学术成果、推动科技应用、支撑深圳可持续发展的平台。"
            
        }],
        */
       color:["#D6EAF8","#D0ECE7","#D5F5E3","#FCF3CF","#FAE5D3","#EBDEF0","#F2F3F4"]
    },

    onLoad(){
        console.log("草泥马，老子每次打开都执行")
        event.on('addGroup',this,function(add){
            // var  重新拉取群数据

        })

        if (appInstance.globalData.groupsInfo.length > 0) {
            //拉取第一个，后面重新设置，只能有一个群
            console.log("rinima 老子没执行")
            this.requstStory(appInstance.globalData.groupsInfo[0].openId)
        }

    },

    onReady() {
        //wx.setNavigationBarTitle({ title: this.data.groupInfo.title});
        console.log("好开心啊啊，我执行了耶")
   },

   onUnload(){
        event.remove('addGroup',this);
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
    var url = `https://${config.service.host}/group/`+ openId
    var that = this
    qcloud.request({
        url:url,
        success: (response) => {
            console.log("group response",response)
            that.setData({
                groupInfo:response.data.list
            })
            console.log("response.data.list",response.data.list)
        },

    })
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
