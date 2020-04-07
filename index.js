const app = require('express')()
const { promisify } = require('util')
const { getInfo, filterFormats } = require('ytdl-core')

app.use(require('cors')())

app.get('/', async (req, res) => {
	if (!req.query.video) {
		res.status(400).json({
			message: 'video url or id is required'
		})
	}

	try {
		let info = await promisify(getInfo)(req.query.video)
		let audios = filterFormats(info.formats, 'audioonly').map(
			({ url, container, audioBitrate }) => ({
				url,
				format: container,
				bitrate: audioBitrate
			})
		)
		const {
			title,
			lengthSeconds,
			channelId,
			viewCount,
			author
		} = info.player_response.videoDetails

		return res.json({
			info: {
				title,
				lengthSeconds,
				channelId,
				viewCount,
				author
			},
			audios,
			relatedVideos: info.related_videos
		})
	} catch (error) {
		console.log(error.message)
		console.log(error.stack)
		res.status(500).json({
			message: 'Unexpected error occured'
		})
	}
})

app.listen(3000, () => {
	console.log('http://localhost:3000')
})
