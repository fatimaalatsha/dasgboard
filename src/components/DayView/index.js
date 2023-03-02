import { useState } from 'react' // Import React hooks
import { Table, Space, Typography, Button } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from 'dayjs' // Import dayjs

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import DayCellShift from '../DayCellShift' // Import CellShift component

const { Text, Title } = Typography

const DayView = ({selectedWeek, data, hours }) => {
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
    ...hours.map((hour, idx) => ({ // Loop through the days
      title: `${hour}`,
      dataIndex: hour,
      key: idx,
      align: 'center',
      width: 100,
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
        //console.log(record)
        /* return (
          hoveredCell?.name === record.name && hoveredCell?.hour === hour && <Button>add time</Button>
        ) */
          return (
            <>
              { record[hour][0]?.start === hour && record.name === record[hour][0]?.name ? (
              <>hey</> 
              ) : (
                <DayCellShift 
                  display={hoveredCell?.name === record.name && hoveredCell?.hour === hour} 
                  record={record} 
                  hour={hour}
                  day={selectedWeek.day(idx).date()}
                  setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                />
              )
              }
            </>
          )
      },
    })),
  ]

  return (
    <div style={{ position: 'relative'}}>
      <Table 
          columns={columns}
          dataSource={data}
          pagination={false}
          className="schedule-week-table"
          bordered
          size="small" 
      />
      <CurrentTimeLine axis />
    </div>
  )
}

export default DayView