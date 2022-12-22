import { useEffect, useState, useRef } from "react"
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5" // Import react-pdf components
import { getFromS3 } from "../../utils/s3-storage" // Import GET S3 object URL function
import { Image, Row, Button, Typography, Card, Modal } from 'antd' // Import antd components
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons' // Import antd icons

const { Text } = Typography // Destructure Text from Typography

const PdfRenderer = ({url}) => {
    const [numPages, setNumPages] = useState(null) // Create state to store the number of pages in the PDF
    const [pageNumber, setPageNumber] = useState(1) // Create state to store the current page number
    const [scale, setScale] = useState(1) // Create state to store the scale of the PDF
    const buttonRef = useRef(null) // Create a ref to store the button element
    const [isModalVisible, setIsModalVisible] = useState(false) // Create state to store the modal visibility

    const onDocumentLoadSuccess = ({ numPages }) => { // Create a function to set the number of pages in the PDF
        setNumPages(numPages)
    }

    return (
        <>
            <Button style={{display: 'none'}} ref={buttonRef} onClick={() => setIsModalVisible(true)} />
            <Card hoverable onClick={() => buttonRef.current?.click()}>
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={1} />
                </Document>
            </Card>
            <Modal
                open={isModalVisible}
                width={800}
                onCancel={() => setIsModalVisible(false)}
                bodyStyle={{height: 500, overflowY: 'auto'}}
                destroyOnClose={true}
                footer={
                    <Row justify="space-between">
                        <Button key="previous" type="primary" onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber === 1}>Previous</Button>
                        <Text key="page">Page {pageNumber} of {numPages}</Text>
                        <ZoomOutOutlined onClick={() => setScale(scale - 0.5)} />
                        <ZoomInOutlined onClick={() => setScale(scale + 0.5)} />
                        <Text key="scale">{Math.round(scale * 100)}%</Text>
                        <Button key="next" type="primary" onClick={() => setPageNumber(pageNumber + 1)} disabled={pageNumber === numPages}>Next</Button>
                    </Row>
                }
            >
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} scale={scale} />
                </Document>
            </Modal>
        </>
    )
}

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
            {fileType.toLowerCase() === 'pdf' ? (
                <PdfRenderer url={url} />
            ) : (
                <Image src={url} width={400} preview={true}/>
            )}
        </>
    )
}

export default DocViewer