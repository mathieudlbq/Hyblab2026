function Bookshelf(){
    const app = document.getElementById('bookshelf-app');
    app.innerHTML = '';

    const rows = [];
    for (let i = 0; i < mockData.length; i += 3) {
        rows.push(mockData.slice(i, i + 3));
    }
}