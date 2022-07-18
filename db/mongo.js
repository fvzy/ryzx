const monk = require('monk')

// Connection URL
var url = "mongodb+srv://lyzn:lyzn221@cluster0.lgh9lwg.mongodb.net/?retryWrites=true&w=majority";
try {
    if (url == '') throw console.log('Cek konfigurasi database, var url belum diisi');
} catch (e) {
    return;
}
var db = monk(url);

db.then(() => {
        console.log('Connected correctly to server')
    })
    .catch((e) => {
        console.log("Gagal connect ke database, \ncek configurasi database apakah Connection URL sudah benar")
    })

module.exports = db
