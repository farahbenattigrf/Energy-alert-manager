
// Charger les alertes enregistrées dans le navigateur
const defaultAlerts = [
    {
        id: 1,
        equipment: "Compteur A01",
        consumption: 220,
        anomaly: "Surconsommation",
        priority: "Critique",
        status: "En attente",
        date: "01/11/2026"
    },
    {
        id: 2,
        equipment: "Machine B02",
        consumption: 150,
        anomaly: "Consommation anormale",
        priority: "Moyenne",
        status: "En cours",
        date: "31/10/2026"
    },
    {
        id: 3,
        equipment: "Compteur C03",
        consumption: 90,
        anomaly: "Anomalie de mesure",
        priority: "Faible",
        status: "Résolue",
        date: "30/10/2026"
    }
];

let alerts = JSON.parse(localStorage.getItem("energyAlerts"));

if (!Array.isArray(alerts)) {
    alerts = defaultAlerts;
    saveAlerts();
}

// Sauvegarder les données
function saveAlerts() {
    localStorage.setItem("energyAlerts", JSON.stringify(alerts));
}

// Afficher les statistiques
function updateStatistics() {
    document.getElementById("total").textContent = alerts.length;

    const critical = alerts.filter(
        alert => alert.priority === "Critique" &&
                 alert.status !== "Résolue"
    ).length;

    const resolved = alerts.filter(
        alert => alert.status === "Résolue"
    ).length;

    document.getElementById("critical").textContent = critical;
    document.getElementById("resolved").textContent = resolved;
}

// Déterminer la classe CSS de priorité
function priorityClass(priority) {
    if (priority === "Critique") return "danger";
    if (priority === "Moyenne") return "warning";
    return "low";
}

// Déterminer la classe CSS du statut
function statusClass(status) {
    if (status === "En attente") return "pending";
    if (status === "En cours") return "progress";
    return "resolved";
}

// Afficher les alertes dans le tableau
function displayAlerts(list = alerts) {
    const alertList = document.getElementById("alert-list");
    const emptyMessage = document.getElementById("empty-message");

    alertList.innerHTML = "";

    if (list.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    list.forEach(alert => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(alert.equipment)}</td>
            <td>${escapeHTML(alert.date)}</td>
            <td>${Number(alert.consumption)} kWh</td>
            <td>${escapeHTML(alert.anomaly)}</td>
            <td>
                <span class="badge ${priorityClass(alert.priority)}">
                    ${escapeHTML(alert.priority)}
                </span>
            </td>
            <td>
                <select class="status-select"
                    onchange="changeStatus(${alert.id}, this.value)">
                    <option value="En attente"
                        ${alert.status === "En attente" ? "selected" : ""}>
                        En attente
                    </option>
                    <option value="En cours"
                        ${alert.status === "En cours" ? "selected" : ""}>
                        En cours
                    </option>
                    <option value="Résolue"
                        ${alert.status === "Résolue" ? "selected" : ""}>
                        Résolue
                    </option>
                </select>
            </td>
            <td>
                <button class="delete-button"
                    onclick="deleteAlert(${alert.id})">
                    Supprimer
                </button>
            </td>
        `;

        alertList.appendChild(row);
    });
}

// Sécuriser l'affichage du texte saisi
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Ajouter une nouvelle alerte
document.getElementById("alert-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const equipment = document.getElementById("equipment").value.trim();
    const consumption = Number(document.getElementById("consumption").value);
    const anomaly = document.getElementById("anomaly").value;
    const priority = document.getElementById("priority").value;
    const message = document.getElementById("form-message");

    if (!equipment || !anomaly || !Number.isFinite(consumption) || consumption <= 0) {
        message.textContent = "Veuillez remplir correctement tous les champs.";
        message.style.color = "#d44444";
        return;
    }

    const newAlert = {
        id: Date.now(),
        equipment,
        consumption,
        anomaly,
        priority,
        status: "En attente",
        date: new Date().toLocaleDateString("fr-FR")
    };

    alerts.unshift(newAlert);

    saveAlerts();
    refreshDashboard();

    this.reset();

    message.textContent = "Alerte ajoutée avec succès !";
    message.style.color = "#20845e";
});

// Modifier le statut d'une alerte
function changeStatus(id, newStatus) {
    alerts = alerts.map(alert => {
        if (alert.id === id) {
            return { ...alert, status: newStatus };
        }
        return alert;
    });

    saveAlerts();
    refreshDashboard();
}

// Supprimer une alerte
function deleteAlert(id) {
    const confirmation = confirm("Voulez-vous vraiment supprimer cette alerte ?");

    if (!confirmation) return;

    alerts = alerts.filter(alert => alert.id !== id);

    saveAlerts();
    refreshDashboard();
}

// Rechercher une alerte
document.getElementById("search").addEventListener("input", function() {
    const query = this.value.toLowerCase().trim();

    const results = alerts.filter(alert =>
        alert.equipment.toLowerCase().includes(query) ||
        alert.anomaly.toLowerCase().includes(query) ||
        alert.status.toLowerCase().includes(query)
    );

    displayAlerts(results);
});

// Actualiser le tableau et les statistiques
function refreshDashboard() {
    updateStatistics();

    const query = document.getElementById("search").value.toLowerCase().trim();

    const results = alerts.filter(alert =>
        alert.equipment.toLowerCase().includes(query) ||
        alert.anomaly.toLowerCase().includes(query) ||
        alert.status.toLowerCase().includes(query)
    );

    displayAlerts(results);
}

// Initialisation
refreshDashboard();
