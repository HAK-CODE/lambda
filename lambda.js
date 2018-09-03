
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

exports.handler = (event, context, callback) => {
    console.log('SQS trigger fired');
    if (event.http_method === 'GET'){
        if (typeof event.item !== 'undefined'){
            var params = {
                Key:{
                    item: event.item
                },
                TableName: 'warehouse'
            };
            docClient.get(params, function(err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data)
                }
            });
        }
        else{
            var params = {
                TableName: 'warehouse'
            };
            docClient.scan(params, function (err, data){
                if (err) {
                    callback(err, null);
                } else {
                    if (typeof event.isSort !== 'undefined' && event.isSort == 1){
                        console.log(event.isSort);
                        var sorted = data.Items.sort(function(first, second){
                            return first.item < second.item;
                        });
                        data.Items = sorted;
                    }
                    callback(null, data)
                }
            });
        }
    }
    else if (event.http_method === 'DELETE'){
        var params = {
            Key:{
                item: event.item
            },
            TableName: 'warehouse'
        };
        docClient.delete(params, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {'message': event.item+" successfully removed."});
            }
        });
    }
    else if (event.http_method === 'POST'){
        var allitems = event.body_json
        allitems.data.forEach(function(it) {
            var params = {
                Item:{
                    item: it.item,
                    iname: it.iname,
                    date: Date(Date.now())
                },
                TableName: 'warehouse'
            };

            docClient.put(params, function(err, data) {
                if (err) {
                    callback(err,null);
                } else {
                    callback(null, {"message":" successfully posted."});
                }
            });
        });
    }
    else if (event.http_method === 'PUT'){
        var params = {
            Key:{
                item: event.item
            },
            UpdateExpression: "set iname = :r",
            ExpressionAttributeValues:{
                ":r":event.iname
            },
            ReturnValues:"UPDATED_NEW",
            TableName: 'warehouse'
        };
        docClient.update(params, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {"message": event.item+" successfully updated."});
            }
        });
    }
    else{
        callback(null, {message: 'no method as '+event.hasOwnProperty});
    }
};