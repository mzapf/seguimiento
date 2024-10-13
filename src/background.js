chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ isActive: false, orders: [] }, function () {})
    chrome.action.setIcon({
        path: {
            16: "icons/icon16_gray.png",
            48: "icons/icon48_gray.png",
            128: "icons/icon128_gray.png",
        },
    })
    chrome.action.setBadgeText({ text: "" })
})

chrome.action.onClicked.addListener(function (tab) {
    chrome.storage.sync.get(["isActive", "orders"], function (data) {
        const isActive = !data.isActive

        chrome.storage.sync.set({ isActive: isActive }, function () {
            if (isActive) {
                chrome.tabs.query(
                    { active: true, currentWindow: true },
                    function (tabs) {
                        if (tabs.length > 0) {
                            const activeTab = tabs[0]
                            chrome.tabs.sendMessage(
                                activeTab.id,
                                { type: "promptOrders" },
                                function (response) {
                                    if (chrome.runtime.lastError) {
                                    } else {
                                        updateBadgeAndIcon(
                                            isActive,
                                            response.orders
                                        )
                                    }
                                }
                            )
                        }
                    }
                )
            } else {
                chrome.storage.sync.set({ orders: [] }, function () {
                    updateBadgeAndIcon(isActive, [])
                })
            }
        })
    })
})

function updateBadgeAndIcon(isActive, orders) {
    if (isActive && orders.length > 0) {
        chrome.action.setBadgeText({ text: orders.length.toString() })
        chrome.action.setIcon({
            path: {
                16: "icons/icon16.png",
                48: "icons/icon48.png",
                128: "icons/icon128.png",
            },
        })
    } else {
        chrome.action.setBadgeText({ text: "" })
        chrome.action.setIcon({
            path: {
                16: "icons/icon16_gray.png",
                48: "icons/icon48_gray.png",
                128: "icons/icon128_gray.png",
            },
        })
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "ordersUpdated") {
        chrome.storage.sync.get("isActive", function (data) {
            updateBadgeAndIcon(data.isActive, request.orders)
        })
    } else if (request.type === "notify") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Verificador de Pedidos",
            message: request.message,
            priority: 1,
        })
    }
})
