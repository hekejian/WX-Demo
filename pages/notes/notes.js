var sourceType = [ ['camera'], ['album'], ['camera', 'album'] ]
var sizeType = [ ['compressed'], ['original'], ['compressed', 'original'] ]
var videoSourceType = [ ['camera'], ['album'], ['camera', 'album'] ]
var camera = [ ['front'], ['back'], ['front', 'back'] ]
var duration = Array.apply(null, {length: 60}).map(function (n, i) {
  return i + 1
})
Page({
     data: {
        imageList: [],
        countIndex: 8,
        count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        sourceTypeIndex: 2,
        sizeTypeIndex: 2,
        videoSourceTypeIndex: 2,
        cameraIndex: 2,
        durationIndex: 59,
        duration: duration.map(function (t) { return t + '秒'}),
        src: ''
  },

   chooseImage: function () {
    var that = this
    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: this.data.count[this.data.countIndex],
      success: function (res) {
        console.log(res)
        that.setData({
          imageList: res.tempFilePaths
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  },

  chooseVideo: function () {
    console.log("caonima")
    var that = this
    wx.chooseVideo({
      sourceType: videoSourceType[this.data.videoSourceTypeIndex],
      camera: camera[this.data.cameraIndex],
      maxDuration: duration[this.data.durationIndex],
      success: function (res) {
        that.setData({
          src: res.tempFilePath
        })
      }
    })
  }
})