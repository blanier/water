
let tubes = []
let history = []

let srcColumn = -1
const colors = ["#007500","#E82E3C","#F6F964","#0049FF","#BDEE2F","#68C687","#31FFF3",
                "#F636BE","#006eff","#FF5D00","#00237a","#8DA1AF","#3C1F10","#00495c"]
let height = 4
let nColors = parseInt(localStorage.getItem('nColors')) || 4
let shuffles = parseInt(localStorage.getItem('shuffles')) || 30

let field = document.getElementById("tubes")
field.addEventListener('click', onClick)

function rcToDiv(r, c) {
  let n = c * height + r + 1
  return document.getElementById(`div${n}`)
}

function rcToColor(r, c) {
  return colors[tubes[c][r]] || "#00000000"
}

function divToColumn(div) {
  return div.dataset.column
}

function columnHeight(c) {
  return tubes[c].length
}

function columnTopColor(c) {
  return tubes[c][columnHeight(c)-1]
}

function isntEmpty(c) {
  return c.length != 0
}

function isFullOfOneColor(c) {
  if (c.length != height) { return false }
  return c.every ( v => v==c[0])
}

function isSolved(t) {
  return t.filter(isntEmpty).every(isFullOfOneColor)
}

function onClick(e) {
  let block = e.path[0]

  if (!block.classList.contains('block')) {
    return
  }

  try {
    let c = divToColumn(block)
    if (srcColumn <0) {
      if (columnHeight(c) > 0) {
        srcColumn = c
      } else {
        srcColumn = -1
      }
      console.log(`srcColumn: ${srcColumn}`)
      return
    }

    let dstColumn = c
    if (srcColumn == dstColumn) {
      srcColumn = -1
      return
    }
    transfer(srcColumn, dstColumn)
    srcColumn = -1
  } finally {
    layoutTubes()
  }
}

function createTubes(n) {
  field.innerHTML = ""
  for (let i=0; i<n * height; i++) {
    let r = height - (i % height)
    let c = Math.floor(i/height) + 1

    let html = `<div class="block"
                     id="div${i+1}"
                     style = "grid-area: ${r}/${c}/${r+1}/${c+1}"
                />`
    field.innerHTML += html
  }

  nColors = tubes.length-2  // maybe assert somethign about the length of the color palette here
  field.style.gridTemplateColumns = `repeat(${n}, 50px)`

  layoutTubes()
}

function layoutTubes() {
  for (let column=0; column<tubes.length; column++) {
    for (let row=0; row<height; row++) {
      let div = rcToDiv(row, column)
      let color = rcToColor(row,column)
      div.style.backgroundColor = color
      div.dataset.column = column
      div.dataset.row = row

      switch (true) {
        case (row == 0):          div.dataset.bottom = undefined; break
        case (row == height - 1): div.dataset.top = undefined; break
        default:                  div.dataset.side = undefined; break
      }

      if (column == srcColumn) {
        div.classList.add("selected")
      } else {
        div.classList.remove("selected")
      }
    }
  }

  if(isSolved(tubes)) {
    console.log('%c%s',
            'color: black; background: green; font-size: 24px;',
            'SOLVED!!!!!!!!!')
  }
  dump()
}

function transfer(c1, c2) {
    // console.log(`transfer: ${c1}->${c2}`)
    if (c1==c2) {
      return false
    }

    if (columnHeight(c1) == 0 || columnHeight(c2) >= height) {
      return false
    }

    let color1 = columnTopColor(c1)
    let color2 = columnTopColor(c2)

    if (columnHeight(c2) != 0 && color1 != color2) {
      srcColumn = -1
      return false
    }

    history.push(JSON.stringify(tubes))

    while (columnTopColor(c1) == color1 && columnHeight(c2) < height) {
      let block = tubes[c1].pop()
      tubes[c2].push(block)
    }

    localStorage.setItem('tubes', JSON.stringify(tubes))
    layoutTubes()
    return true
}

function undo() {
  if (history.length) {
    tubes = JSON.parse(history.pop())
    layoutTubes()
  }
}

function restart() {
  while(history.length) {
    undo()
  }
}

let tree={}

function legalMoves() {
  let moves = []
  for (let i=0; i<tubes.length; i++) {
    for (j=0; j<tubes.length; j++) {
      if (transfer(i,j)) {
        undo()
        moves.push([i,j])
      }
    }
  }
  return moves
}

let frame

function blorp() {
  if (isSolved(tubes)) {
    return
  }

  let key = JSON.stringify(tubes)
  let moves = tree[key]

  if (moves == undefined) {
    moves = tree[key] = legalMoves()
    //console.log("NEW: ",key,moves)
  } else {
    //console.log("REPEAT:",key,moves)
  }

  let move
  if(move = moves.pop()) {
    //console.log(`MOVING FROM ${move[0]}->${move[1]}`)
    moveCounter++
    let rv = transfer(move[0], move[1])
    //console.assert(rv, "transfer shouldn't have failed")
  } else {
    // we're on a dead end.  Start looking elsewhere
    undo()
  }
  frame = requestAnimationFrame(blorp)
}

let moveCounter = 0
function solve() {
  moveCounter = 0
  tree=new(Object)
  frame = requestAnimationFrame(blorp)
}

function shuffleTubes(t) {
  for (let i=0; i<shuffles; i++) {
    let r1 = Math.floor(Math.random() * height)
    let r2 = Math.floor(Math.random() * height)
    let c1 = Math.floor(Math.random() * t.length)
    let c2 = Math.floor(Math.random() * t.length)

    let tmp   = t[c1][r1]
    t[c1][r1] = t[c2][r2]
    t[c2][r2] = tmp
  }
}

function generatePuzzle() {
  tubes = [...Array(nColors).keys()].map(v => new Array(height).fill(v))
  shuffleTubes(tubes)
  while (tubes.length < nColors + 2) {
    tubes.push([])
  }

  // tubes = JSON.parse("[[1,9,10,7],[3,0,0,12],[3,6,10,11],[10,5,6,12],[5,2,7,2],[5,6,4,11],[1,8,0,1],[8,9,3,10],[13,9,6,4],[13,4,13,8],[7,12,1,0],[12,7,11,11],[3,5,4,2],[2,8,13,9],[],[]]")
}

function dump() {
  return
  console.table(tubes)
  console.log(`nColors: ${nColors}`)
  for (let i=0; i<tubes.length; i++) {
    // console.log(`${i} -> ${columnTopColor(i)}`)
  }
}

function updateControls() {
  document.querySelector("#nColors").value = nColors
  document.querySelector("#shuffles").value = shuffles
}

function controlChanged(newGame) {
  console.log("!!!!!!!!!!!!!!!!!")

  cancelAnimationFrame(frame)
  
  nColors = parseInt(document.querySelector("#nColors").value)
  shuffles = parseInt(document.querySelector("#shuffles").value)

  localStorage.setItem('nColors', nColors)
  localStorage.setItem('shuffles', shuffles)

  if (newGame) {
    generatePuzzle()
    localStorage.setItem('tubes', JSON.stringify(tubes))
  } else {
    tubes=JSON.parse(localStorage.getItem('tubes'))
  }

  createTubes(tubes.length)
  layoutTubes()
  updateControls()
}

updateControls()
controlChanged(false)
