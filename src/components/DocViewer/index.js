import { useEffect, useState, useRef } from "react"
import { pdfjs } from "react-pdf/dist/esm/entry.webpack5" // Import react-pdf components
import { getFromS3 } from "../../utils/s3-storage" // Import GET S3 object URL function
import { Image, Typography, Spin } from 'antd' // Import antd components

const { Text } = Typography // Destructure Text from Typography

const PdfRenderer = ({url}) => {
    const [image, setImage] = useState([]) // Create state to store the image
    const [loading, setLoading] = useState(true) // Create state to store the loading state
    const [visible, setVisible] = useState(false) // Create state to store the preview visibility
    const componentIsMounted = useRef(true) // Create a ref to store the component mount state

    const renderPage = async () => { // Create a function to render the PDF
        const _PDF_DOC = await pdfjs.getDocument(url).promise // Get the PDF document
        const imageList = [] // Create an array to store the images
        const canvas = document.createElement('canvas') // Create a canvas element
        for ( let i = 1; i <= _PDF_DOC.numPages; i++ ) { // Loop through the pages
            const page = await _PDF_DOC.getPage(i) // Get the page
            const viewport = page.getViewport({ scale: 1 }) // Get the viewport
            canvas.width = viewport.width // Set the canvas width
            canvas.height = viewport.height // Set the canvas height
            const renderContext = { canvasContext: canvas.getContext('2d'), viewport } // Create the render context
            await page.render(renderContext).promise // Render the page
            imageList.push(canvas.toDataURL('image/jpeg')) // Push the image to the image list
        }
        setImage(imageList) // Set the image state
        setLoading(false) // Set the loading state
    }

    useEffect(() => {
        if (componentIsMounted.current) {
            renderPage() // Call the renderPage function on component mount
        }
        return () => {
            componentIsMounted.current = false // Set the component mount state to false on component unmount
        }
    }, [])

    return (
        <>
            {
                loading ? (
                    <Spin size="large" />
                ) : (
                    <>
                    <Image src={image[0]} width={400} preview={{ visible: false }} onClick={() => setVisible(true)} />
                    <div style={{ display: 'none' }}>
                        <Image.PreviewGroup
                            preview={{
                                visible,
                                onVisibleChange: (visible) => setVisible(visible),
                            }}
                        >
                            { image.map((img, index) => <Image key={index} src={img} width={400} /> ) }
                        </Image.PreviewGroup>
                    </div>
                    </>
                )
            }
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
        return <Spin size="large" />
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