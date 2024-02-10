import { ComponentProps, useEffect, useRef } from 'react'
import CanvasController from '../CanvasController'

type GameProps = ComponentProps<'canvas'> & {
  controllerRef: React.MutableRefObject<CanvasController | null>
}

export default function Game({ controllerRef }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const created = new CanvasController(canvasRef.current)
    controllerRef.current = created
    return () => created.destroy()
  }, [controllerRef])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 -z-10"></canvas>
}
