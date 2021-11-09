const aws = require('aws-sdk')
const s3 = new aws.S3()
const bucket = 'YOUR BUCKET NAME'

exports.handler = async (event, context) => {
	const query = event.queryStringParameters
	if (!query) return { statusCode: 400 }
	const file = query.file
	if (query.auth != '簡易パスワード(configのauth)' && query.pwd !== 'どうでもいいパスフレーズ') {
		return {
			statusCode: 400,
		}
	}
	const requestBody = Buffer.from(JSON.parse(event.body).b64, 'base64')
	await s3.putObject({ Bucket: bucket, Key: `garage/${file}`, Body: requestBody }).promise()
	return {
		statusCode: 200,
		body: 'success',
	}
}
