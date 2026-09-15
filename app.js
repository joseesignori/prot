

const defaultData = {

    products: [
        {
            id: 1,
            name: "Atún en agua",
            presentation: "Lata 170 g",
            stock: 86,
            minimum: 20,
            physical: 84,
            expiry: "2026-10-08"
        },
        {
            id: 2,
            name: "Atún en aceite",
            presentation: "Lata 170 g",
            stock: 18,
            minimum: 20,
            physical: 18,
            expiry: "2026-09-28"
        },
        {
            id: 3,
            name: "Atún en aceite",
            presentation: "Lata 140 g",
            stock: 42,
            minimum: 15,
            physical: 42,
            expiry: "2027-01-16"
        }
    ],

    suppliers: [
        {
            id: 1,
            name: "Distribuidora del Pacífico",
            contact: "999 111 222"
        },
        {
            id: 2,
            name: "Abarrotes Mayoristas Lima",
            contact: "999 333 444"
        }
    ],

    movements: [
        {
            id: 1,
            type: "INGRESO",
            productId: 1,
            quantity: 50,
            supplier: "Distribuidora del Pacífico",
            user: "admin",
            date: "2026-09-01"
        },
        {
            id: 2,
            type: "SALIDA",
            productId: 2,
            quantity: 8,
            supplier: "-",
            user: "cajero",
            date: "2026-09-05"
        },
        {
            id: 3,
            type: "INGRESO",
            productId: 3,
            quantity: 20,
            supplier: "Abarrotes Mayoristas Lima",
            user: "admin",
            date: "2026-09-08"
        }
    ]

};



let data =
    JSON.parse(localStorage.getItem("tienditaData"))
    || defaultData;

let currentUser = null;


function saveData() {

    localStorage.setItem(
        "tienditaData",
        JSON.stringify(data)
    );

}


const loginScreen =
    document.getElementById("loginScreen");

const app =
    document.getElementById("app");

const loginForm =
    document.getElementById("loginForm");

const currentUserElement =
    document.getElementById("currentUser");

const userBadge =
    document.getElementById("userBadge");

const pageTitle =
    document.getElementById("pageTitle");



loginForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    let role = null;

    if (
        username === "admin" &&
        password === "admin123"
    ) {
        role = "Administrador";
    }

    if (
        username === "cajero" &&
        password === "cajero123"
    ) {
        role = "Cajero";
    }

    if (!role) {

        showToast(
            "Usuario o contraseña incorrectos"
        );

        return;
    }

    currentUser = {
        username,
        role
    };

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");

    currentUserElement.textContent =
        `${username} · ${role}`;

    userBadge.textContent =
        role;

    configurePermissions();

    renderAll();

    showSection("dashboard");

});


function configurePermissions() {

    document.querySelectorAll(".admin-only")
        .forEach(element => {

            if (currentUser.role === "Administrador") {

                element.classList.remove("hidden");

            } else {

                element.classList.add("hidden");

            }

        });

}


document.getElementById("logoutBtn")
    .addEventListener("click", function() {

        currentUser = null;

        app.classList.add("hidden");
        loginScreen.classList.remove("hidden");

        loginForm.reset();

    });


document.querySelectorAll(
    "#menu button[data-section]"
).forEach(button => {

    button.addEventListener("click", function() {

        showSection(
            this.dataset.section
        );

    });

});


function showSection(sectionId) {

    document.querySelectorAll(".section")
        .forEach(section => {

            section.classList.add("hidden");

        });

    const section =
        document.getElementById(sectionId);

    if (!section) return;

    section.classList.remove("hidden");


    document.querySelectorAll(
        "#menu button"
    ).forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.section === sectionId
        ) {

            button.classList.add("active");

        }

    });


    const titles = {

        dashboard: "Inicio",
        inventory: "Inventario",
        entries: "Ingresos",
        sales: "Ventas / Salidas",
        expiry: "Vencimientos",
        history: "Historial",
        suppliers: "Proveedores",
        reports: "Reportes",
        settings: "Stock mínimo"

    };

    pageTitle.textContent =
        titles[sectionId] || "Sistema";

}


function renderAll() {

    renderDashboard();

    renderInventory();

    renderProductSelects();

    renderExpiry();

    renderHistory();

    renderSuppliers();

    renderReports();

    renderSettings();

}



function daysUntil(date) {

    const today = new Date();

    const target = new Date(date);

    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);

    return Math.ceil(
        (target - today) /
        (1000 * 60 * 60 * 24)
    );

}


function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString(
        "es-PE"
    );

}



function getProduct(id) {

    return data.products.find(
        product => product.id === Number(id)
    );

}


function stockStatus(product) {

    if (product.stock === 0) {

        return {
            text: "Agotado",
            className: "danger"
        };

    }

    if (product.stock <= product.minimum) {

        return {
            text: "Crítico",
            className: "warning"
        };

    }

    return {
        text: "Normal",
        className: "ok"
    };

}


function expiryStatus(product) {

    const days =
        daysUntil(product.expiry);

    if (days < 0) {

        return {
            text: "Vencido",
            className: "danger"
        };

    }

    if (days <= 30) {

        return {
            text: "Próximo a vencer",
            className: "warning"
        };

    }

    return {
        text: "Vigente",
        className: "ok"
    };

}


function renderDashboard() {

    const totalStock =
        data.products.reduce(
            (sum, product) =>
                sum + product.stock,
            0
        );


    const critical =
        data.products.filter(
            product =>
                product.stock <= product.minimum
        );


    const nearExpiry =
        data.products.reduce(
            (sum, product) => {

                if (
                    daysUntil(product.expiry) <= 30
                    &&
                    daysUntil(product.expiry) >= 0
                ) {

                    return sum + product.stock;

                }

                return sum;

            },
            0
        );


    const registered =
        data.products.reduce(
            (sum, product) =>
                sum + product.stock,
            0
        );


    const physical =
        data.products.reduce(
            (sum, product) =>
                sum + product.physical,
            0
        );


    const accuracy =
        registered === 0
            ? 100
            : (physical / registered) * 100;


    document.getElementById(
        "totalStock"
    ).textContent = totalStock;


    document.getElementById(
        "criticalStock"
    ).textContent = critical.length;


    document.getElementById(
        "nearExpiry"
    ).textContent = nearExpiry;


    document.getElementById(
        "accuracy"
    ).textContent =
        accuracy.toFixed(1) + "%";


    document.getElementById(
        "accuracyText"
    ).textContent =
        accuracy.toFixed(1) + "%";


    document.getElementById(
        "accuracyBar"
    ).style.width =
        Math.min(accuracy, 100) + "%";


    const criticalPercentage =
        data.products.length === 0
            ? 0
            : (critical.length /
                data.products.length) * 100;


    document.getElementById(
        "criticalText"
    ).textContent =
        criticalPercentage.toFixed(1) + "%";


    document.getElementById(
        "criticalBar"
    ).style.width =
        criticalPercentage + "%";


    document.getElementById(
        "exhaustionText"
    ).textContent = "10%";


    document.getElementById(
        "exhaustionBar"
    ).style.width = "10%";


    renderAlerts();

}



function renderAlerts() {

    const container =
        document.getElementById("alerts");

    container.innerHTML = "";


    let alerts = 0;


    data.products.forEach(product => {

        if (product.stock === 0) {

            container.innerHTML += `
                <div class="alert danger">
                    <strong>${product.name}</strong>
                    está agotado.
                </div>
            `;

            alerts++;

        }
        else if (
            product.stock <= product.minimum
        ) {

            container.innerHTML += `
                <div class="alert warning">
                    <strong>${product.name}</strong>
                    tiene stock crítico.
                </div>
            `;

            alerts++;

        }


        if (
            daysUntil(product.expiry) <= 30
        ) {

            container.innerHTML += `
                <div class="alert danger">
                    <strong>${product.name}</strong>
                    está próximo a vencer.
                </div>
            `;

            alerts++;

        }

    });


    if (alerts === 0) {

        container.innerHTML = `
            <div class="alert success">
                No hay alertas actualmente.
            </div>
        `;

    }

}


function renderInventory() {

    const table =
        document.getElementById(
            "inventoryTable"
        );

    const search =
        document.getElementById(
            "inventorySearch"
        ).value
        .toLowerCase();


    const filter =
        document.getElementById(
            "inventoryFilter"
        ).value;


    table.innerHTML = "";


    data.products
        .filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search)
                ||
                product.presentation
                    .toLowerCase()
                    .includes(search)
                ||
                String(product.id)
                    .includes(search);


            if (!matchesSearch)
                return false;


            if (filter === "critical") {

                return product.stock <=
                    product.minimum;

            }


            if (filter === "ok") {

                return product.stock >
                    product.minimum;

            }


            if (filter === "expiry") {

                return daysUntil(
                    product.expiry
                ) <= 30;

            }


            return true;

        })
        .forEach(product => {

            const status =
                stockStatus(product);

            const expiry =
                expiryStatus(product);


            table.innerHTML += `
                <tr>

                    <td>${product.id}</td>

                    <td>
                        <strong>
                            ${product.name}
                        </strong>
                    </td>

                    <td>
                        ${product.presentation}
                    </td>

                    <td>
                        <strong>
                            ${product.stock}
                        </strong>
                    </td>

                    <td>
                        ${product.minimum}
                    </td>

                    <td>
                        ${product.physical}
                    </td>

                    <td>
                        ${formatDate(product.expiry)}
                    </td>

                    <td>
                        <span class="status ${status.className}">
                            ${status.text}
                        </span>
                    </td>

                    <td>
                        <button
                            onclick="physicalCount(${product.id})">
                            Conteo
                        </button>
                    </td>

                </tr>
            `;

        });

}


document.getElementById(
    "inventorySearch"
).addEventListener(
    "input",
    renderInventory
);


document.getElementById(
    "inventoryFilter"
).addEventListener(
    "change",
    renderInventory
);


function physicalCount(id) {

    const product =
        getProduct(id);

    const value =
        prompt(
            `Stock físico de ${product.name}:`,
            product.physical
        );


    if (value === null)
        return;


    const quantity =
        Number(value);


    if (
        isNaN(quantity)
        ||
        quantity < 0
    ) {

        showToast(
            "Cantidad inválida"
        );

        return;

    }


    product.physical = quantity;

    saveData();

    renderAll();

    showToast(
        "Conteo físico actualizado"
    );

}


function renderProductSelects() {

    const entry =
        document.getElementById(
            "entryProduct"
        );

    const sale =
        document.getElementById(
            "saleProduct"
        );


    const options =
        data.products
            .map(product => `
                <option value="${product.id}">
                    ${product.name} - ${product.presentation}
                </option>
            `)
            .join("");


    entry.innerHTML = options;

    sale.innerHTML = options;


    const suppliers =
        document.getElementById(
            "entrySupplier"
        );


    suppliers.innerHTML =
        data.suppliers
            .map(supplier => `
                <option value="${supplier.id}">
                    ${supplier.name}
                </option>
            `)
            .join("");


    document.getElementById(
        "entryDate"
    ).value =
        new Date()
            .toISOString()
            .slice(0,10);


    document.getElementById(
        "saleDate"
    ).value =
        new Date()
            .toISOString()
            .slice(0,10);

}



document.getElementById(
    "entryForm"
).addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const product =
            getProduct(
                document.getElementById(
                    "entryProduct"
                ).value
            );


        const quantity =
            Number(
                document.getElementById(
                    "entryQuantity"
                ).value
            );


        const supplier =
            data.suppliers.find(
                s =>
                    s.id === Number(
                        document.getElementById(
                            "entrySupplier"
                        ).value
                    )
            );


        const date =
            document.getElementById(
                "entryDate"
            ).value;


        const expiry =
            document.getElementById(
                "entryExpiry"
            ).value;


        product.stock += quantity;

        product.expiry = expiry;


        data.movements.push({

            id:
                Date.now(),

            type:
                "INGRESO",

            productId:
                product.id,

            quantity:
                quantity,

            supplier:
                supplier.name,

            user:
                currentUser.username,

            date:
                date

        });


        saveData();

        this.reset();

        renderAll();

        showToast(
            "Ingreso registrado correctamente"
        );

    }
);


document.getElementById(
    "saleForm"
).addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const product =
            getProduct(
                document.getElementById(
                    "saleProduct"
                ).value
            );


        const quantity =
            Number(
                document.getElementById(
                    "saleQuantity"
                ).value
            );


        const date =
            document.getElementById(
                "saleDate"
            ).value;


        if (quantity > product.stock) {

            showToast(
                `No hay suficiente stock. Disponible: ${product.stock}`
            );

            return;

        }


        product.stock -= quantity;


        data.movements.push({

            id:
                Date.now(),

            type:
                "SALIDA",

            productId:
                product.id,

            quantity:
                quantity,

            supplier:
                "-",

            user:
                currentUser.username,

            date:
                date

        });


        saveData();

        this.reset();

        renderAll();

        showToast(
            "Venta registrada correctamente"
        );

    }
);


function renderExpiry() {

    const table =
        document.getElementById(
            "expiryTable"
        );


    table.innerHTML = "";


    [...data.products]
        .sort(
            (a,b) =>
                new Date(a.expiry) -
                new Date(b.expiry)
        )
        .forEach(product => {

            const days =
                daysUntil(
                    product.expiry
                );


            const status =
                expiryStatus(product);


            table.innerHTML += `
                <tr>

                    <td>
                        <strong>
                            ${product.name}
                        </strong>
                    </td>

                    <td>
                        ${product.presentation}
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        ${formatDate(product.expiry)}
                    </td>

                    <td>
                        ${days < 0
                            ? "Vencido"
                            : days + " días"
                        }
                    </td>

                    <td>
                        <span class="status ${status.className}">
                            ${status.text}
                        </span>
                    </td>

                </tr>
            `;

        });

}



function renderHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    table.innerHTML = "";


    [...data.movements]
        .reverse()
        .forEach(movement => {

            const product =
                getProduct(
                    movement.productId
                );


            table.innerHTML += `
                <tr>

                    <td>
                        ${formatDate(
                            movement.date
                        )}
                    </td>

                    <td>
                        <span class="status ${
                            movement.type === "INGRESO"
                            ? "ok"
                            : "warning"
                        }">
                            ${movement.type}
                        </span>
                    </td>

                    <td>
                        ${product
                            ? product.name
                            : "-"
                        }
                    </td>

                    <td>
                        ${movement.quantity}
                    </td>

                    <td>
                        ${movement.supplier}
                    </td>

                    <td>
                        ${movement.user}
                    </td>

                </tr>
            `;

        });

}


function renderSuppliers() {

    const table =
        document.getElementById(
            "supplierTable"
        );


    table.innerHTML = "";


    data.suppliers.forEach(
        supplier => {

            table.innerHTML += `
                <tr>

                    <td>
                        ${supplier.id}
                    </td>

                    <td>
                        <strong>
                            ${supplier.name}
                        </strong>
                    </td>

                    <td>
                        ${supplier.contact}
                    </td>

                    <td>
                        <button
                            onclick="editSupplier(${supplier.id})">
                            Editar
                        </button>
                    </td>

                </tr>
            `;

        }
    );

}


document.getElementById(
    "addSupplierBtn"
).addEventListener(
    "click",
    addSupplier
);


function addSupplier() {

    const name =
        prompt(
            "Nombre del proveedor:"
        );


    if (!name)
        return;


    const contact =
        prompt(
            "Teléfono / contacto:"
        ) || "-";


    data.suppliers.push({

        id:
            Date.now(),

        name:
            name,

        contact:
            contact

    });


    saveData();

    renderAll();

    showToast(
        "Proveedor agregado"
    );

}


function editSupplier(id) {

    const supplier =
        data.suppliers.find(
            s => s.id === id
        );


    if (!supplier)
        return;


    const name =
        prompt(
            "Nombre:",
            supplier.name
        );


    if (name)
        supplier.name = name;


    const contact =
        prompt(
            "Contacto:",
            supplier.contact
        );


    if (contact)
        supplier.contact = contact;


    saveData();

    renderAll();

    showToast(
        "Proveedor actualizado"
    );

}


function renderReports() {

    const container =
        document.getElementById(
            "reportsContent"
        );


    const total =
        data.products.reduce(
            (sum,p) =>
                sum + p.stock,
            0
        );


    const critical =
        data.products.filter(
            p =>
                p.stock <= p.minimum
        ).length;


    const nearExpiry =
        data.products.filter(
            p =>
                daysUntil(p.expiry) <= 30
        ).length;


    const physical =
        data.products.reduce(
            (sum,p) =>
                sum + p.physical,
            0
        );


    const accuracy =
        total === 0
            ? 100
            : (physical / total) * 100;


    const entries =
        data.movements.filter(
            m =>
                m.type === "INGRESO"
        ).length;


    const exits =
        data.movements.filter(
            m =>
                m.type === "SALIDA"
        ).length;


    container.innerHTML = `

        <div class="report-grid">

            <div class="report-card">
                <span>Stock total</span>
                <strong>
                    ${total}
                </strong>
                <small>unidades</small>
            </div>

            <div class="report-card">
                <span>Stock crítico</span>
                <strong>
                    ${critical}
                </strong>
                <small>productos</small>
            </div>

            <div class="report-card">
                <span>Exactitud</span>
                <strong>
                    ${accuracy.toFixed(1)}%
                </strong>
                <small>
                    físico / registrado
                </small>
            </div>

            <div class="report-card">
                <span>Próximos a vencer</span>
                <strong>
                    ${nearExpiry}
                </strong>
                <small>
                    productos
                </small>
            </div>

            <div class="report-card">
                <span>Ingresos registrados</span>
                <strong>
                    ${entries}
                </strong>
                <small>
                    movimientos
                </small>
            </div>

            <div class="report-card">
                <span>Salidas registradas</span>
                <strong>
                    ${exits}
                </strong>
                <small>
                    movimientos
                </small>
            </div>

        </div>

    `;

}



function renderSettings() {

    const table =
        document.getElementById(
            "settingsTable"
        );


    table.innerHTML = "";


    data.products.forEach(
        product => {

            table.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${product.name}
                        </strong>
                        <br>
                        ${product.presentation}
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        ${product.minimum}
                    </td>

                    <td>
                        <input
                            type="number"
                            min="0"
                            id="minimum-${product.id}"
                            value="${product.minimum}"
                        >
                    </td>

                    <td>
                        <button
                            onclick="updateMinimum(${product.id})">
                            Guardar
                        </button>
                    </td>

                </tr>

            `;

        }
    );

}


function updateMinimum(id) {

    const product =
        getProduct(id);


    const input =
        document.getElementById(
            `minimum-${id}`
        );


    const value =
        Number(input.value);


    if (
        isNaN(value)
        ||
        value < 0
    ) {

        showToast(
            "Valor inválido"
        );

        return;

    }


    product.minimum = value;


    saveData();

    renderAll();

    showToast(
        "Stock mínimo actualizado"
    );

}


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function() {



    }
);