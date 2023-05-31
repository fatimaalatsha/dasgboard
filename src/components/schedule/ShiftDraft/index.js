import { useState } from 'react'
import { Row, Col, Card, Space, Button } from 'antd'

const ShiftDraft = ({ shift, onEdit, onDelete }) => {
    const [dummy, setDummy] = useState([
        { id: 1, title: 'Shift 1', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 2', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 3', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 4', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 5', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 6', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 7', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
        { id: 1, title: 'Shift 8', guarantee: null, guarantee_specs: '', capacity: 0, start_time: '2021-01-01 00:00:00', end_time: '2021-01-01 00:00:00', is_recurring: true, end_date: null, never_ends: false, pattern: 'weekly', days_of_week: [0, 1, 2, 3, 4, 5, 6], max_occurrences: 0 },
    ])
    const colConfig = {
        span: 6,
    }

    return (
        <Row gutter={[16, 16]}>
            {
                dummy.map((item, index) => (
                    <Col {...colConfig} key={index}>
                        <Card
                            title={item.title}
                            extra={
                                <Space>
                                    <Button size="small" danger onClick={() => onDelete(item)}>Delete</Button>
                                    <Button size="small" type="primary" onClick={() => onEdit(item)}>Edit</Button>
                                </Space>
                            }
                        >
                            <p>Guarantee: {item.guarantee}</p>
                            <p>Guarantee Specs: {item.guarantee_specs}</p>
                            <p>Capacity: {item.capacity}</p>
                            <p>Start Time: {item.start_time}</p>
                            <p>End Time: {item.end_time}</p>
                            <p>Is Recurring: {item.is_recurring}</p>
                            <p>End Date: {item.end_date}</p>
                            <p>Never Ends: {item.never_ends}</p>
                            <p>Pattern: {item.pattern}</p>
                            <p>Days of Week: {item.days_of_week}</p>
                            <p>Max Occurrences: {item.max_occurrences}</p>
                        </Card>
                    </Col>
                ))
            }
        </Row>
    )
}

export default ShiftDraft