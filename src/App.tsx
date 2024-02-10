import CanvasController from './CanvasController'
import ControlPanel from './components/ControlPanel'
import Game from './components/Game'
import { useEffect, useState } from 'react'
import { useRef } from 'react'

export default function App() {
  const [paused, setPaused] = useState<boolean>(false)
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1000)
  const controllerRef = useRef<CanvasController | null>(null)

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setSimulationSpeed(simulationSpeed)
    }
  }, [controllerRef, simulationSpeed])

  useEffect(() => {
    if (controllerRef.current) {
      if (paused) {
        controllerRef.current.stop()
      } else {
        controllerRef.current.start()
      }
    }
  }, [paused, controllerRef])

  const reset = () => {
    if (controllerRef.current) {
      controllerRef.current.reset()
    }
  }

  return (
    <main>
      {/* <h1 className="text-4xl">Conway's game of life</h1> */}
      <ControlPanel
        paused={paused}
        simulationSpeed={simulationSpeed}
        togglePause={() => setPaused(!paused)}
        setSimulationSpeed={setSimulationSpeed}
        reset={reset}
      />
      <Game controllerRef={controllerRef} />
    </main>
  )
}
