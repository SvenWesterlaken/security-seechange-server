const _ = require('lodash');

function getStreams(req, res, next) {
	let stats = {};

	this.sessions.forEach(function (session, id) {
		if (session.isStarting) {
			let regRes = /\/(.*)\/(.*)/gi.exec(session.publishStreamPath || session.playStreamPath);

			if (regRes === null) return;

			let [app, stream] = _.slice(regRes, 1);

			if (!_.get(stats, [app, stream])) {
				_.set(stats, [app, stream], {
					publisher: null,
					subscribers: 0
				});
			}

			if (session.isPublishing) {
				_.set(stats, [app, stream, 'publisher'], {
					app: app,
					stream: stream,
					connectedOn: session.connectTime,
					audio: session.audioCodec > 0 ? {
						codec: session.audioCodecName,
						profile: session.audioProfileName,
						samplerate: session.audioSamplerate,
						channels: session.audioChannels
					} : null,
					video: session.videoCodec > 0 ? {
						codec: session.videoCodecName,
						width: session.videoWidth,
						height: session.videoHeight,
						profile: session.videoProfileName,
						level: session.videoLevel,
						fps: session.videoFps
					} : null,
				});
			}
		}
	});

	res.json(stats);
}

function getStream(req, res, next) {

	let publishStreamPath = `/${req.params.app}/${req.params.stream}`;

	let publisherSession = this.sessions.get(this.publishers.get(publishStreamPath));

	if (publisherSession) {
		let streamStats = {
			viewers: 0,
			duration: 0,
			bitrate: 0,
			startTime: null
		};

		streamStats.viewers = _.filter(Array.from(this.sessions.values()), (session) => {
			return session.playStreamPath === publishStreamPath;
		}).length-1;
		streamStats.duration = Math.ceil((Date.now() - publisherSession.startTimestamp) / 1000);
		streamStats.bitrate = streamStats.duration > 0 ? Math.ceil(_.get(publisherSession, ['socket', 'bytesRead'], 0) * 8 / streamStats.duration / 1024) : 0;
		streamStats.startTime = publisherSession.connectTime;

		res.json(streamStats);
	} else {
		res.json({});
	}
}

exports.getStreams = getStreams;
exports.getStream = getStream;
