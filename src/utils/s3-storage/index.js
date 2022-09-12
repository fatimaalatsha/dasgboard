import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'// Import S3Client and GetObjectCommand from @aws-sdk/client-s3
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

export { getFromS3 }