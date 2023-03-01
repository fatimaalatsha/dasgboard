import { useState } from 'react' // Import React hooks
import { Table, Space, Typography } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from 'dayjs' // Import dayjs

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import CellShift from '../CellShift' // Import CellShift component

const { Text, Title } = Typography

const DayView = ({selectedWeek, data, hours }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state

  const columns = [
    {
      title: 'Drivers',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (text, record) => (
        <Text style={{ textTransform: 'capitalize' }}>{text}</Text>
      )
    },
    ...hours.map((hour, idx) => ({ // Loop through the days
      title: `${hour}`,
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
        console.log(record)
          /* return (
              <>
             { record[hour][0]?.dayOfWeek === hour && record.time === record[hour][0]?.start ? (
              <CellShift
                  isCellFilled={record[hour][0]?.dayOfWeek === hour && record.time === record[hour][0]?.start}
                  record={record[hour][0]}
              />
             ) : 
              (<CellShift 
                  display={hoveredCell?.name === record.name && hoveredCell?.hour === hour} 
                  record={record}
                  dayWeek={hour}
                  day={selectedWeek.day(idx).date()}
                  setHoveredCell={(values) => setHoveredCell({name: values.name, day: values.day})}
              />) }
              </>
          ) */
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