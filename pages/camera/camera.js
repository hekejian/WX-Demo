var sourceType = [ ['camera'], ['album'], ['camera', 'album'] ]
var sizeType = [ ['compressed'], ['original'], ['compressed', 'original'] ]
var camera = [ ['front'], ['back'], ['front', 'back'] ]
Page({
    data:{
        video:"",
        sourceTypeIndex:0,
        sizeTypeIndex:2,
        count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        countIndex: 0,
        imageList:null
    },
    onShow:function(){
        var that = this
        wx.chooseImage({
            sourceType: sourceType[this.data.sourceTypeIndex],
            sizeType: sizeType[this.data.sizeTypeIndex],
            count: this.data.count[this.data.countIndex],
            success: function (res) {
                var url = "../notes/notes?imagePath="+res.tempFilePaths
                console.log(res)
                that.setData({
                    imageList: res.tempFilePaths
                })
                wx.navigateTo({
                  url: url,
                  success: function(res){
                    console.log("转换成功")
                  },
                })
            }
        })
    }
})