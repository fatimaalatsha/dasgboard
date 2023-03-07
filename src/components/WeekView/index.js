import { useState } from 'react' // Import React hooks
import { Table, Space, Typography } from 'antd' // Import Ant components
import { geekblue } from '@ant-design/colors' // Import Ant colors
import dayjs from 'dayjs' // Import dayjs

import CurrentTimeLine from '../CurrentTimeLine' // Import Red Bar component
import CellShift from '../CellShift' // Import CellShift component

const { Text, Title } = Typography

const WeekView = ({selectedWeek, data, days }) => {
  const [hoveredCell, setHoveredCell] = useState(null) // Create state to store the hover state

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 100,
      fixed: 'left',
    },
    ...days.map((day, idx) => ({ // Loop through the days
      title: (
          <Space direction="vertical">
              <Title 
                  level={2} 
                  style={{ 
                      margin: 0,
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: '#FFFFFF', 
                          backgroundColor: geekblue[6], 
                          padding: '2px 8px', 
                          borderRadius: 100 
                      }),
                  }}
              >
                  {selectedWeek.day(idx).date()}
              </Title>
              <Text 
                  type="secondary" 
                  style={{ 
                      ...(selectedWeek.day(idx).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY') && { 
                          color: geekblue[6], 
                          fontWeight: 'bold',
                          }),
                      textTransform: 'capitalize',
                  }}
              >
                  {day.substring(0, 3)}
              </Text>
          </Space>
      ),
      dataIndex: day,
      key: idx,
      width: 200,
      align: 'center',
      onCell: (record) => {
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
        //console.log(record[day])
        let content = null
          return (
            <>
                { record[day].length !== 0  ? (
                    record[day].map((item, idx) => {
                        item.dayOfWeek === day && item.start === record.time 
                        ?
                         content = <CellShift
                                        key={idx}
                                        isCellFilled={item.dayOfWeek === day && item.start === record.time}
                                        record={item}
                                    />
                        : 
                        content =  <CellShift 
                                        key={idx}
                                        display={hoveredCell?.time === record.time && hoveredCell?.day === day} 
                                        record={record}
                                        dayWeek={day}
                                        day={selectedWeek.day(idx).date()}
                                        setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                                    />
                        return content
                    })
                ) : (
                     <CellShift 
                        display={hoveredCell?.time === record.time && hoveredCell?.day === day} 
                        record={record}
                        dayWeek={day}
                        day={selectedWeek.day(idx).date()}
                        setHoveredCell={(values) => setHoveredCell({time: values.time, day: values.day})}
                    />
                )}
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
      />
      <CurrentTimeLine />
    </div>
  )
}

export default WeekView