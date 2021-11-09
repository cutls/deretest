const aws = require('aws-sdk')
const documentClient = new aws.DynamoDB.DocumentClient()
const dbName = 'DYNAMODB-TABLE-NAME'
exports.handler = async (event) => {
	// TODO implement
	const query = event.queryStringParameters
	if (!query) return { statusCode: 400 }
	if (query.auth !== '簡易パスワード(configのauth)') {
		return {
			statusCode: 400,
		}
	}
	const params = {
		TableName: dbName,
		ExpressionAttributeValues: {
			':v1': query.id,
		},
		KeyConditionExpression: 'id = :v1',
	}
	try {
		const p = await documentClient.query(params).promise()
		return {
			statusCode: 200,
			body: JSON.stringify(p.Items[0]),
		}
	} catch (e) {
		return {
			statusCode: 500,
			body: e,
		}
	}
}
