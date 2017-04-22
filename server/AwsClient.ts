const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || 'YOUR_AWS_KEY';
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || 'YOUR_AWS_SECRET_KEY';
const S3_BUCKET = process.env.S3_BUCKET || 'dmmquest';
const aws = require('aws-sdk');
const path = require('path');


console.log('AWS_SECRET_KEY: ' + AWS_SECRET_KEY);
console.log('AWS_ACCESS_KEY: ' + AWS_ACCESS_KEY);

export function processGetAWS(request: GetAWSSignRequest, callback: (GetAWSSignResponse) => void) {
    aws.config.update({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });
    const s3 = new aws.S3();
    let extension = path.extname(request.fileName == null ? 'default.jpg' : request.fileName);

    const url = request.token + '/stage_' + request.stageId + '/quest_' + request.questId + '/f_' + new Date().getTime() + '_' + request.type + extension;
    const s3_params = {
        Bucket: S3_BUCKET,
        Key: url,
        Expires: 60,
        ContentType: request.fileType,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function (err, data) {
        let result: GetAWSSignResponse;
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