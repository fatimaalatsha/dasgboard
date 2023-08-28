import { Modal } from "antd"

import { useState } from "react"

const CreateBounsModal = (props) => {
    const [open, setOpen] = useState(true);
    return (
        <Modal
            title="Create Bouns"
            open={open}
        >
            
        </Modal>
    )

}

export default CreateBounsModal