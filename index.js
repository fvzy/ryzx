__path = process.cwd();
var favicon = require('serve-favicon');
const multer = require( 'multer')
const fs = require( 'fs')
const path = require( 'path')
var express = require('express'),
    cors = require('cors'),
    secure = require('ssl-express-www');
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    database = require("./db/mongo"),
    db = database.get("short-link");
const PORT = 3000
var { color } = require('./lib/color.js')
if (!fs.existsSync('./views/file')) fs.mkdirSync('./views/file')

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

var app = express()
var mainrouter = require('./routes/main'),
    apirouter = require('./routes/api')



function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.enable('trust proxy');
app.set("json spaces",2)
app.use(cors())
app.use(secure)
app.use(logger('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(favicon(__path +'/views/favico.ico'))
app.use(express.static("public"))
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.use('/', mainrouter);
app.use('/api', apirouter);


const storage = multer.diskStorage({
    destination: 'views/file',
    filename: (req, file, cb) => {
        cb(null, makeid(12) +
            path.extname(file.originalname))
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10000000 // 10 MB
    }
})

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file.path) return res.status(400).json({
        status: false,
        message: "No file uploaded"
    })
    res.status(200).json({
        status: true,
        message: "uploader",
        result: {
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: "https://" + req.hostname + "/file/" + req.file.filename
        }
    })
}, (error, req, res, next) => {
    res.status(400).json({
        error: error.message
    })
})
app.get('/totalf', (req, res) => {
    const dir = __path + '/views/file/'
    fs.readdir(dir, (err, files) => {
      res.json({ total: files.length })
    });
    })

app.post('/multi-upload', upload.array('files', 10), (req, res) => {
    if (!req.files) return res.status(400).json({
        status: false,
        message: "No file uploaded"
    })
    const result = []
    req.files.forEach(v => {
        result.push({
            originalname: v.originalname,
            encoding: v.encoding,
            mimetype: v.mimetype,
            size: v.size,
            url: "https://" + req.hostname + "/file/" + v.filename
        })
    });
    res.status(200).json({
        status: true,
        message: "uploader",
        result: result
    })
})

app.listen(PORT, () => {
    console.log(color("Server running on port " + PORT,'green'))
})

module.exports = app
