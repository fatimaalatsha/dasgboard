import { useState } from "react"
import { Button, Drawer, Upload, message } from "antd"
import { UploadOutlined } from '@ant-design/icons'

import { putToS3 } from "../../utils/s3-storage"

const UploadDriverDoc = (props) => {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState(null)

    const uploadConfig = {
        maxCount: 1,
        accept: [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'application/pdf',
        ],
        beforeUpload: (file) => {
            const isAllowed = isValid(file)
            if(isAllowed) {
                setFile(file)
            }
            return isAllowed ? false : Upload.LIST_IGNORE
        },
        onRemove: () => {
            setFile(null)
        },
        file,
    }

    const showDrawer = () => {
        setOpen(true)
    }

    const onClose = () => {
        setOpen(false)
    }

    const isValid = (file) => {// Check if file type and size is valid
        const SUPPORTED_FORMATS = [
            'image/jpg', 
            'image/jpeg', 
            'image/png', 
            'application/pdf',
        ]
        const SUPPORTED_SIZE = 10000000 // 10MB

        if(SUPPORTED_FORMATS.includes(file.type)) {
            if(file.size <= SUPPORTED_SIZE) {
                return true
            } else {
                message.error(`${file.name} size is too large`)
                return false
            }
        }
        message.error(`${file.name} type is not supported`)
        return false
    }

    const handleUpload = () => {
        console.log(file)
    }

    return (
        <>
            <Button type="primary" size="small" onClick={showDrawer}>
                Upload
            </Button>
            <Drawer title={`Upload ${props.title}`} placement="right" onClose={onClose} open={open}>
                <Upload {...uploadConfig}>
                    <Button icon={<UploadOutlined />} block >Select File</Button>
                </Upload>
                <Button 
                    type="primary" 
                    onClick={handleUpload}
                    disabled={!file}
                    style={{
                        marginTop: 16,
                    }}
                    block
                >
                    Upload File
                </Button>
            </Drawer>
        </>
    )
}

export default UploadDriverDoc