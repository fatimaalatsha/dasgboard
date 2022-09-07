import { useEffect, useState } from "react"
import { Document, Page } from "react-pdf" // Import react-pdf components
import { getFromS3 } from "../../utils/s3-storage" // Import GET S3 object URL function
import { Image } from 'antd' // Import antd components

const DocViewer = ({objectKey}) => {
    const [ url, setUrl ] = useState(null) // Create state to store the URL of the S3 object

    const getDocument = async () => { // Create a function to retrieve the document
        await getFromS3(objectKey).then((url) => { // Call the getFromS3 function
            console.log(url)
            setUrl(url) // Set the URL state
        })
        .catch(error => console.log(error))
    }

    useEffect(() => { // Call the getDocument function on component mount
        if(!url){
            getDocument()
        }
    }, [url])

    return (
        <>
            <Image src={url} width={400} preview={true}/>
        </>
    )
}

export default DocViewer