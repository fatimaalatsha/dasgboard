import { useState } from "react"
import { Button, Drawer, Upload, message } from "antd"
import { UploadOutlined } from '@ant-design/icons'
import { useParams } from "react-router-dom"

import { putToS3 } from "../../utils/s3-storage"
import { getActiveVehicleId } from "../../utils/driver-status"

const UploadDriverDoc = (props) => {
    const { id } = useParams(); // Get id from url
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

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

    const handleUpload = async () => {
        setIsLoading(true)
        const folder = await getFolder(props.name)
        await putToS3(props.sub, file, folder, 'document')
        .then((response) => {
            message.success(`File uploaded successfully`)
            setIsLoading(false)
            console.log(response)
            props.refetch()
            // TODO - Add file to database
            // TODO - Add DL validation
        })
        .catch((error) => {
            message.error(`Error uploading file`)
            console.log(error)
        })
    }

    const getVehicleId = async () => {
        const vehicleID = await getActiveVehicleId(id)
        return vehicleID
    }

    const getFolder = async (name) => {
        let vehicleid = null
        switch (name) {
            case 'background':
                return 'Background'
            case 'work_permit':
                return 'Work'
            case 'driver_license':
                return 'License'
            case 'abstract':
                return 'Abstract'
            case 'insurance':
                vehicleid = await getVehicleId()
                return `Vehicle/${vehicleid}/Insurance`
            case 'safety':
                vehicleid = await getVehicleId()
                return `Vehicle/${vehicleid}/Safety`
            case 'ownership':
                vehicleid = await getVehicleId()
                return `Vehicle/${vehicleid}/Owner`
            default:
                return 'other'
        }
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
                    disabled={!file || isLoading}
                    style={{
                        marginTop: 16,
                    }}
                    block
                    loading={isLoading}
                >
                    { isLoading ? 'Uploading' : 'Upload File' }
                </Button>
            </Drawer>
        </>
    )
}

export default UploadDriverDoc