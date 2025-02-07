

const generateTargetFunction = (number, end) => {
  return `
  <div class="col-auto">
    <div class="row">
      <div class="col-auto">
        <input
          type="text"
          class="form-control"
          id="target_${number}"
          placeholder="0"
        />
      </div>
      <div class="col-auto px-0">
        <label for="x1" class="col-sm-auto col-form-label text-end"
          >X${number} ${end ? "" : "+"}</label
        >
      </div>
    </div>
  </div>`;
};

const generateRestriction = (row, column, end, method) => {
  let content = `
  <div class="col-auto">
    <input
      type="text"
      class="form-control"
      id="restriction_${row}_${column}"
      placeholder="0"
    />
  </div>
  <div class="col-auto px-0">
        <label for="x1" class="col-sm-auto col-form-label text-end"
          >X${column} ${end ? "" : "+"}</label
        >
  </div>
  `;

  if (end) {
    content += `
    <div class="col-auto">
      <select class="form-select" id="nature_${row}">
        <option value="0">≥</option>
        <option value="1">≤</option>
        <option value="2">=</option>
      </select>
    </div>
    <div class="col-auto p-0">
      <input type="text" class="form-control" id="restriction_${row}_${
      column + 1
    }" placeholder="0"/>
    </div>
    `;
  }

  return content;
};

const deleteGraph = () => {
  const existingCanvas = document.getElementById("graphCanvas");
  const parentContainer = existingCanvas.parentNode;

  if (existingCanvas) {
    parentContainer.removeChild(existingCanvas);
    $("#graph-label").empty();
  }
};

const checkForm = () => {
  let methodValue = $("#method-select").val();
  let variablesValue = parseInt($("#variables").val());
  let restrictionsValue = parseInt($("#restrictions").val());

  if (!$("#method-form")[0].checkValidity()) {
    swal(
      "Información Incompleta",
      "Ingrese todos los datos para continuar",
      "error"
    );
    return;
  }

  if (methodValue === "1") { // Método gráfico
    if (variablesValue !== 2) {
      swal(
        "Error",
        "El método gráfico solo funciona con 2 variables",
        "error"
      );
      return;
    }
  }

  if (variablesValue <= 0 || restrictionsValue <= 0) {
    swal(
      "Error",
      "El número de variables y restricciones debe ser mayor a 0",
      "error"
    );
    return;
  }

  // Si pasa todas las validaciones
  createTargetForm();
  deleteGraph();
  movement();
};



const movement = () => {
  let finalElement = $("body");
  $("html, body").animate({ scrollTop: finalElement.height() }, "slow");
};

const checkRowWidth = () => {
  let row = $("#target-variables");

  if (row.length > 0) {
    let rowWidth = 0;

    row.children().each(function () {
      rowWidth += $(this).outerWidth(true);
    });

    let maxWidth = $(".target-container").outerWidth();
    if (rowWidth > maxWidth) {
      $(".elastic-row").removeClass("justify-content-center");
      $(".elastic-group-row").addClass("overflow-auto");
    } else {
      $(".elastic-row").addClass("justify-content-center");
      $(".elastic-group-row").removeClass("overflow-auto");
    }
  }
};

const createTargetForm = () => {
  
  reloadSystem();
  console.log("si llego");
  let variablesValue = $("#variables").val();
  let restrictionsValue = $("#restrictions").val();
  let methodValue = $("#method-form").val();

  let variablesString = [];
 

  $("#target-variables").html(`
    <div class="col-auto ">
      <label for="funcion" class="col-sm-auto col-form-label text-end">Función:</label>
    </div>
  `);

  for (let i = 1; i <= variablesValue; i++) {
    variablesString.push("X" + i);
    $("#target-variables").append(
      generateTargetFunction(i, i == variablesValue)
    );
  }

  $("#target-restrictions").empty();

  for (let i = 1; i <= restrictionsValue; i++) {
    $("#target-restrictions").append(
      `<div class="mb-3 row elastic-row flex-nowrap"></div>`
    );

    let row = $("#target-restrictions div");
    for (let j = 1; j <= variablesValue; j++) {
      row
        .last()
        .append(generateRestriction(i, j, j == variablesValue, methodValue));
    }
  }

  $("#variable-label").html(`${variablesString.join(", ")} ≥ 0`);

  checkRowWidth();
};

const reloadSystem = () => {
  
  $("#target-form").show();  
  
  $("#iterations-container").empty();
  $("#iterations-container").hide();
  $("#calculateButton").prop("disabled", false);
};

const parseInputValue = (value) => {
  // Remove whitespace
  value = value.trim();
  
  // Check if it's a fraction
  if (value.includes('/')) {
    const [numerator, denominator] = value.split('/').map(num => parseFloat(num.trim()));
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
    throw new Error('Invalid fraction format');
  }
  
  // Parse as decimal
  const number = parseFloat(value);
  if (!isNaN(number)) {
    return number;
  }
  throw new Error('Invalid number format');
};

const calculate = async () => {
  $(".datatable").DataTable().destroy();
  $("#iterations-container").empty();
  $("#iterations-container").hide();
  let fieldsEmpty = false;
  let invalidInput = false;

  // Validate target function inputs
  $("#target-variables input").each(function() {
    if ($(this).val().trim() === "") {
      fieldsEmpty = true;
      return false;
    }
    try {
      parseInputValue($(this).val());
    } catch (e) {
      invalidInput = true;
      return false;
    }
  });

  // Validate restrictions inputs
  $("#target-restrictions input").each(function() {
    if ($(this).val().trim() === "") {
      fieldsEmpty = true;
      return false;
    }
    try {
      parseInputValue($(this).val());
    } catch (e) {
      invalidInput = true;
      return false;
    }
  });

  if (fieldsEmpty) {
    swal("Error", "Debe completar todos los campos para continuar", "error");
    return;
  }

  if (invalidInput) {
    swal("Error", "Los valores deben ser números decimales o fracciones válidas (ejemplo: 1.5 o 3/2)", "error");
    return;
  }

  let methodValue = $("#method-select").val();
  if (methodValue == "0") {
    natureSystem = 0;
    target = [];
    natures = [];
    inputMatrix = [];

    let variablesValue = $("#variables").val();
    let restrictionsValue = $("#restrictions").val();

    natureSystem = Number($("#natureSystem").val());

    // Parse target function values
    for (let i = 1; i <= variablesValue; i++) {
      let cellTarget = "#target_" + i;
      target.push(parseInputValue($(cellTarget).val()));
    }

    // Get restriction natures
    for (let i = 1; i <= restrictionsValue; i++) {
      let cellNature = "#nature_" + i;
      natures.push(Number($(cellNature).val()) || 0);
    }

    // Parse restriction values
    let columnsVariables = Number(variablesValue) + 1;
    for (let i = 1; i <= restrictionsValue; i++) {
      let rowCopy = [];
      for (let j = 1; j <= columnsVariables; j++) {
        let newValue = $("#restriction_" + i + "_" + j).val() || "0";
        rowCopy.push(parseInputValue(newValue));
      }
      inputMatrix.push(rowCopy);
    }
 
    try {
      execute();
 
      $("#iterations-container").append(`
        <div class="row text-center">
          <div class="col-12">
            <h1 class="mb-4" style="color: #FFFFFF; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Fase 1</h1>
          </div>
        </div>
      `);
 
      for (let i = 0; i < redos.length; i++) {
        $("#iterations-container").append(
          `<table id="matrix_${i}" class="datatable display"></table>`
        );
 
        let data = changeFractions(redos[i]);
        await initializeTable(data, i);
 
        if (!redos[i].candidate && i < redos.length - 1) {
          $("#iterations-container").append(`
            <div class="row text-center">
              <div class="col-12">
                <h1 class="mb-4" style="color: #FFFFFF; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Fase 2</h1>
              </div>
            </div>
          `);
        }
      }
 
      $("#iterations-container").show();
      addClearButton();
      addScrollButton();
      
      $('html, body').animate({
        scrollTop: $("#iterations-container").offset().top
      }, 1000);
 
    } catch (error) {
      console.error("Error en el cálculo:", error);
      swal("Error", "Ocurrió un error al calcular. Verifique los datos ingresados.", "error");
    }
  } else {
    // Similar modifications for the graphical method
    natureSystem = 0;
    target = [];
    restrictions = [];

    let variablesValue = $("#variables").val();
    let restrictionsValue = $("#restrictions").val();

    natureSystem = Number($("#natureSystem").val());

    // Parse target function values
    for (let i = 1; i <= variablesValue; i++) {
      let cellTarget = "#target_" + i;
      target.push(parseInputValue($(cellTarget).val()));
    }

    // Get restriction natures
    for (let i = 1; i <= restrictionsValue; i++) {
      let cellNature = "#nature_" + i;
      natures.push(Number($(cellNature).val()) || 0);
    }

    // Parse restriction values
    let columnsVariables = Number(variablesValue) + 1;
    for (let i = 1; i <= restrictionsValue; i++) {
      let rowCopy = [];
      for (let j = 1; j <= columnsVariables; j++) {
        let newValue = $("#restriction_" + i + "_" + j).val() || "0";

        if (j == 3) {
          let cellNature = "#nature_" + i;
          rowCopy.push(Number($(cellNature).val()) || 0);
        }
        rowCopy.push(parseInputValue(newValue));
      }
      restrictions.push(rowCopy);
    }

    try {
      graphCanvas();
      $("#canvas-container").show();
      addClearButton();
      addScrollButton();
      
      $('html, body').animate({
        scrollTop: $("#canvas-container").offset().top
      }, 1000);
      
    } catch (error) {
      console.error("Error en el gráfico:", error);
      swal("Error", "Ocurrió un error al graficar. Verifique los datos ingresados.", "error");
    }
  }
};
 
 const addClearButton = () => {
  if (!$("#clearButton").length) {
    $(".mb-3.row:has(#calculateButton)").after(`
      <div class="mb-3 row" style="margin-top: 20px;">
        <button id="clearButton" type="button" class="btn" onclick="clearForm()">
          <span class="btn-txt">Limpiar Formulario</span>
        </button>
      </div>
    `);
  }
 };
 
 const clearForm = () => {
  $("#method-select").val("0");
  $("#variables").val("");
  $("#restrictions").val("");
  $("#target-form").hide();
  $("#iterations-container").hide();
  $("#canvas-container").hide();
  $("#clearButton").remove();
  $("#scrollTopButton").remove();
 };
 
 const addScrollButton = () => {
  if (!$("#scrollTopButton").length) {
    $("body").append(`
      <button id="scrollTopButton" 
              class="btn scroll-top-btn"
              onclick="scrollToTop()"
              style="position: fixed;
                     bottom: 20px;
                     right: 20px;
                     z-index: 99;
                     padding: 15px;
                     border-radius: 50%;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     background: #1565C0;">
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="24" 
             height="24" 
             viewBox="0 0 24 24" 
             fill="none" 
             stroke="white" 
             stroke-width="2" 
             stroke-linecap="round" 
             stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    `);
  }
 };
 
 const scrollToTop = () => {
  $('html, body').animate({scrollTop: 0}, 800);
 };
const changeFractions = (data) => {
  for (let i = 0; i < data.matrix.length; i++) {
    for (let j = 0; j < data.matrix[i].length; j++) {
      // Verifica si el valor es un número y si tiene decimales
      if (!isNaN(data.matrix[i][j]) && data.matrix[i][j] % 1 !== 0) {
        let fraction = math.fraction(data.matrix[i][j]);
        let nature = fraction.s == -1 ? "-" : "";
        data.matrix[i][j] = nature + fraction.n + "/" + fraction.d; // Reemplaza el valor decimal con 1

        if (i == data.matrix.length - 1 && j == data.matrix[i].length - 1) {
          data.z = data.matrix[i][j];
        }
      }
    }
  }

  let variables = data.matrix
    .slice(2, -1)
    .map((row) => row.slice(-2))
    .filter((row) => String(row[1]).includes("X"));

  let decisionVariables = data.matrix[1].filter((variable) =>
    String(variable).includes("X")
  );

  decisionVariables.forEach((cell) => {
    let variable = variables.find((_) => _[1] == cell);

    if (!variable) {
      variables.push([0, cell]);
    }
  });

  data.variables = variables
    .sort(function (a, b) {
      return a[1].localeCompare(b[1], undefined, { numeric: true });
    })
    .map((row) => row.reverse().join(" = "))
    .join(", ");

  return data;
};

const initializeTable = async (data, index) => {
  let candidate = data.candidate;

  let content = [];
  for (var i = 0; i < data.matrix.length; i++) {
    var fila = [];
    for (var j = 0; j < data.matrix[i].length; j++) {
      if (i == 0 && j == 0) {
        fila.push("Cj");
      }

      if (i == 1 && j == 0) {
        fila.push("Cx");
      }

      if (
        i > 1 &&
        i < data.matrix.length - 1 &&
        j == data.matrix[i].length - 2
      ) {
        fila.push(data.matrix[i][j + 1]);
        continue;
      }

      if (
        i > 1 &&
        i < data.matrix.length - 1 &&
        j == data.matrix[i].length - 1
      ) {
        fila.push(data.matrix[i][j - 1]);
        continue;
      }

      if (i == data.matrix.length - 1 && j == 0) {
        fila.push("Zj - Cj");
      }

      if (i == data.matrix.length - 1 && j == data.matrix[i].length - 1) {
        fila.push(0);
        fila.push("Z = " + data.matrix[i][j]);
        continue;
      }

      fila.push(data.matrix[i][j]);

      if (i == 0 && j == data.matrix[i].length - 1) {
        fila.push("Tabla " + (index + 1));
      }

      if (i == 1 && j == data.matrix[i].length - 1) {
        fila.push("Xb");
        fila.push("bi");
      }
    }
    content.push(fila);
  }

  await new Promise((resolve) => {
    setTimeout(() => {
      // Configuración de DataTable
      $(`#matrix_${index}`).DataTable({
        paging: false,
        searching: false,
        ordering: false,
        info: false,
        autoWidth: false, // Desactiva el ajuste automático del ancho de las columnas
        columns: [
          { width: "100px" },
          ...Array(content[0].length - 1).fill({ width: "50px" }),
        ], // Aplica ancho de 50px a todas las columnas
        data: content,
        responsive: false,
        createdRow: function (row, data, dataIndex) {
          $(row).css("background-color", "#e4e4e4");

          if (candidate && dataIndex > 1) {
            $(`td:eq(${candidate.columnIndex})`, row)
              .removeClass()
              .addClass("cell-style-6");

            if (dataIndex == candidate.rowIndex + 2) {
              $(row).children().removeClass().addClass("cell-style-6");

              $(`td:eq(${candidate.columnIndex})`, row)
                .removeClass()
                .addClass("cell-style-1");
            }
          }

          if (dataIndex == 0) {
            $(row).children().removeClass().addClass("cell-style-2");
            $("td:eq(0)", row).removeClass().addClass("cell-style-3");
            $("td:eq(-1)", row).attr("colspan", 2);
            $("td:eq(-2)", row).hide();
          }

          if (dataIndex == 1) {
            $(row).children().removeClass().addClass("cell-style-1");
            $("td:eq(0)", row).removeClass().addClass("cell-style-4");
          }

          if (dataIndex > 1 && dataIndex < content.length - 1) {
            $("td:eq(0)", row).removeClass().addClass("cell-style-2");
            $("td:eq(-1)", row).removeClass().addClass("cell-style-2");
            $("td:eq(-2)", row).removeClass().addClass("cell-style-1");
          }

          if (dataIndex == content.length - 1) {
            $("td:eq(0)", row).removeClass().addClass("cell-style-1");
            $("td:eq(-1)", row)
              .removeClass()
              .addClass("cell-style-5")
              .attr("colspan", 2);
            $("td:eq(-2)", row).hide();
          }
        },
      });

      $("#iterations-container").append(`
        <div class="row text-center">
          <div class="col-12">
            <label class="fw-bold variables-label" style="font-size: 16px; color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
              ${data.variables}, Z = ${data.z}
            </label>
          </div>
        </div>
      `);

      resolve();
    }, 200);
  });
};
const styles = `
 <style>
   .datatable {
     margin: 0 auto !important;
     width: 90% !important;
     margin-bottom: 20px !important;
   }

   .variables-label {
     display: inline-block;
     margin: 20px 0;
     color: #FFFFFF !important;
     text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
   }

   .phase-title h1 {
     color: #FFFFFF !important;
     text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
   }
 </style>
`;

$('head').append(styles);

$(document).ready(function () {
  $(window).resize(function () {
    checkRowWidth();
  });

  $("#method-form :input").on("input change", function () {
    if (
      $("#iterations-container").is(":visible") ||
      $("#canvas-container").is(":visible")
    ) {
      $("#calculateButton").prop("disabled", true);
    }
  });

  $("#method-select").change(function () {
    if ($("#iterations-container").is(":visible") || $("#canvas-container").is(":visible")) {
      $("#calculateButton").prop("disabled", true);
    }
  
    var selectedValue = $(this).val();
    var variables = $("#variables");
    
    if (selectedValue == "1") {
      variables.val("2");
    } else {
      variables.val("");
    }
  });
  
});
