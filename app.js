const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const sharp = require('sharp')
const download = require('image-downloader')
const jsonpatch = require('fast-json-patch')
const bodyParser = require('body-parser')
const { Console } = require('console');
const fs = require('fs')
const morgan = require('morgan')
const key = require('./key')
const app = express();
const router = express.Router()

app.set('view engine', 'ejs');
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'images')))
const accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/img_thumb.log'), { flags: 'a' })
const accessErrorStream = fs.createWriteStream(path.join(__dirname, '/logs/img_thumb_err.log'), { flags: 'a' })
const logger = new Console({ stdout: accessLogStream, stderr: accessErrorStream });
app.use(morgan('combined', { stream: accessLogStream }))


const typeOfImages = ['jpg', 'png', 'tif', 'svg']
extensionFile = (urladdr) => {
	return urladdr.split('.').pop().split(/\#|\?/)[0]
}

thumbnailCreation = (req, res, next) => {
	const { url } = req.body
	const extOfUrl = extensionFile(url)

	if (typeOfImages.includes(extOfUrl)) {
		const options = {
			url: url,
			dest: './images/original/',
		}

		const resizeDest = './images/resized/'
		const outputFile = (Date.now()).toString()
		download.image(options).then(({ filename }) => {
			sharp(filename).resize(50, 50).toFile(`${resizeDest}${outputFile}.${extOfUrl}`, (err) => {
				if (err) { return next(err) }
				return res.json({
					conversionStatus: 'successful', success: 'Thumbnail generated', userInfo: req.user.username, thumbnail: resizeDest + (outputFile) + '.' + extOfUrl,
				})
			})
		})
			.catch(() => {
				res.status(400).json({ error: 'Image Url is not valid' })
				logger.error(new Date(), 'Image Url is not valid')

			})
	} else {
		res.status(400).json({ error: `unexpected Image extension found- these are the valid ext ${[...typeOfImages]}` })
		logger.error(new Date(), `unexpected Image extension found- these are the valid ext ${[...typeOfImages]}`)
	}
}

tokenVerifing = (req, res, next) => {
	const { token } = req.headers
	if (!token) {
		return res.status(403).json({ authorized: false, error: 'Token is missing, Kindly generate a token' })
		logger.error(new Date(), 'Token is missing, Kindly generate a token')
	}
	jwt.verify(token, key.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({ authorized: false, error: 'Please generate another token because Verification failed. Token might has expired.' })
			logger.error(new Date(), 'Please generate another token because Verification failed. Token might has expired.')
		}
		req.user = decoded
		next()
	})
}

app.post('/api/users/login', (req, res) => {
	const username = req.body.username
	const password = req.body.password
	const token = jwt.sign({ username: username }, key.secret, { expiresIn: 21600 })
	req.headers['token'] = token
	res.status(200).send({ user: username, authorized: true, token: token })
});
app.post('/api/thumbnail', tokenVerifing, thumbnailCreation);


app.use((req, res, next) => {
	const err = new Error('Not Found')
	err.status = 404
	res.status(404).send({ error: 'Page does not exist' })
	next(err)
})

app.use((err, req, res) => {
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	res.status(err.status || 500)
	res.render('error')
})


module.exports = app