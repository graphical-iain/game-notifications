import { useEffect, useRef, useState } from 'react';
import './App.css';
import logo from './assets/crosshair.svg';
import { Dropzone } from './helpers/dropzone';
import { loadCSV, parseCSV } from './helpers/helpers';
import { Row } from './helpers/types';

// time in between ticks, in ms.
const tickRate = 100;

function App() {
  const crosshair = useRef<HTMLImageElement>(null)
  const [messageList, setMessageList] = useState<Row[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Row[]>([]);

  const [tick, setTick] = useState<number>(0);
  const [startTick, setStartTick] = useState<boolean>(false);
  const [messagesShown, setMessagesShown] = useState<number>(0);
  const body = document.querySelector('body');


  document.querySelector('body')?.requestFullscreen({ navigationUI: 'hide' });


  // to ensure all items are displayed, we'll use a time ticker
  useEffect(() => {
    // every tick verify we should continue ticking
    if (startTick) {
      body?.classList.add('going-through-list');
      setTimeout(() => { setTick(tick + tickRate); }, tickRate);
    } else {
      body?.classList.remove('going-through-list');
    }
  }, [tick, startTick, body]);

  // when there are messages in the queue, start the tick.
  // stop ticking when there's no more messages.
  useEffect(() => {
    if (messageList.length) {
      setStartTick(true);
    } else {
      setStartTick(false);
      setTick(0);
    }
  }, [messageList]);

  // on each tick, filter out the messages that shouldn't show yet, or should have already been hiden
  useEffect(() => {
    const timeToShowUp = messageList.filter(message => message.startDelay <= tick) || [];
    if (timeToShowUp.length > messagesShown) {
      setMessagesShown(timeToShowUp.length);
    }
    // get messages that should be shown.
    const notAHasbeen = timeToShowUp.filter(message => message.startDelay + message.duration >= tick);
    // sort by priority before showing
    setCurrentMessages(notAHasbeen.sort((a, b) => a.priority - b.priority));

    // if there's no messages left to be shown, cleanup
    if (!notAHasbeen.length && timeToShowUp.length >= messageList.length) {
      setMessageList([]);

      document.exitFullscreen();
      setMessagesShown(0);
      const body = document.querySelector('body');
      body?.classList.remove('going-through-list');
    }
  }, [tick])

  // do the animation on the crosshair!
  useEffect(() => {
    // no need to animate if the change was a removal
    if (messagesShown > 0) {
      // add/remove the fire class to do the animation
      crosshair.current?.classList.remove('fire');
      setTimeout(() => {
        crosshair.current?.classList.add('fire');

        setTimeout(() => {
          crosshair.current?.classList.remove('fire');
        }, 200);
      }, 10);
    }
  }, [messagesShown]);


  /**
   * handle receive csv
   * sets the message list
   * @param file
   */
  const handleReceiveCSV = (file: File) => {
    loadCSV(file).then(val => {
      document.querySelector('body')?.requestFullscreen({ navigationUI: 'hide' });
      setMessageList(val);
    })
  }

  /**
   * Loads the test data nd then sets it to the message list
   */
  const useTestData = () => {
    const testData = require('./assets/testData.csv');
    document.querySelector('body')?.requestFullscreen({ navigationUI: 'hide' });
    fetch(testData).then(res => res.text()).then(content => {
      setMessageList(parseCSV(content));
    })
  }

  return (
    <div className="App">
      <Dropzone onFileReceived={handleReceiveCSV}>
        <header className="App-header">
          <div ref={crosshair} className={`idleAnimation${!currentMessages.length ? ' waiting' : ''} `}>
            <div className="logo-wrapper">
              <img src={logo} className="App-logo side-1" alt="logo" />
              <img src={logo} className="App-logo side-2" alt="logo" />
              <img src={logo} className="App-logo side-3" alt="logo" />
              <img src={logo} className="App-logo side-4" alt="logo" />
              <img src={logo} className="App-logo side-5" alt="logo" />
              <img src={logo} className="App-logo side-6" alt="logo" />
            </div>
          </div>

          {!messageList?.length &&
            <label htmlFor="uploadCSV">
              <p>
                Drop your CSV or <button type="button" className='inline-button' onClick={useTestData}>use sample CSV</button>.
              </p>
              <aside>
                <small>
                  Rows in the CSV should be formatted as follows:
                  <blockquote>{'<Text>,<Priority>,<Duration>,<Start Time>'}</blockquote>
                  <em>e.g. Headshot,3,200,5000</em>
                </small>
              </aside>
            </label>
          }
          <div aria-live="polite"
            aria-atomic="true"
            aria-relevant="additions">
            {currentMessages.map((mes, index) => {
              return <p key={index} className='notification'>
                {mes?.text}
              </p>
            })
            }
          </div>

        </header>
      </Dropzone>
    </div>
  );
}

export default App;
