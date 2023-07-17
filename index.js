import express, { json } from "express";
import dotenv from 'dotenv'
import morgan from "morgan";
import cors from 'cors'
import helment from 'helmet'
import path from 'path'
import { fileURLToPath } from "url";
import multer from "multer";
import { createWorker } from 'tesseract.js';

/**
 * config and middlewares
*/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
dotenv.config()
app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ extended: true, limit: '30mb' }))
app.use(morgan('dev'))
app.use(cors())
app.use(helment.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

/**
 * file Upload
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })
/**
 * 
 */

const worker = await createWorker({
    logger: m => console.log(m)
});


app.post('/ocr', upload.single('image'), async (req, res) => {
    try {
        await worker.loadLanguage(req.body.languageCode);
        await worker.initialize(req.body.languageCode);
        const { data: { text } } = await worker.recognize(`./assets/${req.file.filename}`)
        res.status(200).json({ data: text })
    } catch (error) {
        res.status(500).json({ error })
    }
})

app.get('/',(req,res)=>{
res.json({message:"welcome to the ocr api"})
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
