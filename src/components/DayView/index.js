import { useState } from 'react' // Import React hooks
import { Table, Typography } from 'antd' // Import Ant components

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import DayCellShift from '../DayCellShift' // Import CellShift component
import dayjs from 'dayjs' // Import dayjs

const { Text, Title } = Typography

const DayView = ({selectedDay, data, hours, tz }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state

  const columns = [
    {
      title: 'Drivers',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text, record) => (
        <Text style={{ textTransform: 'capitalize', width: 100 }} ellipsis={{ suffix: '...', tooltip: true }} >{text}</Text>
      )
    },
    {
      title: (
      <Title level={5}>{`${selectedDay.format('MMM, dddd DD - YYYY')} ${dayjs().tz(tz).format('HH:mm')} ${dayjs().tz(tz).format('zZ')} `}</Title>
      ),
      children: [
        ...hours.map((hour, idx) => ({ // Loop through the days
          title: `${hour}`,
          align: 'center',
          children: [
            {
              title: (<Text type="secondary" code >{`${hour.substring(1,2) + idx}`}</Text>),
              dataIndex: hour,
              key: idx,
              align: 'center',
              onCell: (record) => {
                  return {
                      onMouseEnter: () => { // Mouse enter event
                          setHoveredCell({ name: record.name, hour: hour })
                      },
                      onMouseLeave: () => { // Mouse leave event
                          setHoveredCell(null)
                      },
                  }
              },
              render: (text, record ) => {
                for ( let item = 0; item < record[hour].length; item++ ) {
                  if ( record[hour][item].start === hour && record.name === record[hour][item].name ) {
                    return (
                      <DayCellShift 
                        isCellFilled={record[hour][item].start === hour && record.name === record[hour][item].name}
                        record={record[hour][item]}
                        setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                      />
                    )
                  }
                }
    
                return (
                  <DayCellShift 
                    display={hoveredCell?.name === record.name && hoveredCell?.hour === hour} 
                    record={record} 
                    hour={hour}
                    day={selectedDay}
                    setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                  />
                )
              },
            }
          ],
        })),
      ]
    }
  ]

  return (
    <div style={{ position: 'relative'}}>
      <Table 
          columns={columns}
          dataSource={data}
          pagination={false}
          className="schedule-day-table"
          bordered
          size="small"
      />
      <CurrentTimeLine axis tz={tz} />
    </div>
  )
}

export default DayView