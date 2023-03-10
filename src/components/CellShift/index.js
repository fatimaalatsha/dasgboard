import { useState } from 'react'
import { 
    Card, 
    theme, 
    Space, 
    Row, 
    Typography, 
    Tag, 
    Modal, 
    Input, 
    Button, 
    TimePicker, 
    Checkbox, 
    Select,
    Dropdown 
} from 'antd'
import { ArrowRightOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import { object, string, number } from 'yup' // Import Yup for form validation

import { useFilterStore } from '../../store'

import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import { CitySelect } from '../CitySelect' // Import CitySelect component
import generateName from '../../utils/name-creation' // Dummy name array generator

const { useToken } = theme
const { Text, Title } = Typography

const getFilledHours = (end, start) => {
    const hoursDiff = dayjs(end, 'HH:mm').diff(dayjs(start, 'HH:mm'), 'hour', true)
    return hoursDiff
}

const shiftSchema = object().shape({
    drivers: number().required('Required'),
    start: string().required('Required'),
    end: string().required('Required'),
    city: number().required('Required'),
})

const items = [
    {
        key: 1,
        label: 'Edit',
    },
    {
        key: 2,
        label: 'Send to Draft',
    },
    {
        key: 3,
        danger: true,
        label: 'Delete',
    },
]

const generateNames = (numNames) => {
    const names = [];
    for (let i = 0; i < numNames; i++) {
      names.push(generateName());
    }
    return names;
  }
  
const namesArray = generateNames(30)

const ShiftCard = ({record, cardStyle}) => {
    return (
        <div className="floating-component" style={{ position: 'absolute', top: 5, left: 5, zIndex: 999, width: 'calc(100% - 10px)' }}>
            <Card 
                style={cardStyle}
                bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 8 }}
            >
                <Row justify="end">
                    <Dropdown menu={{items}} >
                        <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <MoreOutlined />
                        </Space>
                        </a>
                    </Dropdown>
                </Row>
                <Row style={{ display: 'flex', height: '100%'}}>
                    <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <Space style={{ display: 'flex', columnGap: 2, alignItems: 'baseline' }}>
                            <Title level={1} style={{ margin: 0 }}>0</Title>
                            <Title level={4} type="secondary" style={{ margin: 0 }}>{`/ ${record?.drivers}`}</Title>
                        </Space>
                        <Space>
                            <Text strong >{record?.start}</Text>
                            <ArrowRightOutlined />
                            <Text strong >{record?.end}</Text>
                        </Space>
                        <Space>
                            <Tag color="cyan">0</Tag>
                            <Tag color="magenta">0</Tag>
                            <Tag color="gold">0</Tag>
                        </Space>
                    </Space>
                </Row>
            </Card>
        </div>
    )
}

const CellShift = ({display, record, day, setHoveredCell, isCellFilled}) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const [selectedItems, setSelectedItems] = useState([]) // State to hold selected options
    const filteredOptions = namesArray.filter((o) => !selectedItems.includes(o)) // Options to show in the dropdown
    const { token } = useToken()
    const [hours, setHours] = useState({
        start: record.start,
        end: record.end,
        diff: record.start ? getFilledHours(record.end, record.start) : 4
    });
    const [isHovering, setIsHovering] = useState( false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [shift, setShift] = useState({
        drivers: 10,
        start: record.start || record.time,
        end: record.end || '00:00',
    })

    const floatingComponentHeight = hours.diff * 57 - 10

    const cardStyleConfig = {
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        height: floatingComponentHeight,
    }

    /* const errorStyleConfig = {
        backgroundColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
        color: token.colorErrorText,
        height: '100%',
    } */
  
    const handleClick = () => {
        console.log(record)
        setIsHovering(!isHovering)
        showModal()
    }

    const handleHoursChange = (timeString) => {
        setShift({
            ...shift,
            start: timeString[0],
            end: timeString[1],
        })
        const hoursDiff = dayjs(timeString[1], 'HH:mm').diff(dayjs(timeString[0], 'HH:mm'), 'hour', true)
        setHours({start: timeString[0], end: timeString[1], diff: hoursDiff})
        setHoveredCell({ time: timeString[0], day: day })
    }

    const showModal = () => {
      setIsModalOpen(true)
    }

    const handleOk = () => {
      setIsModalOpen(false)
    }

    const handleCancel = () => {
      setIsModalOpen(false)
      setIsHovering(!isHovering)
    }

    return (
        <>
            <div className="container" style={{ minHeight: 24}}>
                { isCellFilled ? (
                    <ShiftCard cardStyle={cardStyleConfig} record={record}/>
                ) : (
                <>
                    {display && <Button size="small" onClick={handleClick}>New Shift</Button>}
                        { isHovering && (
                            <ShiftCard cardStyle={cardStyleConfig} record={shift}/>
                        )}
                </>
                )}
            </div>
            <Formik
                initialValues={{
                    start: shift.start,
                    end: null,
                    drivers: 10,
                    city: scheduleFilter.city,
                }}
                validationSchema={shiftSchema}
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values)
                    setSubmitting(false)
                    setIsModalOpen(false)
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal 
                            title="New Shift" 
                            open={isModalOpen} 
                            onCancel={handleCancel}
                            destroyOnClose
                            footer={[
                                <Button key="back" onClick={handleCancel}>
                                    Cancel
                                </Button>,
                                <SubmitWrapper key="submit" type="primary">
                                    Create Shift
                                </SubmitWrapper>,
                            ]}
                        >
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <TimePicker.RangePicker 
                                    name="end"
                                    style={{ width: '100%' }} 
                                    format="HH:mm" 
                                    defaultValue={[dayjs(props.values.start, 'HH:mm'), props.values.end ? dayjs(props.values.end, 'HH:mm') : null]} 
                                    disabled={[true, false]} 
                                    //onChange={handleHoursChange}
                                    onChange={(time, timeString) => {
                                        props.setFieldValue('start', timeString[0])
                                        props.setFieldValue('end', timeString[1])
                                        handleHoursChange(timeString)
                                    }}
                                    hideDisabledOptions
                                    disabledTime={(current) => {
                                        return {
                                            disabledHours: () => {
                                                const hours = []
                                                for (let i = 0; i < 24; i++) {
                                                    if (i < dayjs(record.time, 'HH:mm').hour() + 1) {
                                                        hours.push(i)
                                                    }
                                                }
                                                return hours
                                            },
                                            disabledMinutes: () => {
                                                const minuteSteps = [0, 30, 59]
                                                const minutes = []
                                                for (let i = 0; i < 60; i++) {
                                                    if (!minuteSteps.includes(i)) {
                                                        minutes.push(i)
                                                    }
                                                }
                                                return minutes
                                            },
                                        }
                                    }}
                                />
                                <Checkbox 
                                    onChange={() => {
                                        props.setFieldValue('start', '00:00')
                                        props.setFieldValue('end', '23:59')
                                        handleHoursChange(['00:00', '23:59'])
                                    }}
                                >
                                    All Day
                                </Checkbox>
                                <CitySelect 
                                    defaultValue={scheduleFilter.city}    
                                    style={{ width: '100%' }}
                                    disabled
                                />
                                <Select
                                  mode="multiple"
                                  placeholder="Drivers"
                                  value={selectedItems}
                                  onChange={setSelectedItems}
                                  style={{
                                    width: '100%',
                                  }}
                                  options={filteredOptions.map((item) => ({
                                    value: item,
                                    label: item,
                                  }))}
                                />
                                <Input 
                                    name="drivers" 
                                    prefix={<UserOutlined />} 
                                    placeholder="Driver Limit" 
                                    type="number" 
                                    min={10} max={999} 
                                    defaultValue={props.values.drivers} 
                                    //onChange={(event) => {setShift({...shift, drivers: event.target.value})}} 
                                    onChange={(e) => {
                                        props.setFieldValue('drivers', e.target.value)
                                        setShift({...shift, drivers: e.target.value})
                                    }}
                                />
                            </Space>
                        </Modal>
                    </FormikForm>
                )}
            </Formik>
        </>
    )
}

export default CellShift

{/* <div className="floating-component" style={{ position: 'absolute', top: 5, left: 5, zIndex: 999, width: 'calc(100% - 10px)' }}>
        <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid green", width: '50%' }}>
        <p>Shift</p>
        <input type="number" value={hours} min={1} max={8} onChange={handleHoursChange} />
    </div>
    <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid blue", width: '50%' }}>
        <p>Shift</p>
    </div>
    <Card 
        style={cardStyleConfig} 
        bodyStyle={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100% - 10px)', padding: 8 }}
    >
        <Row style={{ display: 'flex', height: '100%'}}>
        <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
            <Title level={4} style={{ margin: 0, color: 'inherit' }}>{`0 / ${shift?.drivers}`}</Title>
            <Space>
                <Text strong style={{ color: 'inherit' }}>{shift?.start}</Text>
                <ArrowRightOutlined />
                <Text strong style={{ color: 'inherit' }}>{shift?.end}</Text>
            </Space>
        </Space>
        </Row>
        <Row>
            <Space>
                <Tag color="cyan">0</Tag>
                <Tag color="magenta">0</Tag>
                <Tag color="gold">0</Tag>
            </Space>
        </Row>
    </Card>
</div> */}