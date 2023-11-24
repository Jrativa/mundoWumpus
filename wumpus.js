let juego;

function preload() {
  // Cargar imágenes
  jugadorImg = loadImage('assets/jugador.png');
  wumpusImg = loadImage('assets/wumpus.png');
  oroImg = loadImage('assets/oro.png');
  brisaImg = loadImage('assets/brisa.png');
  agujeroImg = loadImage('assets/agujero.png');
}

function setup() {
  createCanvas(400, 400);
  juego = new JuegoWumpus(5);
}

function draw() {
  background(255);
  juego.actualizar();
  juego.mostrar();
}

class JuegoWumpus {
  constructor(tamaño, numeroAgujeros) {
    this.tamaño = tamaño;
    this.celdaSize = width / tamaño;
    this.laberinto = Array.from({ length: tamaño }, () => Array(tamaño).fill({ brisa: 0, agujero: 0 }));
    this.posicionJugador = createVector(0, 0);
    this.posicionWumpus = createVector(floor(random(tamaño)), floor(random(tamaño)));
    this.posicionOro = createVector(floor(random(tamaño)), floor(random(tamaño)));
    this.colocarAgujerosAleatoriamente(numeroAgujeros);
    this.actualizarBrisas();
    this.camino = [];
    frameRate(2);
  }
  
  colocarAgujerosAleatoriamente(numeroAgujeros) {
    for (let i = 0; i < numeroAgujeros; i++) {
      let x = floor(random(this.tamaño));
      let y = floor(random(this.tamaño));
      this.laberinto[x][y].agujero = 1;
    }
  }

  calcularCaminoAStar(inicio, fin) {
    let openSet = [inicio];
    let closedSet = [];

    while (openSet.length > 0) {
      let actual = openSet[0];
      let index = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < actual.f || (openSet[i].f === actual.f && openSet[i].h < actual.h)) {
          actual = openSet[i];
          index = i;
        }
      }

      openSet.splice(index, 1);
      closedSet.push(actual);

      if (actual.equals(fin)) {
        return this.reconstruirCamino(inicio, actual);
      }

      let vecinos = this.obtenerVecinos(actual);

      for (let vecino of vecinos) {
        if (!closedSet.some(c => c.equals(vecino))) {
          let tempG = actual.g + 1;

          if (!openSet.some(o => o.equals(vecino)) || tempG < vecino.g) {
            vecino.g = tempG;
            vecino.h = this.heuristica(vecino, fin);
            vecino.f = vecino.g + vecino.h;
            vecino.padre = actual;

            if (!openSet.some(o => o.equals(vecino))) {
              openSet.push(vecino);
            }
          }
        }
      }
    }

    return [];
  }

  reconstruirCamino(inicio, fin) {
    let camino = [];
    let actual = fin;

    while (actual) {
      camino.unshift(actual);
      actual = actual.padre;
    }

    return camino;
  }

  obtenerVecinos(actual) {
    let vecinos = [];
    let movimientos = [
      createVector(0, -1), // Arriba
      createVector(0, 1),  // Abajo
      createVector(-1, 0), // Izquierda
      createVector(1, 0)   // Derecha
    ];

    for (let movimiento of movimientos) {
      let nuevaPos = p5.Vector.add(actual, movimiento);
      if (nuevaPos.x >= 0 && nuevaPos.x < this.tamaño && nuevaPos.y >= 0 && nuevaPos.y < this.tamaño) {
        vecinos.push(nuevaPos);
      }
    }

    return vecinos;
  }

  heuristica(a, b) {
    return dist(a.x, a.y, b.x, b.y);
  }

  mover(paso) {
    this.posicionJugador = paso;
  }

  actualizar() {
    if (this.camino.length === 0) {
      let inicio = createVector(this.posicionJugador.x, this.posicionJugador.y);
      let fin = createVector(this.posicionOro.x, this.posicionOro.y);
      this.camino = this.calcularCaminoAStar(inicio, fin);
    }

    if (this.camino.length > 0) {
      this.mover(this.camino[0]);
      this.camino.shift();
    }
  }
  mostrar() {
    for (let i = 0; i < this.tamaño; i++) {
      for (let j = 0; j < this.tamaño; j++) {
        let x = i * this.celdaSize;
        let y = j * this.celdaSize;

        if (this.posicionJugador.equals(createVector(i, j))) {
          image(jugadorImg, x, y, this.celdaSize, this.celdaSize);
        } else if (this.posicionWumpus.equals(createVector(i, j))) {
          image(wumpusImg, x, y, this.celdaSize, this.celdaSize);
        } else if (this.posicionOro.equals(createVector(i, j))) {
          image(oroImg, x, y, this.celdaSize, this.celdaSize);
        } else if (this.laberinto[i][j].agujero.equals(1)) {
          image(agujeroImg, x, y, this.celdaSize, this.celdaSize);
        } else {
          fill(200); 
          rect(x, y, this.celdaSize, this.celdaSize);
        }
      }
    }
  }
}
