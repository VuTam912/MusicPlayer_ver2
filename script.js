
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// key - Lưu thông tin trạng thái bai hat hien tai va chuc nang cua music player mỗi khi nhấn F5
// add JSON
const PLAYER_STORAGE_KEY = 'PLAYER_STORAGE'  // key 

// get all id/class elements in HTML DOM
const player = $('.player')

// get all Playerlist elements => Show render 
const playlist = $('.playlist')

// volume Adjustments
const volumeSet = $('#volumeAdjust')
const volumeIcon = $('.volume .btn-volume')

const activeSong=$('.song.active')

//1 get title,song,path audio, CD image |2. CD rotation 
const cd = $('.cd')
const cdCircle = $('.circle');
const cdThumb =$('.cd-thumb')

// marquee = hiệu ứng chạy chữ 
const heading = $('header marquee');
const audio = $('#audio')


// get ALL Control elements
const repeatBtn = $('.btn-repeat');
const prevBtn = $('.btn-prev');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const btnMenu = $('.menuBtn');
const randomBtn = $('.btn-random');

// get id All progress of song (Bar)
const progress= $('#progress');
const progressRange= $('.progressRange')
const cdProgressFull = $('.cd .circle .mask.full');
const cdProgressFill = $$('.cd .circle .mask .fill');

// get id time text of progress
const startTime =$('.startTime');
const endTime=$('.endTime');
const rangeValue=$('.rangeValue');
 

// get thông số phân tử của biến đã khai báo trong css
var r = $(':root') 
// tạo một array để lưu chứa bài hát like or Favorite
var favouriteArray = []; 

var currentVolume = 0;

// this = app
const app = {
    // xac dinh thông tin của Song (cần array để chứa các author,image,name..) hiện tại (listening song, select..)
    currentSong: {},
    // Xac dinh vi tri song trong array songs 
    currentIndex: 0,
    // Xác định song có đang play or pause ko? (btn Control)
    isPlaying: false,
    // thoi luong cua moi bai hat
    songTime: 0,
    // Xắc nhận đang bật Random ko 
    isRandom: false,
    // Xắc nhận đang bật Repeat ko 
    isRepeat: false,
    // xác định Voulume ở mức to hay nhỏ (0-100)
    songVolume:0,
    // Xac dinh volumeIcon tat hay chua 
    isMute: false,
    // Cấu hinh config | use JSON.parse() to convert text into a JavaScript object:
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))||{},
    // tao mot array chua thong tin cac song
    songs:[
        {
            name:'Thương ca tiếng việt',
            singer: 'Vicetome',
            path: './Assets/music/song1.mp3',
            image: './Assets/image/song1.jpg'
        },
        {
            name:'Đi học',
            singer: 'K-391',
            path: './Assets/music/song2.mp3',
            image: './Assets/image/song2.jpg'
        },
        {
            name:'Monday',
            singer: 'TheFatRat',
            path: './Assets/music/song3.mp3',
            image: './Assets/image/song3.jpg'
        },
        {
            name:'Heality',
            singer: 'Lost Frquencies',
            path: './Assets/music/song4.mp3',
            image: './Assets/image/song4.jpg'
        },
        {
            // *********NEW SONGS *******************
            name:'iBadHabit',
            singer: 'DJ Desa remix',
            path: "./Assets/music/BadHabit.mp3",
            image: './Assets/image/iBadHabit.jpg'
        },
        {
            name:'Nevada 2',
            singer: 'Vicetome 2',
            path: './Assets/music/LeaveTheDoorOpen.mp3',
            image: './Assets/image/Leave.jpg'
        },
        {
            name:'love you baby',
            singer: 'K-391 ver 2',
            path: './Assets/music/LoveYouBaby.mp3',
            image: './Assets/image/song7.jpg'
        },
        {
            name:'Monday day',
            singer: 'TheFatRat 2',
            path: './Assets/music/Tothemoon.mp3',
            image: './Assets/image/Moon.jpg'
        },
        {
            name:'What are words',
            singer: 'Big Bang',
            path: './Assets/music/What_are_words.mp3',
            image: './Assets/image/maxresdefault.jpg'
        },
        {   
            name:'Lemon tree 111',
            singer: 'DJ Desa remix ver2',
            path: "./Assets/music/song1.mp3",
            image: './Assets/image/words.jpg'
        }
    ],

    //25. Config = luu bai hat hien dang nghe, va cac chuc nang khac, repeat,random...    
    // add => key, value
    setConfig: function(key, value) {
        this.config[key] = value; // add new key
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    // 1. show all render (Scoll) in HTML => cái đầu tiên phải làm trước
    renderSong: function() {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${this.currentIndex==index? 'active' : '' }" data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>                    
            </div>
            <div class="option">
                <i class="favourite fas fa-heart"></i>
            </div> 
        </div> 
            `
        });
        // gan playlist vao DOM HTML
        playlist.innerHTML = htmls.join(''); // ('') cho moi chuoi xuong dong
    },

    // Sử lý các event 
    /* 
    // Note: not should be writen 'this' in handleEvent func|
    // nếu bạn viết this trong nay nó sẽ 
    // án chỉ this là handleEvents chứ ko phải app (array contains info of song)
    */
    handleEvents : function () {
        const _this = this;
        // giá tri cd width + height cần cuộn srcollY
        const cdWidth = cd.offsetWidth; // get width of cd element
        const cdHeight = cd.offsetHeight;
        
        // 2. Tạo hiệu ứng chay/dung CD rotation (Image) mỗi khi play song hoặc đang pause 
        const cdThumbAnimated = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],
        {
            duration:10000, // 10 sec
            iterations: Infinity // lập lại => vô hạn
        })

        // stop animation CD rotation - Default 
        cdThumbAnimated.pause()
        //marquee = hiệu ứng chạy chữ - animation
        heading.start()

        //3 Handle when scrolling | xử lý phóng to/nhỏ CD (image) khi cuộn ds các songs
        // Scroll View
        document.onscroll = function () {
            // get biên từ (:root) -> r đã khai báo $(:root)
            var rs = getComputedStyle(r);
            // --cd-dim : là tên cần biến có giá trị cần lấy
            //console.log(rs.getPropertyValue('--cd-dim'));

            // window.scrollY => lay gia tri khi cuon Y (doc) trên browser
            const scrollTop = window.scrollY|| document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            const scaleRatio = newWidth / cdWidth; // lay giá trị thực => để tính toán

            // gán các biến từ (:root) với giá trị mới được tính ra ở trên
            // để thay đổi giá trị và truyền qua css (no need writen in javascript: cd.style.width= ...)
            r.style.setProperty('--cd-dim',newWidth+'px');
            r.style.setProperty('--thumb-dim',Math.floor(newWidth*94/100)+'px');
            r.style.setProperty('--c-width',Math.floor(newWidth*3/100)+'px');
            
            // create effect opacity of cd => 
            cdThumb.style.opacity = newWidth / cdWidth;
            
            //không show circle progress của song khi cuộn xuống. => Fix UI
            if(cdThumb.style.opacity>0.9){
                cdCircle.style.opacity = newWidth / cdWidth;
            } else 
            {
                cdCircle.style.opacity = 0;
            }
            
        }

        /* Listen Button Controls events - Note: get all id/class control elements and audio */

        // 5. Xử lý khi click play để nghe bài hát or pause song| => should use call function prevSong,nextSong...
        /* Note: not should be writen 'this' in playbtn |
           nếu bạn viết this trong playbtn (func) nó sẽ án chỉ this là playbtn chứ ko phải app    */
    
        playBtn.onclick = function () {
            // Xác định nhạc đang play or pause 
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // 12. Có 2 xử lý:
        // + Xử lý chuyển sang bài hát mới khi click Next button 
        // + Xử lý chuyển bài hát next nếu bật ramdom
        nextBtn.onclick = function () {
            autoNextSong(); // có sẵn audio + radmom on
            _this.scrollToActiveSong();
        } 

        // 14. Xu lý bài hát trước đó khu click prev button
        //   Có 2 xử lý:
        // + Xử lý chuyển sang bài hát mới khi click prev button 
        // + Xử lý chuyển bài hát prev nếu bật ramdom

        prevBtn.onclick = function () {
            // Nếu bât random
            if(_this.isRandom)
            {
                _this.playRandomSong();  // Play random song
            }
            else
            {
                _this.prevSong(); // chú ý preveSong ở ngoài function event nên cần use _this 
            }
            audio.play();
            _this.scrollToActiveSong();
        }

        // 15. Xử lý khi click Random button + Save key config 
        randomBtn.onclick = function () {
             // De xu ly khi la true => chuyen sang false | neu false => chuyen sang true
            _this.isRandom=!_this.isRandom;
            // add key config
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom); // kích hoạt css button
        }

        // 17. Xử lý khi click Repeat button (as same as Random button) |Mote: code repeat in audio onended => khi săp hết bài hát 
        repeatBtn.onclick = function () {
            _this.isRepeat=!_this.isRepeat;
            // add key config
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active',_this.isRepeat);
          

        }

        // 19.Song active at playlist when click a song in the playlist
        playlist.onclick = function (e) {
            //closest => tim thuoc tinh parent cua child chinh nó
            const songNode = e.target.closest('.song:not(.active)');
            const option = e.target.closest('.option');

            // Nếu click 1 trong 2 cái này
            if(songNode||option) 
            {
                //Chọn SongNode và ko chọn option
                if(songNode&&!option) {
                    //Note: nhớ viết thêm data-index=${index} trong div co class='song'
                    const index = songNode.getAttribute('data-index'); // vd: data-index = 5 => index = 5
                    _this.currentIndex = Number(index); // convert string to number
                    _this.loadAndSave(); // Load Render
                    audio.play();
                 }
                if(option) {

                }
                
            }

        }

        // 22. Sử lý Volume icon khi click vào icon volume => volume = 0
        volumeIcon.onclick = function () {            
            
            if(_this.isMute == false)
            {
                audio.volume=0; // set volume = 0
                _this.songVolume=audio.volume;
                volumeDisplay();
                // show icon tắt
                volumeIcon.innerHTML='<i class="fas fa-volume-mute"></i>'
                _this.isMute = true; // da tat 
            }
            else {
                // audio.volume = _this.songVolume/100;
                // _this.songVolume=audio.volume;
                // volumeDisplay();
                // // show ICon
                // _this.volumeIconHandle();
                // _this.isMute = false; // dat bat

            }
        }
        
        function volumeDisplay(){
            volumeSet.value=_this.songVolume;
            var volumeColor='linear-gradient(90deg, rgb(233, 72, 115)' +_this.songVolume+'%, rgb(214, 214, 214) '+_this.songVolume+'%)';
            volumeSet.style.background=volumeColor;
        };
        
        //23. volume adjustment - điều chỉnh thanh to nhỏ volume
        volumeSet.oninput= function(e){
            _this.songVolume=e.target.value;
            audio.volume=_this.songVolume/100;
            volumeDisplay();
            _this.setConfig("volume",_this.songVolume);
            _this.volumeIconHandle();   
        }
        
        //24. Linh tinh
        // Khong hoan chinh UI => error 
        // Khi chuot click down
        nextBtn.onmousedown = function () {
            nextBtn.classList.add('active');
        };
        // khi chuot bo click up
        nextBtn.onmouseup = function(){
            nextBtn.classList.remove('active');
        };
        prevBtn.onmousedown = function(){
            prevBtn.classList.add('active');
        };
        prevBtn.onmouseup = function(){
            prevBtn.classList.remove('active');
        };
        volumeIcon.onmousedown =function(){
            volumeIcon.classList.add('active');
        };
        volumeIcon.onmouseup =function(){
            volumeIcon.classList.remove('active');
        };

        
        /* Handle AUDIO Control
         tra w3school ve audio de biet details) - RUN Realtime*/
      
         // 6. Xử lý khi song đươc playing 
        // và show icon pause, CD rotating, set true for isPlaying là đang chạy
        
        audio.onplay = function () {
            _this.isPlaying = true;
            // Note: Xem lại trong css 
            player.classList.add("playing");
            cdThumbAnimated.play();
        }

        // 7. XỬ lý khi đang pause a song
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimated.pause();
        }

        // 8. - get id progress bar and time text
        // khi tiến trình của bài hát đang chạy (thanh bar)
        audio.ontimeupdate = function () {
            // xac dinh audio co chay ko - duration: tông thời gian của
            if(audio.duration)
            {
                // tinh so giay thanh tien trinh dang chay nhac | floor = 3.20000 => 3 (làm tròn số trả về chỉ 1 số)
                const currentProgress = Math.floor(audio.currentTime / audio.duration * 100);
                //console.log(Math.floor(audio.currentTime));
                progress.value = currentProgress; // thanh circle chay theo tren thanh bar dua vao currentProgress
                // tinh giay phut start va end cua song 
                const currentMinute = Math.floor(audio.currentTime/60); // minute
                const currentSecond = Math.floor(audio.currentTime%60); // second
                // text Time of a song | nếu số giây từ 10 > 9 => chuyển sang 0
                startTime.innerHTML = `0${currentMinute}: ${currentSecond> 9 ? currentSecond:'0'+currentSecond}`;
                // a show time in progress bar when hover
                rangeValue.innerHTML = `0${currentMinute}: ${currentSecond> 9 ? currentSecond:'0'+currentSecond}`;
                // dịch chuyển bảng time (hover) qua thanh bar khi chạy nhạc
                const range_Style_Left = currentProgress+ 1; // tăng style.left them 1.2
                rangeValue.style.left = range_Style_Left + '%'; 

                // create a progress bar with color when a song is playing
                var color = 'linear-gradient(90deg, rgb(253, 121, 168)' + progress.value + '% , rgb(214, 214, 214)' + progress.value+ '%)';
                progress.style.background = color;
                
                //cd Thumb complete percent
                const percent =currentProgress/100*180; // 100*180 => để chạy hết vòn tròn. Nếu ko, gần hết bài chỉ chạy có nửa vòn tròn.
                //console.log(percent)
                cdProgressFull.style.transform = `rotate(${percent}deg)`;
                cdProgressFill.forEach(fillElement=>{
                    fillElement.style.transform = `rotate(${percent}deg)`;
                }); 
                    
            }
        }

        //9. when a song is loading duration instantly = endTime text 
        audio.onloadeddata = function () {
            _this.songTime = audio.duration.toFixed(); // convert float to string
            var second = _this.songTime%60;
            endTime.innerHTML = `0${Math.floor(_this.songTime/60)}:${second>9 ? second:'0'+second}`;
        }

        // PROGRESS
        //10. Xử lý tiến trình bài hát khi muốn tua bằng cách kéo hoặc click vào vị trí muốn tua trên thanh bar
        // sử dụng oninput hay vi onchange => khi có sự kiện bấn vào thanh bar hoặc kéo
        progress.oninput = function (e) {
            var x = 0;
            x = e.target.value;
            const seekTime = x / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Nhấn phím right (39) => để tua (phải nhấn thanh progress mới tua đc)
        progress.onkeydown = function (e) {
            if(e.keyCode == 39) {

                progress.value ++;
            }
        }


        //13. khi audio kết thúc bài hát 
        // + kiem tra neu bat repeat thi chay lai bai hat do
        audio.onended = function () {
            if(_this.isRepeat)
            {
                audio.play();
            }
            else {
                autoNextSong(); // replace for nextBtn.clicK()
            }
        }

        //12. auto switch to a new song + use event button for next song 
        const autoNextSong = () => {
            // neu bật random
            if(_this.isRandom)
            {
                _this.playRandomSong();
            }
            else
            {
                _this.nextSong();
            }
            audio.play();
        }

    },
    // <!! end event function -->

    // 4. Xử lý load các thông tin (songs,singer,..) hiện tại -> function được sử dụng nhiều lần trong việc cần thao tác các event
    loadCurrentSong: function () {

        // const heading = $('header h2')
        // const cd.Thumb = $('.cd-thumb')
        // const audio = $('#audio')

        this.currentSong = this.songs[this.currentIndex]; // get info song in index
        heading.textContent = this.currentSong.name + +' - '+this.currentSong.singer; // show ten va singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    
    // 11. Next new a song | có thể dùng như khi nhấn nextbtn hoặc khi gần hết bài thì chuyển sang bài mới
    nextSong: function () {
        this.currentIndex++;    
        // nếu vị trí của bài hát vượt quá trong array songs => trả lại vị trí đầu tiên [0]
        if(this.currentIndex >= this.songs.length) { 
            this.currentIndex = 0;
        }
        //load render again 
        this.loadAndSave();

    },

    // 13. Previous a song
    prevSong: function () {

        this.currentIndex-= 1; // this.currentIndex--;
        // nếu bài hát ở vị trí ngoài 0 thì chuyển vị trí cuôi
        if(this.currentIndex<0) 
        {
            this.currentIndex = this.songs.length-1; 
        }
        this.loadAndSave();
    },

    // 16 . Run random songs
    playRandomSong: function () {
        let newIndex;
        do {
            // select an index randomly
            newIndex = Math.floor(Math.random()*this.songs.length);

        } while (newIndex == this.currentIndex) // nếu bị newIndex chọn bài trùng lặp bài hát 
        this.currentIndex = newIndex; //gán new index cho currentIndex 
        this.loadAndSave();  // load currentSong and render

    },

    // 18. tự động cuộn xuống trong playlist css đã active khi chuyển bài hát (effect UI)
    // - Nhớ call in event click next and prev button
    // Note: Nên viết code Xac định vị trí trong DOM HTML trong renderSong để kích hoạt active UI
    scrollToActiveSong: function () {
        // use search google => scrollIntoView
        var view ="";
        // nếu vị trị currentIndex < 2 => bât type of scroll 
        if(this.currentIndex<2) 
            view ="end";
        else
            view = "nearest";

            //use search google => scrollIntoView
            // set time 3s de auto scroll | chuẩn bị sẵn css và trỏ vào div có class đã active
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior: "smooth",
                    block: view ,
                })
            },300); // 3 second

    },

    // 20+21. Xử lý volumeIcon để show icon khac nhau
    volumeIconHandle: function () {
        const volume = this.songVolume;
        // show mỗi icon Volume khác nhau khi chỉnh to nhỏ
        // nếu vol > 50
        if(volume>50) volumeIcon.innerHTML ='<i class="fas fa-volume-up"></i>';
        else {
            if(volume>=5&&volume<=50) volumeIcon.innerHTML='<i class="fas fa-volume-down"></i>'
            else volumeIcon.innerHTML='<i class="fas fa-volume-mute"></i>'
        }
    },
    // 21. Load volume => hiện thị volume trong DOM HTML
    volumeLoad: function(){
        ///Volume 
        this.songVolume=this.config.volume;
        volumeSet.value=this.songVolume;
        var volumeColor='linear-gradient(90deg, rgb(233, 72, 115)' +this.songVolume+'%, rgb(214, 214, 214) '+this.songVolume+'%)';
        volumeSet.style.background=volumeColor;   
        //Icon
        this.volumeIconHandle();
       
    },
   
    //26. Xử lý reload khi nhấn F5 
    reloadHandle: function(){
        // // first load
        // console.log(this.config.currentIndex);
        // if(this.config.currentIndex == undefined) 
        // {   
        //     console.log("NOOOOOOOOO");
        //     this.currentIndex = 0;
        //     this.config.volume =100;
        // } 
        // else {
        //     this.currentIndex = this.config.currentIndex;
        //     this.isRandom=this.config.isRandom;
        //     this.isRepeat=this.config.isRepeat;
        // }

        // hiện trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active',this.isRandom);
        repeatBtn.classList.toggle('active',this.isRepeat);
    },

    /* Load currentSong and Render */
    loadAndSave: function () {
        this.setConfig("currentSong", this.currentIndex);
        this.loadCurrentSong()
        this.renderSong()

    },

    start:function() {

        this.reloadHandle();
        this.volumeLoad();
        this.loadAndSave();
        this.handleEvents(); 
        

    }
}

// RUN APP
app.start()
