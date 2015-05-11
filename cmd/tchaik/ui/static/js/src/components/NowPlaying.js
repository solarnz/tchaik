'use strict';

var React = require('react/addons');

var classNames = require('classnames');

var Icon = require('./Icon.js');
var TimeFormatter = require('./TimeFormatter.js');
var GroupAttributes = require('./GroupAttributes.js');
var ArtworkImage = require('./ArtworkImage.js');

var NowPlayingStore = require('../stores/NowPlayingStore.js');
var NowPlayingActions = require('../actions/NowPlayingActions.js');

var PlayingStatusStore = require('../stores/PlayingStatusStore.js');

function getNowPlayingState() {
  return {
    track: NowPlayingStore.getTrack(),
    buffered: PlayingStatusStore.getBuffered(),
    duration: PlayingStatusStore.getDuration(),
    currentTime: PlayingStatusStore.getTime(),
    error: PlayingStatusStore.getError(),
  };
}

var NowPlaying = React.createClass({
  getInitialState: function() {
    return getNowPlayingState();
  },

  componentDidMount: function() {
    NowPlayingStore.addChangeListener(this._onChange);
    PlayingStatusStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    NowPlayingStore.removeChangeListener(this._onChange);
    PlayingStatusStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var track = this.state.track;
    if (track === null) {
      return null;
    }

    var fields = ['Album', 'Artist', 'Year'];
    var attributeArr = [];
    fields.forEach(function(f) {
      if (track[f]) {
        attributeArr.push(track[f]);
      }
    });

    var attributes = <GroupAttributes list={attributeArr} />;
    var remainingTime = parseInt(this.state.duration) - parseInt(this.state.currentTime);

    var className = classNames({
      'now-playing-track': true,
      'error': (this.state.error !== null),
    });

    return (
      <div className={className}>
        <ArtworkImage path={"/artwork/" + track.TrackID} />
        <div className="track-info">
          <div className="title">{track.Name}<a className="goto" href={"#track_"+track.TrackID}><Icon icon="share-alt" /></a></div>
          {attributes}

          <PlayProgress markerWidth={2} current={this.state.currentTime} duration={this.state.duration} buffered={this.state.buffered} setCurrentTime={NowPlayingActions.setCurrentTime} />
          <div className="times">
            <TimeFormatter className="currentTime" time={this.state.currentTime} />
            <TimeFormatter className="remaining" time={remainingTime} />
          </div>
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getNowPlayingState());
  }
});

function _getOffsetLeft(elem) {
    var offsetLeft = 0;
    do {
      if (!isNaN(elem.offsetLeft)) {
          offsetLeft += elem.offsetLeft;
      }
    } while ((elem = elem.offsetParent));
    return offsetLeft;
}

var PlayProgress = React.createClass({
  propTypes: {
    markerWidth: React.PropTypes.number.isRequired,
    current: React.PropTypes.number.isRequired,
    buffered: React.PropTypes.number.isRequired,
    duration: React.PropTypes.number.isRequired,
  },

  render: function() {
    var wpc = (this.props.current / this.props.duration) * 100;
    var w = "calc("+Math.min(wpc, 100.0)+"% - " + this.props.markerWidth + "px)";
    var bpc = (this.props.buffered / this.props.duration) * 100 - wpc;
    var b = "calc("+Math.min(bpc, 100.0)+"% - " + this.props.markerWidth + "px)";

    return (
      <div className="playProgress" onMouseDown={this._onMouseDown} onWheel={this._onWheel}>
        <div className="bar">
          <div className="current" style={{width: w}} />
          <div className="marker" style={{width: this.props.markerWidth}} />
          <div className="buffered" style={{width: b}} />
        </div>
      </div>
    );
  },

  _onMouseDown: function(evt) {
    // Only proceed on left mouse button clicks.
    if (evt.button === 0) {
      var pos = evt.pageX - _getOffsetLeft(evt.currentTarget);
      var width = evt.currentTarget.offsetWidth;
      this.props.setCurrentTime((pos / width) * this.props.duration);
    }
  },

  _onWheel: function(evt) {
    evt.stopPropagation();
    var t = this.props.current + (0.01 * this.props.duration * evt.deltaY);
    if (t > this.props.duration) {
      t = this.props.duration;
    } else if (t < 0.00) {
      t = 0.0;
    }
    this.props.setCurrentTime(t);
  },
});

module.exports = NowPlaying;
