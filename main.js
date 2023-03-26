/*
1. render songs --> ok
2. scroll top --> ok
3. play / pause / seek --> !ok (Fix lỗi khi tua bài hát, click giữ một chút sẽ thấy lỗi, 
    vì event updatetime nó liên tục chạy dẫn tới lỗi)
4. CD rotate --> ok
5. next / prev --> ok
6. random --> !ok (Hạn chế tối đa bài hát bị lặp lại)
7. next / repeat when ended --> ok
8. active song --> ok
9. scroll active song into view --> ok
10. play song when click --> ok
11. Lưu lại vị trí bài hát đang nghe, F5 lại ứng dụng không bị quay trở về bài đầu tiên
12. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const cd = $(".cd");
const playlist = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  listIndexSongPlayed: [],
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "2AM",
      singer: "JustaTee x Big Daddy",
      path: "./assets/music/2AM-JustaTee-BigDaddy.mp3",
      image: "./assets/images/2am-image.jpg",
    },
    {
      name: "Anh nhớ ra",
      singer: "Vũ x Trang",
      path: "./assets/music/Anh-Nho-Ra.mp3",
      image: "./assets/images/anh-nho-ra-image.jpg",
    },
    {
      name: "Bài này chill phết",
      singer: "Đen ft. MIN",
      path: "./assets/music/Bai-Nay-Chill-Phet.mp3",
      image: "./assets/images/bai-nay-chill-phet-image.jpg",
    },
    {
      name: "Có không giữ mất đừng tìm",
      singer: "Trúc Nhân",
      path: "./assets/music/Co-Khong-Giu-Mat-Dung-Tim.mp3",
      image: "./assets/images/co-khong-giu-mat-dung-tim-image.jpg",
    },
    {
      name: "Cứ chill thôi",
      singer: "Chillies ft Suni Hạ Linh & Rhymastic",
      path: "./assets/music/Cu-Chill-Thoi.mp3",
      image: "./assets/images/cu-chill-thoi-image.jpg",
    },
    {
      name: "Đi về nhà",
      singer: "Đen x JustaTee",
      path: "./assets/music/Di-Ve-Nha.mp3",
      image: "./assets/images/di-ve-nha-image.jpg",
    },
    {
      name: "Đưa nhau đi trốn",
      singer: "Đen ft. Linh Cáo",
      path: "./assets/music/Dua-Nhau-Di-Tron.mp3",
      image: "./assets/images/dua-nhau-di-tron-image.jpg",
    },
    {
      name: "Em bé",
      singer: "AMEE x KARIK",
      path: "./assets/music/Em-Be.mp3",
      image: "./assets/images/em-be-image.jpg",
    },
    {
      name: "Gieo quẻ",
      singer: "Hoàng Thuỳ Linh & ĐEN",
      path: "./assets/music/Gieo-Que.mp3",
      image: "./assets/images/gieo-que-image.jpg",
    },
    {
      name: "Mang tiền về cho mẹ",
      singer: "Đen ft. Nguyên Thảo",
      path: "./assets/music/Mang-Tien-Ve-Cho-Me.mp3",
      image: "./assets/images/mang-tien-ve-cho-me-image.jpg",
    },
    {
      name: "Mượn rượu tỏ tình",
      singer: "BIGDADDY x EMILY",
      path: "./assets/music/Muon-Ruou-To-Tinh.mp3",
      image: "./assets/images/muon-ruou-to-tinh-image.jpg",
    },
    {
      name: "Yêu 5",
      singer: "Rhymastic",
      path: "./assets/music/Yeu-5-Rhymastic.mp3",
      image: "./assets/images/yeu5-image.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay/ dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds(Thời gian đĩa quay)
      iterations: Infinity, // loop bao nhiêu lần
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua xong
    progress.onchange = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };

    // Khi next xong
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev xong
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }

      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý khi bật tắt random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý khi repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const optionSongNode = e.target.closest(".option");
      if (songNode || optionSongNode) {
        // Xử lý khi click vào song trong playlist
        if (songNode && !optionSongNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào optionSongNode
        if (optionSongNode) {
        }
      }
    };
  },

  // Hàm scroll active song into view (hiển thị bài hát đang phát vào trong khung nhìn)
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: this.currentIndex < 6 ? "end" : "nearest",
      });
    }, 300);
  },

  // Hàm load bài hát hiện tại
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    this.setConfig("currentIndex", this.currentIndex);
  },

  // Hàm load cấu hình ban đầu
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.currentIndex = this.config.currentIndex || 0;
  },

  // Hàm next bài hát tiếp theo
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  // Hàm previous bài hát
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  // Hàm random song
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (
      newIndex === this.currentIndex ||
      this.listIndexSongPlayed.includes(newIndex)
    );
    if (!this.listIndexSongPlayed.includes(newIndex)) {
      this.listIndexSongPlayed.push(newIndex);
    }
    if (this.listIndexSongPlayed.length === this.songs.length) {
      this.listIndexSongPlayed = [];
    }
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình ban đầu từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat và random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
    this.scrollToActiveSong();
  },
};

app.start();
