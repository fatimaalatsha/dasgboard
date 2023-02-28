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
      dataIndex: 'time',
      key: 'time',
      width: 100,
      fixed: 'left',
    },
    ...hours.map((hour, idx) => ({ // Loop through the days
      title: `${hour}`,
      dataIndex: hour,
      key: idx,
      align: 'center',
      /* onCell: (record) => {
          return {
              onMouseEnter: () => { // Mouse enter event
                  setHoveredCell({ time: record.time, day: day })
              },
              onMouseLeave: () => { // Mouse leave event
                  setHoveredCell(null)
              },
          }
      },
      render: (text, record ) => {
          return (
              <>
             { record[day][0]?.dayOfWeek === day && record.time === record[day][0]?.start ? (
              <CellShift
                  isCellFilled={record[day][0]?.dayOfWeek === day && record.time === record[day][0]?.start}
                  record={record[day][0]}
              />
             ) : 
              (<CellShift 
                  display={hoveredCell?.time === record.time && hoveredCell?.day === day} 
                  record={record}
                  dayWeek={day}
                  day={selectedWeek.day(idx).date()}
                  setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
              />) }
              </>
          )
      }, */
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