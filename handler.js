'use strict';

const AWS = require('aws-sdk');
// const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });

AWS.config.update({
  region: 'us-east-1',
});

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
const TABLE_NAME = 'db-service-1';

const params = {
  TableName: TABLE_NAME,
  Item: {
    'MESSAGE': { S: 'This is the default message to data service 1.' },
    'AUTHOR': { S: 'Vincent Pham' },
    // 'CREATED_AT': new Date().toUTCString(),
  }
}

module.exports.putDynamoItem = async (event) => {
  params.Item['Id'] = { N: new Date().getTime().toString() };
  params.Item['CREATED_AT'] = { S: new Date().toISOString() };

  // Override the default message if the message query presents on the url
  if (event.queryStringParameters && event.queryStringParameters.message) {
    params.Item['MESSAGE'] = { S: event.queryStringParameters.message };
  }

  // Call DynamoDB to add the item to the table 
  const result = await new Promise((resolve, reject) => {
    ddb.putItem(params, function (error, data) {
      if (error) {
        console.log("🚀 ~ file: handler.js ~ line 26 ~ ddb.putItem ~ error", error);
        resolve({
          statusCode: 500,
          body: JSON.stringify(
            {
              message: 'There was an error during saving the message to data service 1.',
              stack: error,
            },
            null,
            2
          ),
        });
      } else {
        console.log("🚀 ~ file: handler.js ~ line 25 ~ data", data)
        resolve({
          statusCode: 200,
          body: JSON.stringify(
            {
              message: params.Item.MESSAGE,
            },
            null,
            2
          ),
        });
      }
    });
  });

  return result;
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const sns = new AWS.SNS({ apiVersion: '2012-08-10' })
const topicARN = 'arn:aws:sns:us-east-1:653332051596:service1-topic';
module.exports.getDynamoItem = async (event) => {
  let newMessage = null;
  event.Records.map(function (record) {
    console.log('record', JSON.stringify(record, null, 2));

    if (record.eventName == 'INSERT') {
      console.log(record.dynamodb.NewImage);
      newMessage = record.dynamodb.NewImage;
    }
  });

  if (newMessage) {
    const params = {
      TopicArn: topicARN,
      Message: JSON.stringify(newMessage),
      Subject: 'Hello queue'
    };

    await new Promise(function (resolve, reject) {
      sns.publish(params, function (error, data) {
        if (error) {
          console.log("🚀 ~ file: handler.js ~ line 85 ~ sns.publish ~ error", error)
          reject(error);
        } else {
          console.log("🚀 ~ file: handler.js ~ line 89 ~ sns.publish ~ data", data)
          resolve(data);
        }
      })
    });
  }

  // // Call DynamoDB to add the item to the table 
  // const result = await new Promise((resolve, reject) => {
  //   ddb.putItem(params, function (error, data) {
  //     if (error) {
  //       console.log("🚀 ~ file: handler.js ~ line 26 ~ ddb.putItem ~ error", error);
  //       resolve({
  //         statusCode: 500,
  //         body: JSON.stringify(
  //           {
  //             message: 'There was an error during saving the message to data service 1.',
  //             stack: error,
  //           },
  //           null,
  //           2
  //         ),
  //       });
  //     } else {
  //       console.log("🚀 ~ file: handler.js ~ line 25 ~ data", data)
  //       resolve({
  //         statusCode: 200,
  //         body: JSON.stringify(
  //           {
  //             message: params.Item.MESSAGE,
  //           },
  //           null,
  //           2
  //         ),
  //       });
  //     }
  //   });
  // });

  return { status: 200 };
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
