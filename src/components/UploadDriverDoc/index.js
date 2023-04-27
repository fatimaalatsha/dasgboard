import { useState } from "react"
import { Button, Drawer, Upload, message, Row, Col, Typography } from "antd"
import { UploadOutlined } from '@ant-design/icons'
import { useParams } from "react-router-dom"

import { putToS3 } from "../../utils/s3-storage"
import { getActiveVehicleId } from "../../utils/driver-status"
import { createDocument } from "../../utils/doc-status"

const { Title } = Typography

const UploadDriverDoc = (props) => {
    const { id } = useParams(); // Get id from url
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState(null)
    const [backFile, setBackFile] = useState(null)
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

    const backUploadConfig = {
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
                setBackFile(file)
            }
            return isAllowed ? false : Upload.LIST_IGNORE
        },
        onRemove: () => {
            setFile(null)
        },
        backFile,
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

    const handleUpload = async (label) => {
        setIsLoading(true)
        const folder = await getFolder(props.name)
        const s3File = await putToS3(props.sub, file, folder, label)
        const payload = {
            'user_id': Number(id),
            'key1': s3File.key,
            'document_type_id': props.doc_id,
        }
        await createDocument(payload)
        .then(() => {
            message.success(`File uploaded successfully`)
            setIsLoading(false)
            props.refetch()
        })
        .catch((error) => {
            message.error(`Error uploading file`)
            console.log(error)
        })
    }

    const handleLicenseUpload = async (front, back) => {
        setIsLoading(true)
        const folder = await getFolder(props.name)
        const s3FrontFile = await putToS3(props.sub, file, folder, front)
        const s3BackFile = await putToS3(props.sub, backFile, folder, back)
        const payload = {
            'user_id': Number(id),
            'key1': s3FrontFile.key,
            'key2': s3BackFile.key,
            'document_type_id': props.doc_id,
        }
        await createDocument(payload)
        .then(() => {
            message.success(`File uploaded successfully`)
            setIsLoading(false)
            props.refetch()
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
            case 'licensing':
                return 'Licensing'
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
                <Row gutter={[8, 24]}>
                    <Col span={24}>
                        { props.name === 'driver_license' && <Title level={5}>Front</Title>}
                        <Upload {...uploadConfig}>
                            <Button icon={<UploadOutlined />} block >Select File</Button>
                        </Upload>
                        { props.name !== 'driver_license' &&
                            <Button 
                                type="primary" 
                                onClick={() => handleUpload('document')}
                                disabled={!file || isLoading}
                                style={{
                                    marginTop: 16,
                                }}
                                block
                                loading={isLoading}
                            >
                                { isLoading ? 'Uploading' : 'Upload File' }
                            </Button>
                        }
                    </Col>
                    { props.name === 'driver_license' &&
                        <Col span={24}>
                            <Title level={5}>Back</Title>
                            <Upload {...backUploadConfig}>
                                <Button disabled={!file} icon={<UploadOutlined />} block >Select File</Button>
                            </Upload>
                            <Button 
                                type="primary" 
                                onClick={() => handleLicenseUpload('front', 'back')}
                                disabled={!backFile || isLoading}
                                style={{
                                    marginTop: 16,
                                }}
                                block
                                loading={isLoading}
                            >
                                { isLoading ? 'Uploading' : 'Upload File' }
                            </Button>
                        </Col>
                    }
                </Row>
            </Drawer>
        </>
    )
}

export default UploadDriverDoc