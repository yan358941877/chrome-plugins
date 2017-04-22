function Music() {
    
    this.music = new Audio();
    this.volume = 0.5;
    // 音乐风格相关
    this.channel = "public_fengge_liuxing";
    this.channelIndex = 1;
    // 音乐歌词
    this.lyrics = [];

    // 资源链接地址相关
    this.src_sid = null;
    this.src_picture = null;
    this.src_singerName = null;
    this.src_musicName = null;

    // 现在正在播放localStorage中的第几首音乐
    this.index_like_music = -1;

    this.playFlag = false;
    this.init();
}
Music.prototype = {
    constructor: Music,
    init: function () {
        this.getMusic(this.channel);
        // 当歌曲播放结束后直接播放下一首
        //this.getMusic = this.getMusic.bind(this);
        // this.music.addEventListener("ended", this.getMusic);
    },

    getMusic(channel) {
        var url = null;
        this.lyrics = [];
        // 如果当前channel的类型不是“喜欢的歌”,则根据API从后台获取
        this.index_like_music = -1;
        if (!this.channel) {
            url = "http://api.jirengu.com/fm/getSong.php?channel=" + "public_fengge_liuxing";
        } else {
            url = "http://api.jirengu.com/fm/getSong.php?channel=" + channel;
        }
        
        let context = this;
        $.ajax({
            method: "get",
            url: url
        }).done(function (data) {
            //console.log(JSON.parse(data).song[0]);
            // 获取歌词
            let sid = JSON.parse(data).song[0].sid;
            let music_src = JSON.parse(data).song[0].url;
            let music_name = JSON.parse(data).song[0].title;
            let singer_name = JSON.parse(data).song[0].artist;
            let picture_src = JSON.parse(data).song[0].picture;
            //console.log(picture_src);
            // 获取歌词
            context.getLyric(sid);
            // 设置Audio对象的src
            context.music.src = music_src;
                
            // 设置音量：
            context.music.volume = 0.5;
            //context.music.autoplay = true;
            //context.playFlag = true;
            // 将歌曲url，sid，歌手名称，歌曲名称，图片地址保存到music-player对象中
            //context.src_music = context.music.src;
            context.src_sid = sid;
            context.src_picture = picture_src.split('@')[0];
            context.src_singerName = singer_name;
            context.src_musicName = music_name;
            
        })
    },
    // 获取歌词，并且根据歌词对应的时间存放到lyric数组中对应的位置
    getLyric(id) {
        let url = "http://jirenguapi.applinzi.com/fm/getLyric.php?&sid=" + id;
        let context = this;
        $.ajax({
            method: 'get',
            url: url
        }).done(function (data) {
            let lyrics = JSON.parse(data).lyric;
            //console.log(lyrics);
            let lyricArray = lyrics.split('\n');
            //console.log(lyricArray);
            for (let i = 1; i < lyricArray.length; i++) {
                // 一句歌词的形式：[00:32.56]轻轻叠上了微微雨
                let a_lyric = lyricArray[i].split(']');
                // 得到 ["[00:32.56", "轻轻叠上了微微雨"]
                // 如果歌词的第一部分并不是时间
                if (a_lyric.length < 2 || isNaN(a_lyric[0][1])) {
                    continue;
                }
                // a_lyric[0] --> [00:32.56
                // a_lyric[0].substr(1) --> 00:32.56
                // a_lyric[1] --> "轻轻叠上了微微雨"
                let time = a_lyric[0].substr(1).split(':');
                let minute = parseInt(time[0]);
                let second = parseInt(time[1]);
                if (!context.lyrics[minute]) {
                    context.lyrics[minute] = [];
                }
                context.lyrics[minute][second] = a_lyric[1];
            }
            
        })
    },
    isFavourite(musicSrc) {
        if(!localStorage.music){
            return false;
        }
        let musiclist = localStorage.music.split(',');
        let index = musiclist.indexOf(musicSrc);
        if (index < 0) {
            return false;
        } else {
            return true;
        }
    },
    addFavourite() {
        if (localStorage.music) {
            let musiclist = localStorage.music.split(',');
            musiclist.push(this.music.src);
            localStorage.music = musiclist;
            // sid
            let sidlist = localStorage.sid.split(',');
            sidlist.push(this.src_sid);
            localStorage.sid = sidlist;
            // picture
            let picturelist = localStorage.picture.split(',');
            picturelist.push(this.src_picture);
            localStorage.picture = picturelist;
            // singer
            let singerlist = localStorage.singer.split(',');
            singerlist.push(this.src_singerName);
            localStorage.singer = singerlist;
            // title
            let titlelist = localStorage.title.split(',');
            titlelist.push(this.src_musicName);
            localStorage.title = titlelist;
        } else {
            let musiclist = [];
            musiclist.push(this.music.src);
            localStorage.music = musiclist;

            // sid
            let sidlist = [];
            sidlist.push(this.src_sid);
            localStorage.sid = sidlist;
            // picture
            let picturelist = [];
            picturelist.push(this.src_picture);
            localStorage.picture = picturelist;
            // singer
            let singerlist = [];
            singerlist.push(this.src_singerName);
            localStorage.singer = singerlist;
            // title
            let titlelist = [];
            titlelist.push(this.src_musicName);
            localStorage.title = titlelist;
        }
    },
    removeFavourite(musicSrc) {
        //console.log(musicSrc);
        if (localStorage.music) {
            let musiclist = localStorage.music.split(',');
            let index = musiclist.indexOf(musicSrc);
            musiclist.splice(index, 1);
            localStorage.music = musiclist;

            // sid
            let sidlist = localStorage.sid.split(',');
            sidlist.splice(index, 1);
            localStorage.sid = sidlist;
            // picture
            let picturelist = localStorage.picture.split(',');
            picturelist.splice(index, 1);
            localStorage.picture = sidlist;
            // singer
            let singerlist = localStorage.singer.split(',');
            singerlist.splice(index, 1);
            localStorage.singer = singerlist;
            // title
            let titlelist = localStorage.title.split(',');
            titlelist.splice(index, 1);
            localStorage.title = titlelist;
        }
    }

}

var musicObject = new Music();