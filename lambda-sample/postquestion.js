const aws = require('aws-sdk')
const dbName = 'DYNAMODB-TABLE-NAME'
const documentClient = new aws.DynamoDB.DocumentClient()
exports.handler = async (event) => {
	// TODO implement
	const query = event.queryStringParameters
	if (!query) return { statusCode: 400 }
	if (query.auth != '簡易パスワード(configのauth)' && query.pwd === 'どうでもいいパスフレーズ') {
		return {
			statusCode: 400,
		}
	}
	const { body: bodyRaw } = event
	const body = JSON.parse(bodyRaw)
	const getP = {
		TableName: dbName,
		ExpressionAttributeValues: {
			':v1': body.id,
		},
		KeyConditionExpression: 'id = :v1',
	}
	try {
		const p = await documentClient.query(getP).promise()
		if (p.Items.length) {
			return {
				statusCode: 500,
				body: '被っています',
			}
		}
	} catch (e) {
		return {
			statusCode: 500,
			body: e,
		}
	}
	const params = {
		TableName: dbName,
		Item: body,
	}
	try {
		const p = await documentClient.put(params).promise()
		console.log(p)
		return {
			statusCode: 200,
			body: 'success',
		}
	} catch (e) {
		console.log(e)
		return {
			statusCode: 500,
			body: 'error occured by catch',
		}
	}
}
