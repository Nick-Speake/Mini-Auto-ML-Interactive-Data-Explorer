document.addEventListener("DOMContentLoaded", init);

// general init function for event listening
function init() {
    const fileInput = document.querySelector("#userFile");
    const userForm = document.querySelector("#userForm");

    if (!fileInput || !userForm) {
        console.error("Missing required DOM elements");
        return;
    }
    
    fileInput.addEventListener("change", handleFileSelect);
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = await submitForm(e.target);
        const graph = data.graph

        Plotly.newPlot("plotlyGraph", graph.data, graph.layout)
    });

}

// modualar creation of option elements
function createOption(value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    return option;
}

// modular creation of text input elements (entering constraints)
function createInput({ id, name, type = "text" }) {
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.name = name;
    return input;
}

// modular creation of labels for text input elements
function createLabel(text, htmlFor) {
    const label = document.createElement("label");
    label.textContent = text;
    if (htmlFor) label.htmlFor = htmlFor;
    return label;
}


// dyamically populates form widgets
function populateFormWidgets(variables) {
    const ui = {
        indep: document.querySelector("#indepVarDiv"),
        depen: document.querySelector("#depenVarDiv"),
        model: document.querySelector("#modelSelectDiv"),
        indepC: document.querySelector("#indepConstraintDiv"),
        depenC: document.querySelector("#depenConstraintDiv"),
    };

    // clear UI
    Object.values(ui).forEach(div => div.innerHTML = "");

    // dropdowns
    const indepSelect = buildDropdown("indepVarDropdown", "indepVar", variables, ui.indep, "Choose Independent Var:");
    const depSelect = buildDropdown("depenVarDropdown", "depenVar", variables, ui.depen, "Choose Dependent Var:");

    indepSelect.addEventListener("change", sendSelection);
    depSelect.addEventListener("change", sendSelection);

    // model radios
    buildModelRadios(ui, indepSelect, depSelect);
}

// modular creation of dropdown elements
function buildDropdown(id, name, variables, container, labelText) {
    const label = createLabel(labelText);
    const select = document.createElement("select");

    select.id = id;
    select.name = name;

    variables.forEach(v => select.appendChild(createOption(v)));

    container.appendChild(label);
    container.appendChild(select);

    return select;
}


// modular creation of radio buttons
function buildModelRadios(ui, indepSelect, depSelect) {
    
    // "optimize with constraints" RadioButton
    const optimize = createInput({
        id: "radioOptimize",
        name: "modelMode",
        type: "radio"
    });
    optimize.value = "optimize";

    // "predict without constraints" Radiobutton
    const predict = createInput({
        id: "radioPrediction",
        name: "modelMode",
        type: "radio"
    });
    predict.value = "prediction";

    ui.model.appendChild(createLabel("Optimize With Constraints", "radioOptimize"));
    ui.model.appendChild(optimize);

    ui.model.appendChild(createLabel("Predict Without Constraints", "radioPrediction"));
    ui.model.appendChild(predict);

    // if optimization => populate form w/ input fields
    optimize.addEventListener("change", () =>
        renderConstraints(ui.indepC, ui.depenC, indepSelect, depSelect)
    );

    // if prediction => remove constraint input widgets
    predict.addEventListener("change", () => {
        ui.indepC.innerHTML = "";
        ui.depenC.innerHTML = "";
    });
}

// 
function renderConstraints(indepDiv, depenDiv) {
    indepDiv.innerHTML = "";
    depenDiv.innerHTML = "";

    // independent constraints
    appendConstraintGroup(indepDiv, "indepConstraintLower", "Independent lower bound:");
    appendConstraintGroup(indepDiv, "indepConstraintUpper", "Independent upper bound:");

    // dependent constraints
    appendConstraintGroup(depenDiv, "depenConstraintLower", "Dependent lower bound:");
    appendConstraintGroup(depenDiv, "depenConstraintUpper", "Dependent upper bound:");

}

function appendConstraintGroup(container, id, labelText) {
    const input = createInput({ id, name: id });
    const label = createLabel(labelText, id);

    input.addEventListener("change", sendSelection);

    container.appendChild(label);
    container.appendChild(input);
}

async function sendSelection() {
    const form = document.querySelector("#userForm");
    if (!form) return;

    const formData = new FormData(form);

    try {
        await fetch("/update_selection", {
            method: "POST",
            body: formData
        });
    } catch (err) {
        console.error("Selection update failed:", err);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    await submitForm(event.target);
}

async function submitForm(form) {
    const depSelect = document.querySelector("#depenVarDropdown");
    const indepSelect = document.querySelector("#indepVarDropdown");

    const formData = new FormData(form);
    formData.append("depenVar", depSelect.value);
    formData.append("indepVar", indepSelect.value);


    try {
        
        const response = await fetch("/get_form", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
        throw new Error("Server error");
        }

        const data = await response.json();
        console.log(data);
        return data;
        
    } catch (err) {
        console.error("Form submission failed:", err);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append("userFile", file);

    uploadFileToBackend(fileData)
        .then(data => populateFormWidgets(data.csv_variables))
        .catch(err => console.error("File upload failed:", err));
}

async function uploadFileToBackend(fileData) {
    const response = await fetch("/get_file", {
        method: "POST",
        body: fileData
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Response error:", text);
        throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
}