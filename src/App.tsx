import { useEffect, useRef, useState } from 'react';
import './App.css';
import logo from './assets/crosshair.svg';
import { Dropzone } from './helpers/dropzone';
import { loadCSV, parseCSV } from './helpers/helpers';
import { Row } from './helpers/types';

const tickRate = 100;

function App() {
  const crosshair = useRef<HTMLImageElement>(null)
  const [messageList, setMessageList] = useState<Row[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Row[]>([]);

  const [tick, setTick] = useState<number>(0);
  const [startTick, setStartTick] = useState<boolean>(false);
  const [messagesShown, setMessagesShown] = useState<number>(0);
  const body = document.querySelector('body');

  useEffect(() => {
    if (startTick) {
      body?.classList.add('going-through-list');
      setTimeout(() => { setTick(tick + tickRate); }, tickRate);
    } else {
      body?.classList.remove('going-through-list');
    }
  }, [tick, startTick, body]);

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
      setMessagesShown(0);
      const body = document.querySelector('body');
      body?.classList.remove('going-through-list');
    }
  }, [tick])

  useEffect(() => {
    if (messagesShown > 0) {
      if (crosshair.current?.classList.contains('fire')) {
        crosshair.current?.classList.remove('fire');
        setTimeout(() => {
          crosshair.current?.classList.add('fire');

          setTimeout(() => {
            crosshair.current?.classList.remove('fire');
          }, 100);
        }, 100);
      } else {
        crosshair.current?.classList.add('fire');

        setTimeout(() => {
          crosshair.current?.classList.remove('fire');
        }, 100)
      }
    }
  }, [messagesShown]);

  useEffect(() => {
    console.log(messageList);
    if (messageList.length) {
      setStartTick(true);
    } else {
      setStartTick(false);
      setTick(0);
    }
  }, [messageList]);

  const handleReceiveCSV = (file: File) => {
    loadCSV(file).then(val => {
      setMessageList(val);
    })
  }

  const useTestData = () => {
    const testData = require('./assets/testData.csv');
    fetch(testData).then(res => res.text()).then(content => {
      setMessageList(parseCSV(content));
    })
  }

  return (
    <div className="App">
      <Dropzone onFileReceived={handleReceiveCSV}>
        <header className="App-header">
          <div className={`idleAnimation${!currentMessages.length ? ' waiting' : ''}`}>
            <img ref={crosshair} src={logo} className="App-logo" alt="logo" />
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

          {currentMessages.map((mes, index) => {
            return <p key={index} className='notification'>
              {mes?.text}
            </p>
          })
          }

        </header>
      </Dropzone>
    </div>
  );
}

export default App;
