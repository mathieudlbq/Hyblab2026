const API = window.location.origin + "/actu/api";

async function init() {
    const response = await fetch(API + "/create-user", {
        method: "GET",
        credentials: "include"
    });

    if (response.status === 201) {
        location.reload();
    }
}

init();