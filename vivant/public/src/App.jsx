import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ImageCrawl from './test'
import TestSvg from './ExtractSvg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ImageCrawl/>
      <TestSvg/>
    </>
  )
}

export default App
