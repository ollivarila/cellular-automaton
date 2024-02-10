import { ComponentProps } from 'react'

type ControlPanelProps = ComponentProps<'div'> & {
  paused: boolean
  togglePause: () => void
  simulationSpeed: number
  setSimulationSpeed: (speed: number) => void
  reset: () => void
}

export default function ControlPanel({
  paused,
  togglePause,
  simulationSpeed,
  setSimulationSpeed,
  reset,
}: ControlPanelProps) {
  return (
    <div className="flex gap-4 p-4 bg-slate-300 w-fit rounded mt-8 ml-8">
      <button className="bg-slate-500 p-2 pt-1 pb-1 rounded-md" onClick={togglePause}>
        {paused ? 'Start' : 'Pause'}
      </button>
      <button className="bg-slate-500 p-2 pt-1 pb-1 rounded-md" onClick={reset}>
        Reset
      </button>
      <div className="flex flex-col">
        <label htmlFor="speed">Speed {simulationSpeed} ms</label>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}
