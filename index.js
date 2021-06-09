const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };
    
    let requestJSON;
    
    try {
        
        switch (event.routeKey) {
            case 'POST /items':
                requestJSON = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: "Products",
                        Item: {
                            id: requestJSON.id,
                            name: requestJSON.name,
                            price: requestJSON.price
                        }
                    })
                    .promise();
                body = `Put Item ${requestJSON.id}`;
                break;
                
            case 'DELETE /items/{id}':
                const idForDelete = event.pathParameters.id;
                
                await dynamo
                    .delete({
                        TableName: "Products",
                        Key: {
                            id: idForDelete,
                        }
                    })
                    .promise();
                body = `Deleted Item ${idForDelete}`;
                break;
                
            case 'GET /items/{id}':
                const idToFind = event.pathParameters.id;
                body = await dynamo
                    .get({
                        TableName: "Products",
                        Key : { id: idToFind }
                    })
                    .promise();
                break;
                
            case 'GET /items':
                body = await dynamo
                    .scan({ TableName: "Products" }).promise();
                break;
            
            case 'PUT /items/{id}':
                const idForUpdate = event.pathParameters.id;
                requestJSON = JSON.stringify(event.body);
                
                await dynamo
                    .update({ 
                        TableName: "Products",
                        Key: {
                            id: idForUpdate,
                        },
                        UpdateExpression: "set price = :r",
                        ExpressionAttributesValues: {
                            ":r": requestJSON.price, 
                        },
                    }).promise();
                    
                body = `Put item ${idForUpdate}`;
                break;
                
            default:
                throw new Error(`Unsopport route: "${event.routeKey}"`);
        }
    } catch (e) {
        statusCode = 400;
        body = e.message;
    } finally {
        body = JSON.stringify(body);
    }
     
    return {
        headers,
        statusCode,
        body
    }
};
