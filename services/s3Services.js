const AWS = require('aws-sdk');

const uploadToS3 = (data, fileName, mimeType) => {
    const s3bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET_KEY
    })

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: data,
        ContentType: mimeType,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if(err) {
                //console.log('Something went Wrong', err);
                reject(err);
            }
            else  {
                //console.log('success', s3response);
                resolve(s3response.Location);
            }
        })
    })
}

module.exports = { uploadToS3 };