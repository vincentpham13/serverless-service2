'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
});

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
const TABLE_NAME = process.env.tableName;

const params = {
  TableName: TABLE_NAME,
  Item: {},
}


module.exports.subscribeToSNS = async (event) => {
  
}

module.exports.consumeQueueMessage = async (event) => {
  let consumedMessage = null;
  event.Records.forEach(async function (record) {
    const { body } = record;
    consumedMessage = JSON.parse(JSON.parse(body).Message);
    console.log("🚀 ~ file: handler.js ~ line 28 ~ message", consumedMessage);
  });

  if (consumedMessage) {
    params.Item = consumedMessage;
    await new Promise(function (resolve, reject) {
      ddb.putItem(params, function (error, data) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(data);
          resolve(data);
        }
      })
    });
  }

  return { status: 200 };
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
