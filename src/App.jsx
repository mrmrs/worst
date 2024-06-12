import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="text-color background-color" style={{ textAlign: 'center', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>WORST GAMES</p>
      </div>
    </>
  )
}

export default App
