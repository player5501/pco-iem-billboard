import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const sortOrder = [
      'vox 1', 'keys', 'eg2', 'ag', 'vox 5',
      'vox 6', 'vox 7', 'vox 8', 'bass', 'drums', 'strings'
    ]

    const fetchData = () => {
      fetch('/api/redistributed')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch classifications')
          }
          return res.json()
        })
        .then(data => {
          const sortedData = [...data].sort((a, b) => {
            const indexA = sortOrder.indexOf(a.iemClassification.toLowerCase())
            const indexB = sortOrder.indexOf(b.iemClassification.toLowerCase())

            // If both are in the list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB

            // If only A is in the list, it comes first
            if (indexA !== -1) return -1

            // If only B is in the list, it comes first
            if (indexB !== -1) return 1

            // If neither is in the list, keep original order (or sort alphabetically if preferred)
            return 0
          })
          setClassifications(sortedData)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError(err.message)
          setLoading(false)
        })
    }

    fetchData() // Initial fetch

    const intervalId = setInterval(fetchData, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    let timeoutId

    const handleActivity = () => {
      document.body.classList.remove('hide-cursor')
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        document.body.classList.add('hide-cursor')
      }, 1000)
    }

    // Initial trigger to start the timer
    handleActivity()

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      clearTimeout(timeoutId)
    }
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  const splitIndex = Math.ceil(classifications.length / 2)
  const row1 = classifications.slice(0, splitIndex)
  const row2 = classifications.slice(splitIndex)

  return (
    <div className="container">
      <div className="row">
        {row1.map((person, index) => (
          <div key={index} className="column" style={{ backgroundImage: `url(${person.photo})` }}>
            <div className="overlay">
              <div className="name">{person.name}</div>
              <div className="classification">{person.iemClassification}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        {row2.map((person, index) => (
          <div key={index} className="column" style={{ backgroundImage: `url(${person.photo})` }}>
            <div className="overlay">
              <div className="name">{person.name}</div>
              <div className="classification">{person.iemClassification}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
