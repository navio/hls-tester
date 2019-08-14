import React, { Component } from 'react';
import { render } from 'react-dom';
import RC from 'ripcity';
import Hls from 'hls.js';
import 'ripcity/dist/styles.css';

const originalStream = "https://audiblefmp4poc-a.akamaihd.net/heaac_v2_22_32.m3u8";
/* [
"https://d206c4y6cx10lo.cloudfront.net/bk_rnzf_000038_22_32.m3u8?startPosition=0&endPosition=12",
"https://d206c4y6cx10lo.cloudfront.net/bk_reco_004353_22_32.m3u8",
'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8'
] */


const cleanObject = (obj) => {
  let cache = [];
  let cleanObj = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) return;
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return cleanObj;
};

const isURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

class App extends Component {
  constructor() {
    super();
    this.hls = new Hls();

    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.video.play();
      this.setState({ error: '' });
    });
    this.hls.on(Hls.Events.ERROR, (error) => {
      this.setState({ error });
    })

    Object.keys(Hls.Events).forEach((ev) => this.hls.on(Hls.Events[ev], (hola, data) => {
      console.log(ev, hola, data);
      this.setState({ currentevent: ev, currenteventData: cleanObject(data) });
    }));


    this.video = document.getElementById('video');


    this.state = {
      stream: originalStream,
      error: null,
      isPlaying: false,
      ready: true,
      button: 'Play'
    };
    this.toggleMe = this.toggleMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
  }

  toggleMe() {
    if (this.state.isPlaying) {
      this.setState({button:'Play',isPlaying: false})
      this.video.pause();
    } else {

      if (isURL(this.state.stream)) {
        this.hls.loadSource(this.state.stream);
        this.hls.attachMedia(this.video);
        this.video.play();
        this.setState({
          'isPlaying': !this.state.isPlaying,
          'button': (this.state.isPlaying ? 'Play' : 'Pause'),
          error: ''
        });
      }else{
                this.setState({ error: 'Invalid URL!!' });
      }
    }
  }

  updateMe(ev) {
    this.video.pause();
      this.setState({
        stream: ev.target.value,
        button: 'Play',
        isPlaying: false,
        error: isURL(ev.target.value) ? '' : 'Invalid URL'
      });
    

  }

  render() {
    return (<RC.Container>
      <RC.Heading>HLS Tester</RC.Heading>
      <RC.Box hasBorder={true} spacingTop="base">
        <RC.GridRow textColor="secondary">
          Paste the stream URL
        </RC.GridRow>
        <RC.GridRow spacingTop="mini">
          <RC.GridColumn gridUnits={8}>
            <RC.TextInput

              placeholder="Stream"
              onChange={this.updateMe}
              value={this.state.stream}
            />
          </RC.GridColumn>
          <RC.GridColumn gridUnits={4}>
            <RC.Button onClick={this.toggleMe}
              buttonType="primary">
              {this.state.button}
            </RC.Button>
          </RC.GridColumn>
        </RC.GridRow>
      </RC.Box>
      <RC.Box>
        <RC.Text textBold={true} textColor="error">
          {this.state.error}
        </RC.Text><br />
        <RC.Text textBold={true} textColor="link">
          {this.state.currentevent}</RC.Text><br />
        <RC.Text textBold={true} textColor="base">
          {this.state.currenteventData}
        </RC.Text>
      </RC.Box>
    </RC.Container>
    );
  }
}

render(<App />, document.getElementById('root'));
