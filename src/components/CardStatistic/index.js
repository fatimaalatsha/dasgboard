import PropTypes from 'prop-types';
import { Card, Statistic, Popover, Typography } from 'antd';

const { Text } = Typography;

const CardStatistic = ({ title, value, color, popInfo, height = 100, width = 140 , fontSize =1.5  }) => {
    return (
        <Popover
            content={<Text style={{ color: color }}>{popInfo}</Text>}
        >
            <Card
                style={{ width, height, textAlign: 'center', backgroundColor: '#f0f2f5' }}
             
            >
                <Statistic
                    title={title}
                    value={value}
                    precision={0}
                    valueStyle={{ color, fontSize: `${fontSize}rem` , textAlign: 'center'}}
                />
            </Card>
        </Popover>
    );
};

CardStatistic.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    popInfo: PropTypes.string.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
};

export default CardStatistic;