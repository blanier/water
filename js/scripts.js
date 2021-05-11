let t1_tubes = [
  [1,1,2,3],  // column 0
  [1,1,3,2],  // column 1
  [2,3,4,4],  // column ...
  [4,2,3,4],
  [],
  []
]

let t2_tubes = [
  [0,0,0,0],  // column 0
  [1,1,1,1],  // column 1
  [2,2,2,2],  // column ...
  [3,3,3],
  [3],
  []
]

let tubes = []

let srcColumn = -1
const colors = ["#256eff","#46237a","#3ddc97","#ff495c","#00495c",
                "#006eff","#00237a","#00dc97","#00495c","#0049FF"]
let height = 4
let nColors = 0

let field = document.getElementById("tubes")
field.addEventListener('click', onClick)

function init(n) {
  createTubes(n)
  generatePuzzle()
  layoutTubes()
}

function rcToDiv(r, c) {
  let n = c * height + r + 1
  return document.getElementById(`div${n}`)
}

function rcToColor(r, c) {
  return colors[tubes[c][r]] || "#000000"
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

  if (srcColumn <0) {
    c = divToColumn(block)
    if (columnHeight(c) > 0) {
      srcColumn = c
    } else {
      srcColumn = -1
    }
    console.log(`srcColumn: ${srcColumn}`)
    return
  }

  let dstColumn = divToColumn(block)
  if (srcColumn == dstColumn) {
    return
  }
  transfer(srcColumn, dstColumn)
  srcColumn = -1
}

function createTubes(n) {
  field.innerHTML = ""
  for (let i=0; i<n * height; i++) {
    let r = height - (i % height)
    let c = Math.floor(i/height) + 1

    // console.log(`${i}: (${row},${column})`)
    let html = `<div class="block"
                     id="div${i+1}"
                     style = "grid-area: ${r}/${c}/${r+1}/${c+1}"
                />`
    field.innerHTML += html
  }

  tubes = []
  for (i=0; i<n; i++) {
    tubes.push([])
  }

  nColors = tubes.length-2  // maybe assert somethign about the length of the color palette here
  field.style.gridTemplateColumns = `repeat(${n}, 50px)`
}

function layoutTubes() {
  for (let column=0; column<tubes.length; column++) {
    for (let row=0; row<height; row++) {
      let div = rcToDiv(row, column)
      let color = rcToColor(row,column)
      div.style.backgroundColor = color
      div.dataset.column = column
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
    console.log(`transfer: ${c1}->${c2}`)
    if (columnHeight(c1) == 0 || columnHeight(c2) >= height) {
      console.log("bogus column")
      return;
    }

    let color1 = columnTopColor(c1)
    let color2 = columnTopColor(c2)

    if (columnHeight(c2) != 0 && color1 != color2) {
      srcColumn = -1
      return
    }

    while (columnTopColor(c1) == color1 && columnHeight(c2) < height) {
      let block = tubes[c1].pop()
      tubes[c2].push(block)
    }
    layoutTubes()
}

function generatePuzzle() {
  tubes = JSON.parse(JSON.stringify(t2_tubes))
  while (tubes.length < nColors + 2) {
    tubes.push([])
  }
}

function dump() {
  //return
  console.table(tubes)
  console.log(`nColors: ${nColors}`)
  for (let i=0; i<tubes.length; i++) {
    // console.log(`${i} -> ${columnTopColor(i)}`)
  }
}

init(6)
