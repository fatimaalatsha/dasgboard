import { Card, Statistic, Popover, Typography } from "antd";

const { Text } = Typography;

const CardStatistic = ({
  title,
  value,
  color,
  popInfo,
  height = 100,
  width = 140,
  fontSize = 1.5,
  padding = 0,
  font = "inherit",
}) => {
  const style = {
    width,
    height,
    textAlign: "center",
    backgroundColor: "#f0f2f5",
    padding: `${padding}px`,
  };

  const valueStyle = {
    color,
    fontSize: `${fontSize}rem`,
    textAlign: "center",
    fontFamily: `${font}`,
  };

  return (
    <Popover content={<Text style={{ color }}>{popInfo}</Text>}>
      <Card style={style}>
        <Statistic
          title={title}
          value={value}
          precision={0}
          valueStyle={valueStyle}
        />
      </Card>
    </Popover>
  );
};

export default CardStatistic;
