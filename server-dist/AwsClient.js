"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "YOUR_AWS_KEY";
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || "YOUR_AWS_SECRET_KEY";
var S3_BUCKET = process.env.S3_BUCKET || "dmmquest";
var aws = require('aws-sdk');
function processGetAWS(request, callback) {
    aws.config.update({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });
    var s3 = new aws.S3();
    var url = request.token + '/stage_' + request.stageId + '/quest_' + request.questId + '/f' + new Date().getTime() + '_' + request.fileName;
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: url,
        Expires: 60,
        ContentType: request.fileType,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function (err, data) {
        var result;
        if (err) {
            result = {
                success: false
            };
        }
        else {
            result = {
                sign: data,
                url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + url,
                success: true
            };
        }
        callback(result);
    });
}
exports.processGetAWS = processGetAWS;
//# sourceMappingURL=AwsClient.js.map