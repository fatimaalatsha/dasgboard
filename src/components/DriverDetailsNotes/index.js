import {useState} from "react"
import { FloatButton, Drawer, Timeline } from "antd"
import { ProfileOutlined } from "@ant-design/icons"

const items = [
    {
        title: "Driver Details",
        description: "Driver details updated",
        date: "2021-01-01 12:00:00",

    },
    {
        title: "Driver Details",
        description: "Driver details updated",
        date: "2021-01-01 12:00:00",
    },
]

const DriverDetailsNotes = () => {
    const [open, setOpen] = useState(false)

    const showDrawer = () => {
      setOpen(true)
    }

    const onClose = () => {
      setOpen(false)
    }

    return (
        <>
            <FloatButton 
                type="default"
                shape="square"
                icon={<ProfileOutlined />}
                description="Notes"
                style={{
                    width: 52,
                    height: 52,
                }}
                onClick={showDrawer}
            />
            <Drawer title="Notes" placement="right" onClose={onClose} open={open}>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
                <Timeline>
                    {
                        items.map((item, index) => (
                            <Timeline.Item key={index}>
                                <>
                                    <p>{item.date}</p>
                                    <p>{item.title}</p>
                                    <p>{item.description}</p>
                                </>
                            </Timeline.Item>
                        ))
                    }
                </Timeline>
            </Drawer>
        </>
    )
}

export default DriverDetailsNotes