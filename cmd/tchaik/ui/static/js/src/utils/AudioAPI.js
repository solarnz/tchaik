'use strict';

var NowPlayingConstants = require('../constants/NowPlayingConstants.js');
var NowPlayingActions = require('../actions/NowPlayingActions.js');
var NowPlayingStore = require('../stores/NowPlayingStore.js');

var PlayingStatusStore = require('../stores/PlayingStatusStore.js');

var VolumeStore = require('../stores/VolumeStore.js');

class AudioController {
  constructor() {
    this._audio = new Audio();
    this._src = null;
    this._playing = false;

    this._audio.addEventListener('error', this.onPlayerError);
    this._audio.addEventListener('progress', this.onPlayerProgress);
    this._audio.addEventListener('play', this.onPlayerPlay);
    this._audio.addEventListener('pause', this.onPlayerPause);
    this._audio.addEventListener('ended', this.onPlayerEnded);
    this._audio.addEventListener('timeupdate', this.onPlayerTimeupdate);
    this._audio.addEventListener('loadedmetadata', this.onPlayerLoadedmetadata);
    this._audio.addEventListener('loadstart', this.onPlayerLoadstart);
  }

  buffered() {
    return this._audio.buffered;
  }

  playing() {
    return this._playing;
  }

  play() {
    this._audio.play();
    this._playing = true;
  }

  pause() {
    this._audio.pause();
    this._playing = false;
  }

  load() {
    this._audio.load();
  }

  src() {
    return this._src;
  }

  setSrc(l) {
    this._src = l;
    this._audio.src = l;
  }

  setCurrentTime(t) {
    this._audio.currentTime = t;
  }

  currentTime() {
    return this._audio.currentTime;
  }

  setVolume(v) {
    this._audio.volume = v;
  }

  volume() {
    return this._audio.volume;
  }

  duration() {
    return this._audio.duration;
  }

  addEventListener(...args) {
    return this._audio.addEventListener.apply(this._audio, args);
  }

  onPlayerError(evt) {
    console.error("Error received from Audio component:", evt);
  }

  onPlayerProgress(evt) {
    var range = currentAudio.buffered();
    if (range.length > 0) {
      NowPlayingActions.setBuffered(range.end(range.length-1));
    }
  }

  onPlayerPlay(evt) {
    NowPlayingActions.playing(true);
  }

  onPlayerPause(evt) {
    NowPlayingActions.playing(false);
  }

  onPlayerEnded(evt) {
    NowPlayingActions.ended(NowPlayingStore.getSource());
  }

  onPlayerTimeupdate(evt) {
    NowPlayingActions.currentTime(currentAudio.currentTime());
  }

  onPlayerLoadedmetadata(evt) {
    NowPlayingActions.setDuration(currentAudio.duration());

    currentAudio.setCurrentTime(PlayingStatusStore.getTime());
    currentAudio.play();
  }

  onPLayerLoadstart(evt) {
    NowPlayingActions.reset();
  }
}

var currentAudio = new AudioController();

function init() {
  NowPlayingStore.addChangeListener(update);
  NowPlayingStore.addControlListener(_onNowPlayingControl);
  VolumeStore.addChangeListener(_onVolumeChange);

  update();
  _onVolumeChange();
}

function _onNowPlayingControl(type, value) {
  if (type === NowPlayingConstants.SET_CURRENT_TIME) {
    currentAudio.setCurrentTime(value);
  }
}

function update() {
  var track = NowPlayingStore.getTrack();
  if (track) {
    var source = "/track/"+track.TrackID;
    var orig = currentAudio.src();
    if (orig !== source) {
      currentAudio.setSrc(source);
      currentAudio.load();
      if (orig !== null) {
        currentAudio.play();
      }
    }
  }

  var prevPlaying = currentAudio.playing();
  var nowPlaying = NowPlayingStore.getPlaying();
  if (prevPlaying !== nowPlaying) {
    if (nowPlaying) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
  }
}

function _onVolumeChange() {
  var v = VolumeStore.getVolume();
  if (currentAudio.volume() !== v) {
    currentAudio.setVolume(v);
  }
}


var AudioAPI = {

  init: function() {
    init();
  },

};

module.exports = AudioAPI;
