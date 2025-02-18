function validarPunto(linea, puntoAdicional, sentido) {
  const puntoA = linea[0];
  const puntoB = linea[1];

  const pendiente = (puntoB.y - puntoA.y) / (puntoB.x - puntoA.x);
  const yEsperado = puntoA.y + pendiente * (puntoAdicional.x - puntoA.x);

  if (sentido == 2) {
    // Restricción de igualdad
    return Math.abs(puntoAdicional.y - yEsperado) < 1e-6;
  } else if (sentido == 1) {
    // Restricción <=
    return puntoAdicional.y <= yEsperado + 1e-6;
  } else {
    // Restricción >=
    return puntoAdicional.y >= yEsperado - 1e-6;
  }
}

function encontrarIntersecciones(restricciones) {
  const intersecciones = [{ x: 0, y: 0 }];

  for (let i = 0; i < restricciones.length - 1; i++) {
    for (let j = i + 1; j < restricciones.length; j++) {
      const a1 = restricciones[i][1];
      const b1 = restricciones[i][0];
      const c1 = restricciones[i][3];

      const a2 = restricciones[j][1];
      const b2 = restricciones[j][0];
      const c2 = restricciones[j][3];

      const determinante = a1 * b2 - a2 * b1;

      if (Math.abs(determinante) > 1e-6) {
        const y = (c1 * b2 - c2 * b1) / determinante;
        const x = (a1 * c2 - a2 * c1) / determinante;

        if (x >= 0 && y >= 0) {
          intersecciones.push({ x, y });
        }
      }
    }
  }

  return intersecciones;
}

// Función para encontrar los valores máximos de 'x' y 'y' en un array de objetos
function encontrarValoresMaximos(dataArray) {
  let maxX = -Infinity;
  let maxY = -Infinity;

  dataArray.forEach((obj) => {
    maxX = Math.max(maxX, obj.x);
    maxY = Math.max(maxY, obj.y);
  });

  return { maxX, maxY };
}

// Función para encontrar los valores máximos de 'x' y 'y' en el array de elementos
function encontrarValoresMaximosGlobal(elementosArray) {
  let maxGlobalX = -Infinity;
  let maxGlobalY = -Infinity;

  elementosArray.forEach((elemento) => {
    const { maxX, maxY } = encontrarValoresMaximos(elemento.data);
    if (isFinite(maxX)) {
      maxGlobalX = Math.max(maxGlobalX, maxX);
    }
    if (isFinite(maxY)) {
      maxGlobalY = Math.max(maxGlobalY, maxY);
    }
  });

  return { maxGlobalX, maxGlobalY };
}

function generarColorAleatorio() {
  // Genera colores aleatorios, evitando tonos muy oscuros
  const minColorValue = 50; // Valor mínimo para cada componente de color

  const randomColor = () =>
    Math.floor(Math.random() * (255 - minColorValue) + minColorValue);

  const redColor = randomColor().toString(16);
  const greenColor = randomColor().toString(16);
  const blueColor = randomColor().toString(16);

  const color = `#${redColor}${greenColor}${blueColor}`;

  return color;
}

function graphCanvas() {
  const existingCanvas = document.getElementById("graphCanvas");
  const parentContainer = document.getElementById("canvas-row-container");

  if (existingCanvas) {
    parentContainer.removeChild(existingCanvas);
    $("#graph-label").empty();
  }

  // Crear un nuevo canvas
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "graphCanvas";
  newCanvas.width = 800;
  newCanvas.height = 500;

  parentContainer.appendChild(newCanvas);
  const ctx = newCanvas.getContext("2d");

  let datasets = [];

  for (let i = 0; i < restrictions.length; i++) {
    const pointX = restrictions[i][3] / restrictions[i][0];
    const pointY = restrictions[i][3] / restrictions[i][1];

    let data = [
      { x: pointX, y: 0 },
      { x: 0, y: pointY },
    ].sort((a, b) => b.y - a.y);

    let color = generarColorAleatorio();

    datasets.push({
      type: "line",
      label: "Línea" + (i + 1),
      data,
      borderColor: color,
      borderWidth: 2,
      fill: restrictions[i][2] ? "start" : "end", // Activar el relleno del área debajo de la línea
      backgroundColor: color + "20", // Color del área sombreada
    });
  }

  const { maxGlobalX, maxGlobalY } = encontrarValoresMaximosGlobal(datasets);

  let intersecciones = [];

  for (let i = 0; i < datasets.length; i++) {
    for (let j = 0; j < datasets[i].data.length; j++) {
      if (datasets[i].data[j].x == 0 || datasets[i].data[j].y == 0) {
        intersecciones.push(datasets[i].data[j]);
      }

      if (datasets[i].data[j].x == Infinity) {
        datasets[i].data[j].x = maxGlobalX;
        datasets[i].data[j].y =
          datasets[i].data[j == datasets[i].data.length - 1 ? j - 1 : j + 1].y;
      }

      if (datasets[i].data[j].y == Infinity) {
        datasets[i].data[j].y = maxGlobalY + 10;
        datasets[i].data[j].x =
          datasets[i].data[j == datasets[i].data.length - 1 ? j - 1 : j + 1].x;
      }
    }
  }

  intersecciones.push(...encontrarIntersecciones(restrictions));
  let interseccionesValidas = [...intersecciones];

  // Llamada a la función para encontrar intersecciones
  for (let i = 0; i < datasets.length; i++) {
    interseccionesValidas = interseccionesValidas.filter((_, index) =>
      validarPunto(
        datasets[i].data,
        interseccionesValidas[index],
        restrictions[i][2]
      )
    );
  }

  let options = [];
  for (let i = 0; i < interseccionesValidas.length; i++) {
    options.push({
      result:
        target[0] * interseccionesValidas[i].x +
        target[1] * interseccionesValidas[i].y,
      x: interseccionesValidas[i].x,
      y: interseccionesValidas[i].y,
    });
  }

  if (natureSystem == 0) {
    options = options.sort((a, b) => a.result - b.result);
  } else {
    options = options.sort((a, b) => b.result - a.result);
  }

  if (options[0]) {
    datasets.push({
      data: [{ x: options[0].x, y: options[0].y }],
      label: "Solución",
      borderColor: "#8E44AD",
      borderWidth: 2,
      pointBackgroundColor: "#8E44AD",
      pointRadius: 5,
    });
  }

  for (let j = 0; j < options.length; j++) {
    if (!isNaN(options[j].x) && options[j].x % 1 !== 0) {
      let fraction = math.fraction(options[j].x);
      let nature = fraction.s == -1 ? "-" : "";
      options[j].x = nature + fraction.n + "/" + fraction.d; // Reemplaza el valor decimal con 1
    }

    if (!isNaN(options[j].y) && options[j].y % 1 !== 0) {
      let fraction = math.fraction(options[j].y);
      let nature = fraction.s == -1 ? "-" : "";
      options[j].y = nature + fraction.n + "/" + fraction.d; // Reemplaza el valor decimal con 1
    }

    if (!isNaN(options[j].result) && options[j].result % 1 !== 0) {
      let fraction = math.fraction(options[j].result);
      let nature = fraction.s == -1 ? "-" : "";
      options[j].result = nature + fraction.n + "/" + fraction.d; // Reemplaza el valor decimal con 1
    }
  }

  datasets.push({
    data: interseccionesValidas,
    label: "Intersecciones",
    borderColor: "blue",
    borderWidth: 2,
    pointBackgroundColor: "blue",
    pointRadius: 5,
  });

  const chartData = {
    type: "scatter",
    data: {
      datasets,
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          type: "linear",
          position: "left",
        },
      },
    },
  };

  let myChart = new Chart(ctx, chartData);

  $("#graph-label").empty().append(`
    <div class="col-auto py-0 px-2">
        <label for="funcion" class="col-sm-auto col-form-label text-end fw-bold variables-label" style="font-size: 18px">
            ${options[0] ? `La mejor solución es Z = ${options[0].result}
            y se obtiene de los valores: X1 = ${options[0].x}, X2 = ${options[0].y}` : "NO SE ENCUENTRA SOLUCIÓN"}
        </label>
    </div>
    ${mostrarTablaYPuntos(interseccionesValidas, target)}
`);
}

function mostrarTablaYPuntos(interseccionesValidas, target) {
  // Convertir los coeficientes target a fracciones pero mantener enteros si es posible
  function formatearNumero(num) {
      if (Number.isInteger(num)) return num;
      return math.format(math.fraction(num));
  }
  
  let coefX = formatearNumero(target[0]);
  let coefY = formatearNumero(target[1]);
  
  let tabla = `
  <div class="table-responsive">
      <table class="table table-bordered">
          <thead class="bg-primary text-white">
              <tr>
                  <th>Punto</th>
                  <th>Coordenadas (X₁,X₂)</th>
                  <th>Valor de la Función Objetivo ${coefX}X₁+ ${coefY}X₂</th>
              </tr>
          </thead>
          <tbody>
  `;

  // Generar filas de la tabla
  const letras = ['A', 'B', 'C', 'D', 'E'];
  interseccionesValidas.forEach((punto, index) => {
      // Formatear coordenadas, manteniendo enteros si es posible
      let x = formatearNumero(punto.x);
      let y = formatearNumero(punto.y);
      
      // Calcular el valor de la función objetivo usando fracciones
      let termX = math.multiply(math.fraction(target[0]), math.fraction(punto.x));
      let termY = math.multiply(math.fraction(target[1]), math.fraction(punto.y));
      let resultado = math.add(termX, termY);
      let resultadoStr = formatearNumero(math.number(resultado));

      tabla += `
          <tr>
              <td>${letras[index]}</td>
              <td>(${x},${y})</td>
              <td>${coefX}(${x})+ ${coefY}(${y}) = ${resultadoStr}</td>
          </tr>
      `;
  });

  tabla += `
          </tbody>
      </table>
  </div>
  <div class="mt-4">
  `;

  // Agregar los puntos debajo de la tabla
  interseccionesValidas.forEach((punto, index) => {
      let x = formatearNumero(punto.x);
      let y = formatearNumero(punto.y);
      tabla += `<div>${letras[index]}: (${x},${y})</div>`;
  });

  tabla += '</div>';

  return tabla;
}