let orders = []
let isActive = false
let tooltip

function handleMouseUp() {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (!selectedText) {
        removeTooltip()
        return
    }

    // Solo procesar si la selección es exactamente de 4 a 6 dígitos
    if (/^\d{4,6}$/.test(selectedText)) {
        // Eliminar ceros iniciales
        const number = selectedText.replace(/^0+/, "") || "0"

        let message
        if (orders.includes(number)) {
            message = `${number} está, no entregar.`
        } else {
            message = `${number} no está, se puede entregar.`
        }

        // Mostrar tooltip
        showTooltip(selection.getRangeAt(0).getBoundingClientRect(), message)
    } else {
        removeTooltip()
    }
}

function showTooltip(boundingRect, message) {
    removeTooltip() // Remover tooltip anterior si existe

    tooltip = document.createElement("div")
    tooltip.textContent = message

    // Estilos del tooltip
    tooltip.style.position = "fixed"
    tooltip.style.backgroundColor = "#333"
    tooltip.style.color = "#fff"
    tooltip.style.padding = "5px 10px"
    tooltip.style.borderRadius = "5px"
    tooltip.style.fontSize = "14px"
    tooltip.style.zIndex = "9999"
    tooltip.style.top = `${boundingRect.bottom + 5}px`
    tooltip.style.left = `${boundingRect.left}px`
    tooltip.style.whiteSpace = "nowrap" // Evitar que el texto se divida en varias líneas
    tooltip.style.maxWidth = "none" // Sin límite de ancho
    tooltip.style.overflow = "hidden"
    tooltip.style.textOverflow = "ellipsis" // Mostrar "..." si el texto es demasiado largo

    document.body.appendChild(tooltip)

    // Ajustar la posición horizontal si el tooltip se sale de la pantalla
    const tooltipWidth = tooltip.offsetWidth
    const windowWidth = window.innerWidth
    let left = boundingRect.left

    if (left + tooltipWidth > windowWidth) {
        left = windowWidth - tooltipWidth - 10 // 10px de margen
        if (left < 0) left = 0
        tooltip.style.left = `${left}px`
    }
}

function removeTooltip() {
    if (tooltip) {
        tooltip.remove()
        tooltip = null
    }
}

function updateState(data) {
    const previousIsActive = isActive
    isActive = data.isActive
    orders = data.orders || []

    if (isActive && !previousIsActive) {
        document.addEventListener("mouseup", handleMouseUp)
        document.addEventListener("mousedown", removeTooltip)
    } else if (!isActive && previousIsActive) {
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("mousedown", removeTooltip)
        removeTooltip()
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
