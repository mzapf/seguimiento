let orders = []
let isActive = false

function handleMouseUp() {
    const selection = window.getSelection().toString().trim()

    if (!selection) {
        return
    }

    // Solo procesar si la selección es exactamente de 4 a 6 dígitos
    if (/^\d{4,6}$/.test(selection)) {
        // Eliminar ceros iniciales
        const number = selection.replace(/^0+/, "") || "0"

        if (orders.includes(number)) {
            chrome.runtime.sendMessage({
                type: "notify",
                message: `${number} está, no entregar.`,
            })
        } else {
            chrome.runtime.sendMessage({
                type: "notify",
                message: `${number} no está, se puede entregar.`,
            })
        }
    }
}

function updateState(data) {
    const previousIsActive = isActive
    isActive = data.isActive
    orders = data.orders || []

    if (isActive && !previousIsActive) {
        document.addEventListener("mouseup", handleMouseUp)
    } else if (!isActive && previousIsActive) {
        document.removeEventListener("mouseup", handleMouseUp)
    }
}

chrome.storage.sync.get(["orders", "isActive"], function (data) {
    updateState(data)
})

chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "sync") {
        if (changes.isActive || changes.orders) {
            chrome.storage.sync.get(["orders", "isActive"], function (data) {
                updateState(data)
            })
        }
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "promptOrders") {
        const orderList = prompt(
            "Ingrese números de pedidos separados por espacios:"
        )

        if (orderList) {
            const ordersInput = orderList
                .split(" ")
                .map((order) => order.trim())
                .filter((order) => /^\d{4,6}$/.test(order))

            chrome.storage.sync.set({ orders: ordersInput }, function () {
                if (chrome.runtime.lastError) {
                    alert("Hubo un error al guardar los pedidos.")
                } else {
                    orders = ordersInput
                    chrome.runtime.sendMessage({
                        type: "ordersUpdated",
                        orders: ordersInput,
                    })
                }
            })
        } else {
            chrome.storage.sync.set({ orders: [] }, function () {
                orders = []
                chrome.runtime.sendMessage({
                    type: "ordersUpdated",
                    orders: [],
                })
            })
        }
    }
})
