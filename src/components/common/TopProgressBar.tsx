import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function TopProgressBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(25)

    const timer1 = setTimeout(() => setProgress(65), 100)
    const timer2 = setTimeout(() => setProgress(90), 250)
    const timer3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setVisible(false), 200)
    }, 400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 transition-all duration-200 ease-out shadow-sm shadow-cyan-400/50"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
