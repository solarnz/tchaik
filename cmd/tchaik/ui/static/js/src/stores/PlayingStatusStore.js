'use strict';

import {ChangeEmitter} from '../utils/ChangeEmitter.js';
import AppDispatcher from '../dispatcher/AppDispatcher';

import NowPlayingConstants from '../constants/NowPlayingConstants.js';
import PlaylistConstants from '../constants/PlaylistConstants.js';

import NowPlayingStore from '../stores/NowPlayingStore.js';


var _defaultTrackState = {
  buffered: 0.0,
  duration: 0.0,
  error: null,
};
var _trackState = _defaultTrackState;

var _currentTime = null;

function setCurrentTime(time) {
  _currentTime = time;
  localStorage.setItem("currentTime", time);
}

function currentTime() {
  if (_currentTime !== null) {
    return _currentTime;
  }

  _currentTime = 0;
  var t = localStorage.getItem("currentTime");
  if (t !== null) {
    _currentTime = parseFloat(t);
  }
  return _currentTime;
}


class PlayingStatusStore extends ChangeEmitter {
  getTime() {
    return currentTime();
  }

  getBuffered() {
    return _trackState.buffered;
  }

  getDuration() {
    return _trackState.duration;
  }

  getError() {
    return _trackState.error;
  }
}

var _playingStatusStore = new PlayingStatusStore();

_playingStatusStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
  var source = payload.source;

  if (source === 'VIEW_ACTION') {
    switch (action.actionType) {

    case NowPlayingConstants.ENDED:
      if (action.source !== "playlist") {
        break;
      }
      /* falls through */
    case PlaylistConstants.PREV:
      /* falls through */
    case PlaylistConstants.NEXT:
      /* falls through */
    case PlaylistConstants.PLAY_NOW:
      /* falls through */
    case NowPlayingConstants.SET_CURRENT_TRACK:
        AppDispatcher.waitFor([
          NowPlayingStore.dispatchToken,
        ]);
        setCurrentTime(0);
        _playingStatusStore.emitChange();
        break;

      case NowPlayingConstants.RESET:
        _trackState = {
          buffered: 0,
          duration: 0,
          error: null,
        };
        _playingStatusStore.emitChange();
        break;

      case NowPlayingConstants.SET_ERROR:
        _trackState.error = action.error;
        _playingStatusStore.emitChange();
        break;

      case NowPlayingConstants.SET_DURATION:
        _trackState.duration = action.duration;
        _playingStatusStore.emitChange();
        break;

      case NowPlayingConstants.SET_BUFFERED:
        _trackState.buffered = action.buffered;
        _playingStatusStore.emitChange();
        break;

      case NowPlayingConstants.STORE_CURRENT_TIME:
        setCurrentTime(action.currentTime);
        _playingStatusStore.emitChange();
        break;

      default:
        break;
    }
  }

  return true;
});

export default _playingStatusStore;
