import React, { useState } from "react"
import { Button, Modal, Typography } from "antd"
import {getOneBonus} from "../../utils/finance-status"


const { Text } = Typography
const BounceDetails = (bounceId) => {

const [bonus, setBonus] = useState([]); // Set bonus state

    // Get bonus
    const fetchBonus = async (bounceId) => {
      const bonus = await getOneBonus(bounceId.bounceId);
      console.log("bounceId",bounceId);
      setBonus(bonus);
    };
    return (
        <Modal
            title="Bounce Details"
            open={true}
            onCancel={() => {}}
            footer={null}
        >
            <Text>Name: {bonus.name}</Text>
            <br />
            <Text>City: {bonus.city_id}</Text>
            <br />
            <Text>Type: {bonus.type}</Text>
            <br />
            <Text>Status: {bonus.status}</Text>
            <br />
            <Text>Goal: {bonus.goal}</Text>
            <br />
            <Text>Payout: {bonus.payout}</Text>
            <br />
            <Text>Start Time: {bonus.start_time}</Text>
            <br />
            <Text>End Time: {bonus.end_time}</Text>            
            <Button onClick={() => fetchBonus(bounceId)}>Get Bonus</Button>

        </Modal>
        
    )
}
    
export default BounceDetails