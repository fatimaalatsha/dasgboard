import { Button, Badge } from "antd"

import { BellOutlined } from '@ant-design/icons'

const Notifications = () => {
    return (
        <Badge
            count={5}
        >
            <Button 
                size="large"
                icon={<BellOutlined />} 
            />
        </Badge>
    )
}

export default Notifications