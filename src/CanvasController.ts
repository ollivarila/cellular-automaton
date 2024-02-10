type Cells = Array<Array<boolean>>

export default class CanvasController {
  private ctx: CanvasRenderingContext2D
  private listeners: Array<(e: MouseEvent) => void> = []
  private cells: Cells = []
  private simulationSpeed = 1000
  private intervalId: number | null = null

  private readonly CELL_SIZE = 25
  private readonly BG_COLOR = '#202020'
  private readonly CELL_COLOR = '#ffffff'

  // TODO infinite area
  // TODO camera

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context from canvas')
    }
    this.ctx = ctx
    this.init(canvas)
  }

  private init(canvas: HTMLCanvasElement) {
    // Fill the window
    this.ctx.canvas.width = window.innerWidth
    this.ctx.canvas.height = window.innerHeight

    // Set the background color
    this.ctx.fillStyle = this.BG_COLOR
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

    // Init cells
    this.resetCells()
    const rows = this.cells.length
    const cols = this.cells[0].length
    console.log(`Created Rows: ${rows} Cols: ${cols} grid`)

    // Listeners for clicks
    const listener = this.createClickHandler()
    this.listeners.push(listener)
    canvas.addEventListener('click', listener)
  }

  private resetCells() {
    // Add 1 extra because we want to be able to click anywhere
    const rows = Math.floor(this.ctx.canvas.height / this.CELL_SIZE) + 1
    const cols = Math.floor(this.ctx.canvas.width / this.CELL_SIZE) + 1
    for (let i = 0; i < rows; i++) {
      this.cells[i] = []
      for (let j = 0; j < cols; j++) {
        this.cells[i][j] = false
      }
    }
  }

  private createClickHandler() {
    const render = this.renderCells.bind(this)
    return (e: MouseEvent) => {
      const pos = { x: e.clientX, y: e.clientY }
      const { col, row } = findCell(pos, this.CELL_SIZE)
      this.cells[row][col] = !this.cells[row][col]
      render()
    }
  }

  private renderCells() {
    const rows = this.cells.length
    const cols = this.cells[0].length
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const alive = this.cells[i][j]
        this.ctx.fillStyle = alive ? this.CELL_COLOR : this.BG_COLOR
        this.ctx.fillRect(j * this.CELL_SIZE, i * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE)
      }
    }
  }

  start() {
    if (this.intervalId) {
      return
    }
    const simulate = () => {
      this.cells = evalCells(this.cells)
      this.renderCells()
    }
    this.intervalId = setInterval(simulate.bind(this), this.simulationSpeed)
  }

  print() {
    const grid = this.cells.map((row) => row.map((cell) => (cell ? 'D' : 'A')).join('')).join('\n')
    console.log(grid)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.intervalId = null
  }

  getInterval() {
    return this.simulationSpeed
  }

  setSimulationSpeed(interval: number) {
    const num = Math.ceil(interval)
    this.simulationSpeed = Math.max(num, 10)
    if (this.intervalId) {
      this.stop()
      this.start()
    }
  }

  reset() {
    this.resetCells()
    this.renderCells()
  }

  destroy() {
    this.listeners.forEach((listener) => {
      this.ctx.canvas.removeEventListener('click', listener)
    })

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}

type Coords = {
  x: number
  y: number
}

function findCell({ x, y }: Coords, size: number) {
  return {
    col: Math.floor(x / size),
    row: Math.floor(y / size),
  }
}

type CellPos = {
  row: number
  col: number
}

function evalCells(cells: Cells): Cells {
  return cells.map((row, rowIdx) =>
    row.map((_, colIdx) => {
      const cellPos: CellPos = {
        row: rowIdx,
        col: colIdx,
      }
      const neighbors = findNeighbors(cellPos, cells)
      return evalCell(neighbors, cells, rowIdx, colIdx)
    }),
  )
}

function evalCell(neighbors: CellPos[], cells: Cells, row: number, col: number): boolean {
  const nAlive = neighbors
    .map(({ row, col }) => cells[row][col])
    .map((cell) => (cell ? 1 : 0) as number)
    .reduce((acc, curr) => acc + curr, 0)

  // If precisely 3, then becomes alive
  if (nAlive === 3) {
    return true
  }

  // If 0 or 1, then dies
  if (nAlive <= 1) {
    return false
  }

  // If 4 or more, then dies
  if (nAlive >= 4) {
    return false
  }

  // If 2 or 3, then survives
  if (nAlive === 2 || nAlive === 3) {
    return cells[row][col]
  }

  console.log('ERROR: could not compute cell state with neighbors: ', nAlive)
  return false
}

function findNeighbors({ row, col }: CellPos, cells: Cells) {
  const neighbors: CellPos[] = []
  const rows = cells.length
  const cols = cells[0].length
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) {
        continue
      }
      const inBottomRightBounds = col + i < cols && row + j < rows
      const inTopLeftBounds = col + i >= 0 && row + j >= 0
      if (inBottomRightBounds && inTopLeftBounds) {
        neighbors.push({ row: row + j, col: col + i })
      }
    }
  }
  return neighbors
}
