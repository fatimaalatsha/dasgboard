import { useState } from "react"
import { Button, Badge, Drawer, Segmented } from "antd"

import { BellOutlined } from '@ant-design/icons'

const Notifications = () => {
    const [open, setOpen] = useState(false)
    const [section, setSection] = useState(0)

    const segmentOptions = [
        {
            value: 0,
            label: 'Unread',
        },
        {
            value: 1,
            label: 'Read',
        }
    ]

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            <Badge
                count={8}
            >
                <Button 
                    size="large"
                    icon={<BellOutlined />}
                    onClick={handleOpen}
                />
            </Badge>
            <Drawer
                title={
                    <Segmented 
                        block
                        options={segmentOptions}
                        value={section}
                        onChange={setSection}
                    />
                }
                placement="right"
                onClose={handleClose}
                open={open}
            >
                { !section ? (
                    [...Array(100)].map((_,idx) => (
                    <p key={idx}>Unread</p>
                    ))
                ) : (
                    [...Array(100)].map((_,idx) => (
                        <p key={idx}>Read</p>
                        ))
                )
                }
            </Drawer>
        </>
    )
}

export default Notifications