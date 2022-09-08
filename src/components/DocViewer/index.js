import { useEffect, useState } from "react"
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5" // Import react-pdf components
import { getFromS3 } from "../../utils/s3-storage" // Import GET S3 object URL function
import { Image } from 'antd' // Import antd components

const DocViewer = ({objectKey}) => {
    const [ url, setUrl ] = useState(null) // Create state to store the URL of the S3 object
    const fileType = objectKey.match(/\.([^.]+)$/)[1] // Get file type

    const getDocument = async () => { // Create a function to retrieve the document
        await getFromS3(objectKey).then((url) => { // Call the getFromS3 function
            setUrl(url) // Set the URL state
        })
        .catch(error => console.log(error))
    }

    useEffect(() => { // Call the getDocument function on component mount
        if(!url){
            getDocument()
        }
    }, [url])

    if(!url) {
        return <div>Loading...</div>
    }

    return (
        <>
            {fileType === 'pdf' ? (
                <Document file={url}>
                    <Page pageNumber={1} />
                </Document>
            ) : (
                <Image src={url} width={400} preview={true}/>
            )}
        </>
    )
}

export default DocViewer