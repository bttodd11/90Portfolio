import Preloader from './component/preloader/preloader';
import Main from './component/main/main';
import Skills from './component/skills/skills';
import Contact from './component/contact/contact';
import Links from './component/nav/nav';


import './App.css';

function App() {

  return (
    <div className="App">
      <div className='preload'>
          <Preloader/>
          </div>
          <div className='mainDiv'>
          <Links />
        <Main />
        <Skills />
        <Contact />
        </div>
    </div>
  );
}

export default App;
