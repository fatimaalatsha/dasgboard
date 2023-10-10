import React, { useState } from "react"; // import react hooks
import {
  Button,
  Divider,
  Modal,
  Space,
  Typography,
  TimePicker,
  message,
  DatePicker,
  
} from "antd";
import { Formik, Form } from "formik"; // Import Formik form components
import * as Yup from "yup"; // import yup for validation
import dayjs from "dayjs";
import useFetch from "../../hooks/use-new-fetch";

import { editBonus } from "../../utils/finance-status"; // Import API base url
import { getCities } from "../../utils/city-status"; // Import API base url
//import components
import SubmitWrapper from "../../components/forms/SubmitWrapper";
import InputWrapper from "../../components/forms/InputWrapper";
import SelectWrapper from "../../components/forms/SelectWrapper";
import DateRangePicker from "../../components/DateRangePicker";

//validation schema
const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  city_id: Yup.number().required("Required"),
  type: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
  goal: Yup.number().required("Required"),
  payout: Yup.number().required("Required"),
  // start_time: Yup.mixed().required("Required"),
  // end_time: Yup.mixed().required("Required"),
  objective: Yup.string().required("Required"),
});

const { Text } = Typography;
const BounceDetails = ({ bounceId, open, onCancel }) => {
  const [bonus, setBonus] = useState([]); // Set bonus state

  const { data, loading, error, refetch } = useFetch(`/v1/bonuses/${bounceId}`); // Fetch data from API if bounceId is not null
  console.log(data);
  const [cities, setCities] = useState([]); // Set cities state

  // Get cities
  const fetchCities = async () => {
    const cities = await getCities();
    setCities(cities);
  };

  // Fetch cities on component mount
  React.useEffect(() => {
    fetchCities();
  }, []);

  // date selection handler
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));


  const [selectedTimeRange, setSelectedTimeRange] = useState({
    time_to: dayjs().format("HH:mm"),
  });

  const [selectedTimeRange1, setSelectedTimeRange1] = useState({
    time_from: dayjs().format("HH:mm"),
  });
  // bounce type options
  const BounceType = [
    {
      text: "Money",
      value: "money",
    },
    {
      text: "Rides",
      value: "rides",
    },
  ];
  if (loading) return <p>Loading...</p>;
  if (error) return <p></p>;

  return (
    <>
      <Formik
        initialValues={{
          name: data.name,
          city_id: data.city_id,
          type: data.type,
          status: data.status,
          goal: data.goal,
          start_time: data.start_time,
          end_time: data.end_time,
          payout: data.payout,
          objective: data.objective,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, actions) => {
          const body = {
            name: values.name,
            city_id: values.city_id,
            type: values.type,
            status: values.status,
            goal: parseFloat(values.goal),
            payout: parseFloat(values.payout),
            start_time: startDate + " " + selectedTimeRange1.time_from,
            end_time: endDate + " " + selectedTimeRange.time_to,
            objective: values.objective,
          };
          await editBonus(bounceId, body).then((response) => {
            if (response) {
              actions.resetForm();
              message.success("Bonus Updated successfully");
              refetch();
              onCancel();
            } else {
              message.error("Error updating bonus");
            }
          });
        }}
      >
        {(props) => (
          <Modal
            title={
              <Divider strong style={{ fontSize: "1.2rem" }}>
                {" "}
                Update Bounce{" "}
              </Divider>
            }
            className="modalStyle"
            open={open}
            onCancel={onCancel}
            destroyOnClose={true}
            footer={[
              <SubmitWrapper key="submit" type="primary">
                Submit
              </SubmitWrapper>,
            ]}
          >
            <Form>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">Bonus Title</Text>
                <InputWrapper name="name" />
                <Text type="secondary"> Cities </Text>
                <SelectWrapper
                  name="city_id"
                  datasource={cities}
                  mode="multiple"
                />
                <Text type="secondary">Bonus Type</Text>
                <SelectWrapper name="type" datasource={BounceType} />
                <Text type="secondary">Status</Text>
                <SelectWrapper
                  name="status"
                  datasource={[
                    {
                      text: "Active",
                      value: "active",
                    },
                    {
                      text: "Inactive",
                      value: "inactive",
                    },
                  ]}
                />
                <Text type="secondary">Goal</Text>
                <InputWrapper name="goal" defaultValue={bonus.goal} />
                <Text type="secondary">Payout</Text>
                <InputWrapper name="payout" defaultValue={bonus.payout} />
                <Text type="secondary">Bonus Objective</Text>
                <InputWrapper name="objective" defaultValue={bonus.objective} />
                <Text type="secondary">Date and Time</Text>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Text type="secondary"> Start Date </Text>
                  <DatePicker
                    name="start_date"
                    onSelect={(value) => {
                      setStartDate(dayjs(value).format("YYYY-MM-DD"));
                    }}
                    defaultValue={dayjs(data.start_time)}
                  />
                  <Text type="secondary">Start Time</Text>
                  <TimePicker
                    name="start_time"
                    showNow
                    format="HH:mm"
                    hideDisabledOptions
                    disabledTime={(current) => {
                      return {
                        disabledMinutes: () => {
                          const minuteSteps = [0, 15, 30, 45, 59];
                          const minutes = [];
                          for (let i = 0; i < 60; i++) {
                            if (!minuteSteps.includes(i)) {
                              minutes.push(i);
                            }
                          }
                          return minutes;
                        },
                      };
                    }}
                    onSelect={(value) => {
                      setSelectedTimeRange1({
                        time_from: dayjs(value).format("HH:mm"),
                      });
                    }}
                    defaultValue={dayjs(data.start_time)}
                  />
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Text type="secondary"> End Date </Text>
                  <DatePicker
                    name="end_date"
                    onSelect={(value) => {
                      setEndDate(dayjs(value).format("YYYY-MM-DD"));
                    }}
                    defaultValue={dayjs(data.end_time)}
                  />

                  <Text type="secondary"> End Time </Text>
                  <TimePicker
                    name="end_time"
                    showNow={false}
                    format="HH:mm"
                    hideDisabledOptions
                    disabledTime={(current) => {
                      return {
                        disabledMinutes: () => {
                          const minuteSteps = [0, 15, 30, 45, 59];
                          const minutes = [];
                          for (let i = 0; i < 60; i++) {
                            if (!minuteSteps.includes(i)) {
                              minutes.push(i);
                            }
                          }
                          return minutes;
                        },
                      };
                    }}
                    onSelect={(value) => {
                      setSelectedTimeRange({
                        time_to: dayjs(value).format("HH:mm"),
                      });
                    }}
                    defaultValue={dayjs(data.end_time)}
                  />
                </div>
              </Space>
            </Form>
          </Modal>
        )}
      </Formik>
    </>
  );
};

export default BounceDetails;
