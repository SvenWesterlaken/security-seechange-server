const _ = require('lodash');
const crypto = require('crypto');
const fs = require("fs");

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
				_.set(stats, [app, stream], {
					streamName: stream,
					connectedOn: session.connectTime,
					duration: Math.ceil((Date.now() - session.startTimestamp) / 1000)
				});
				_.set(stats, [app, stream, 'specifications'], {
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

	encryptAndSend(res, stats);
}

function getStream(req, res, next) {

	let publishStreamPath = `/${req.params.app}/${req.params.stream}`;

	let publisherSession = this.sessions.get(this.publishers.get(publishStreamPath));

	if (publisherSession) {
		let stats = {
			viewers: 0,
			duration: 0,
			bitrate: 0,
			startTime: null
		};

		stats.viewers = _.filter(Array.from(this.sessions.values()), (session) => {
			return session.playStreamPath === publishStreamPath;
		}).length;
		stats.duration = Math.ceil((Date.now() - publisherSession.startTimestamp) / 1000);
		stats.bitrate = stats.duration > 0 ? Math.ceil(_.get(publisherSession, ['socket', 'bytesRead'], 0) * 8 / stats.duration / 1024) : 0;
		stats.startTime = publisherSession.connectTime;

		encryptAndSend(res, stats);
	} else {
		encryptAndSend(res, {});
	}
}

function encryptAndSend(res, json) {
	fs.readFile('./certificates/key.pem', function read(err, data) {
		if (err) {
			throw err;
		}
		let content = data;

		let hash = crypto.createHash('sha256').update(Buffer.from(JSON.stringify(json))).digest('hex');
		let digitalSignature = crypto.privateEncrypt(content, Buffer.from(hash, 'utf8'));

		let response = {};
		response.data = json;
		response.digitalSignature = digitalSignature;
		res.json(response);
	});
}

exports.getStreams = getStreams;
exports.getStream = getStream;
