import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import { S3Client, GetObjectCommand , PutObjectCommand } from '@aws-sdk/client-s3'// Import S3Client and GetObjectCommand from @aws-sdk/client-s3
import { getSignedUrl } from "@aws-sdk/s3-request-presigner" // Import presigner

const getFromS3 = async (key) => {
    try {
        const auth = await Auth.currentCredentials()
        const s3ObjectKey = `private/${key}`
        const s3 = new S3Client({// Create a new S3Client
            region: 'us-east-2',
            credentials: auth
        })
        const params = { // Create parameters for S3 client
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: s3ObjectKey
        }
        const s3GetCommnd = new GetObjectCommand(params)// Create a new GetObjectCommand
        const url = await getSignedUrl(s3, s3GetCommnd, { expiresIn: 30 })// Create a signed URL
        if (url) {
            return url
        }
    } catch (error) {
        console.log(error)
        return null
    }
}


const uint8ArrayToS3 = async (sub, file) => {
    const objectKey = `Pinkslip/document.pdf` // Set object key

    try {
        const auth = await Auth.currentCredentials() // Get cognito credentials
        const s3ObjectKey = `private/${sub}/${objectKey}` // Set s3 object key
        const s3 = new S3Client({// Create new S3 client instance
            region: 'us-east-2',
            credentials: auth
        })
        const params = { // Create parameters for S3 client
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: s3ObjectKey,
            Body: file,
            ACL: 'private',
            ContentType: 'application/pdf',
        }
        const data = await s3.send(new PutObjectCommand(params))
        if (data) {
            return {
                key: objectKey,
                complete: true,
            }
        }
        return {
            key: '',
            complete: false,
        }
    } catch (error) {
        console.log(error)
        return {
            key: '',
            complete: false,
        }
    }
}
    


export { getFromS3, uint8ArrayToS3 }