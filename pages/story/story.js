Page({
    data:{
        groupInfo:null,
        story:[],
        imageList:[
            "../materials/test1.jpg","../materials/test2.jpg"
        ],
        title:"78路公交车",
        avatar:"http://wx.qlogo.cn/mmopen/vi_32/TDj3GsR0VeYgXeC7JOJ0cHX0MmyTMu4kv843ZSJjo0XCUpT66aPlyydA5K7iaFbzRKmz3xLnxo2sEfdQ25KQp0g/0"
    },

    onLoad(){

    },

    onReady() {
        wx.setNavigationBarTitle({ title: this.data.title});
   },

  previewImage: function (e) {
    var current = e.target.dataset.src

    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  }


})
