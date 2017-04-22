var bg = chrome.extension.getBackgroundPage();
var musicObject = bg.musicObject;


function MusicPlayer(playerNode) {
    var root = $(playerNode);

    this.player = root;
    // 静音按钮 
    this.btn_quiet = root.find('.title-bar .voice');
    // 音量调节器 title-bar
    this.volume_block = root.find('.title-bar .volume');
    // 包裹channel的容器 
    this.channel_item_ct = root.find('.channel .channel-ct ul');
    // 上一个channel按钮
    this.btn_pre_channel = root.find('.channel .pre-channel');
    // 下一个channel按钮
    this.btn_next_channel = root.find('.channel .next-channel');

    // 专辑图片 img
    this.picture = root.find('.music-panel .left-part img');
    // 歌手名称 p
    this.singer = root.find('.music-panel .right-part .singer');
    // 音乐名称 p
    this.musicName = root.find('.music-panel .right-part .music-name');
    // 持续时间 span
    this.lastTime = root.find('.music-panel .right-part .music-time');
    // 喜欢 span
    this.btn_like = root.find('.music-panel .right-part .operate .heart');
    // 播放 span
    this.btn_play = root.find('.music-panel .right-part .operate .play');
    // 下一首 span
    this.btn_skip_forward = root.find('.music-panel .right-part .operate .skip-forward')
    // 进度条容器
    this.process_bar = root.find('.music-panel .right-part .operate .process');
    // 进度条
    this.process_now_bar = root.find('.music-panel .right-part .operate .process .now');
    // 歌词控件
    this.lyric_ct = root.find('.music-lyric');

    this.channelIndex = 1;
    this.init();
}
MusicPlayer.prototype = {
    constructor: MusicPlayer,
    init: function () {
        //musicObject.music.play();
        if (musicObject.playFlag) {
            this.btn_play.removeClass("icon-play");
            this.btn_play.addClass("icon-pause")
        } else {
            this.btn_play.removeClass("icon-pause");
            this.btn_play.addClass("icon-play")
        }

        this.bind();
        this.modifyView();
        this.musicPlaying();
    },
    modifyView() {
        // 设置音乐名称
        this.musicName.eq(0).text(musicObject.src_musicName);
        // 设置歌手名称
        this.singer.eq(0).text(musicObject.src_singerName);
        // 设置封面图片
        this.picture.eq(0).attr("src", musicObject.src_picture);
    },
    bind: function () {
        // 给播放按钮绑定点击事件
        this.clickPlay = this.clickPlay.bind(this);
        this.btn_play.click(this.clickPlay);
        // 给下一首按钮绑定点击事件
        this.clickNextMusic = this.clickNextMusic.bind(this);
        this.btn_skip_forward.click(this.clickNextMusic);
        // 关闭音量
        this.clickCloseVoice = this.clickCloseVoice.bind(this);
        this.btn_quiet.click(this.clickCloseVoice);
        // 调节音量
        this.clickVolumeBlock = this.clickVolumeBlock.bind(this);
        this.volume_block.click(this.clickVolumeBlock);
        // 给 Audio对象添加 事件监听器
        this.musicPlaying = this.musicPlaying.bind(this);
        musicObject.music.ontimeupdate = this.musicPlaying;

        this.modifyView = this.modifyView.bind(this);
        musicObject.music.addEventListener("playing", this.modifyView);

        //let getMusic = musicObject.getMusic.bind(musicObject);
        musicObject.music.addEventListener("ended", this.clickNextMusic);

        // 点击 channel-item切换channel
        this.clickChannelItem = this.clickChannelItem.bind(this);
        this.channel_item_ct.on('click', this.clickChannelItem);
        // 点击下一个channel
        this.clickNextChannel = this.clickNextChannel.bind(this);
        this.btn_next_channel.on('click', this.clickNextChannel);
        // 点击上一个channel
        this.clickPreChannel = this.clickPreChannel.bind(this);
        this.btn_pre_channel.on("click", this.clickPreChannel);

        //点击进度条
        this.clickProcessBar = this.clickProcessBar.bind(this);
        this.process_bar.on('click', this.clickProcessBar);

        // 点击 like 按钮
        this.clickLike = this.clickLike.bind(this);
        this.btn_like.on('click', this.clickLike);

    },

    // 播放或暂停歌曲
    clickPlay: function (event) {
        if (!musicObject.playFlag) {
            musicObject.music.play();
            this.btn_play.removeClass("icon-play");
            this.btn_play.addClass("icon-pause")
            musicObject.playFlag = !musicObject.playFlag;
            musicObject.music.autoplay = true;
        } else {
            musicObject.music.pause();
            this.btn_play.removeClass("icon-pause");
            this.btn_play.addClass("icon-play")
            musicObject.playFlag = !musicObject.playFlag;
            //musicObject.autoPlay = false;
        }
        //console.log(this.lyrics);
    },
    // 下一首歌曲
    clickNextMusic: function (event) {
        
        musicObject.getMusic(musicObject.channel);
        
    },
    // 静音
    clickCloseVoice: function (event) {
        musicObject.music.volume = musicObject.music.volume === 0 ? musicObject.volume : 0;
    },
    // 调节音量
    clickVolumeBlock: function (event) {
        // 将所有音量li中的active去掉
        let volume_block_index = this.volume_block.children('li').index(event.target);
        if (volume_block_index < 0) {
            return;
        }
        this.volume_block.children().removeClass("active");
        // 获取当前点击的是第几个个音量按键
        for (let i = volume_block_index; i < this.volume_block.children('li').length; i++) {
            this.volume_block.children('li').eq(i).addClass("active");
        }
        musicObject.music.volume = (this.volume_block.children('li').length - volume_block_index) / this.volume_block.children('li').length;
    },
    //
    musicPlaying(event) {

        let time = musicObject.music.duration;
        let context = this;

        //musicObject.music.ontimeupdate = function () {
        let time_percent = 100 * musicObject.music.currentTime / time + '%';
        let minute = Math.floor(musicObject.music.currentTime / 60);
        let second = Math.floor(musicObject.music.currentTime) % 60;
        let rest_minute = Math.floor((time - musicObject.music.currentTime) / 60);
        let test_second = Math.floor((time - musicObject.music.currentTime) % 60);
        if (test_second < 10) {
            this.lastTime.text("-0" + rest_minute + ':0' + test_second);
        } else if(test_second >= 10) {
            this.lastTime.text("-0" + rest_minute + ':' + test_second);
        }
        // 修改进度条
        this.process_now_bar.css('width', time_percent);
        // 添加歌词功能
        let lyric = musicObject.lyrics[minute][second];
        if (lyric) {
            this.lyric_ct.text(lyric)
        }

        // }

    },
    // 切换频道
    clickChannelItem(event) {
        // 获取点击的li的content
        let targetChannel = $(event.target);
        //console.log(targetChannel.text());
        let channelArray = this.channel_item_ct.find("li");
        let channelIndex = channelArray.index(targetChannel.parent());
        
        //获取当前被点击的li是channel-ct中的第几个（从0开始）
        console.log(channelArray.index(targetChannel.parent()))
        //注意：显示的音乐类型名称和url中的音乐类型参数名称是不同
        musicObject.channel = targetChannel.parent().attr("data-channel-id");
        // 让ul中所有的li都去掉active class
        channelArray.removeClass("active");
        // 给选中的li添加active属性
        targetChannel.parent().addClass("active");
        // 使ul偏移一定距离，使得选中的item正好处于中间位置
        this.channel_item_ct.css("margin-left", (90 - channelIndex * 90) + "px");
        // 切换音乐，切换到当前channel的音乐, 注意：显示的音乐类型名称和url中的音乐类型参数名称是不同的
       
        musicObject.getMusic(musicObject.channel);
        
    },
    // 切换至下一个频道
    clickNextChannel(event) {
        let channelArray = this.channel_item_ct.find("li");
        if (this.channelIndex < channelArray.length - 1) {
            // 得到下一个channel所在的li
            let nextChannel = channelArray.eq(this.channelIndex + 1);
            this.channelIndex = this.channelIndex + 1;
            musicObject.channel = nextChannel.attr("data-channel-id");
            channelArray.removeClass("active");
            nextChannel.addClass("active");
            this.channel_item_ct.css("margin-left", (90 - this.channelIndex * 90) + "px");
           
            musicObject.getMusic(musicObject.channel);
            
        } else {
            return;
        }
    },
    // 切换至上一个频道
    clickPreChannel(event) {
        let channelArray = this.channel_item_ct.find("li");
        if (this.channelIndex > 0) {
            // 得到下一个channel所在的li
            let preChannel = channelArray.eq(this.channelIndex - 1);
            this.channelIndex = this.channelIndex - 1;
            musicObject.channel = preChannel.attr("data-channel-id");
            channelArray.removeClass("active");
            preChannel.addClass("active");
            this.channel_item_ct.css("margin-left", (90 - this.channelIndex * 90) + "px");
            
            musicObject.getMusic(musicObject.channel);
            
        } else {
            return;
        }
    },
    // 点击进度条，跳转到指定的声音节点
    clickProcessBar(event) {
        // 获取进度条的总长度
        let process_length = this.process_bar.outerWidth();
        //console.log(process_length);
        // 获取进度条的起点位置坐标
        let start_position = this.process_bar.offset().left;
        //console.log(start_position);
        let click_position = event.clientX;
        //console.log(click_position);
        // 获取点击位置对应的具体时间
        let changeTime = musicObject.music.duration * (click_position - start_position) / process_length;
        // 设置音乐的currentTime---> 由于时间发生了变化，会自动触发ontimeupdate事件---> 在playingmusic中，为该事件指定了处理方法(包括对进度条长度，剩余时间的改变)
        musicObject.music.currentTime = changeTime;
    },
    clickLike(event) {

        if (this.btn_like.css("color") == "rgb(255, 0, 0)") {
            this.btn_like.css("color", "rgb(99, 102, 100)");
            // 将当前歌曲的url从localStorage中移除
            musicObject.removeFavourite(this.music.src.toString());
        } else {
            this.btn_like.css("color", "red");
            // 将当前歌曲的url添加到localStorage中
            musicObject.addFavourite.addFavourite();
        }
    }


}


var playerNode = document.getElementsByClassName("music-player");
var playerNode = $('.music-player');
var musicPlayer = new MusicPlayer(playerNode[0]);



