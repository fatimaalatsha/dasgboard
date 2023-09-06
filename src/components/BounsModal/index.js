import React, { useState } from "react";

import { Modal, Typography, Select, Space } from "antd";
import { Formik, Form , Field} from 'formik' // Import Formik form components
import * as Yup from 'yup' // import yup for validation
import dayjs from "dayjs";

import {createBonus} from "../../utils/finance-status"; // Import API base url
import { getCities } from "../../utils/city-status"; // Import API base url
//import components
import EditableDate from "../EditableDate"
import SubmitWrapper from "../forms/SubmitWrapper"
import InputWrapper from "../forms/InputWrapper"
import SelectWrapper from "../forms/SelectWrapper";
import DateRangePicker from "../DateRangePicker";

const { Text } = Typography

//initial values
const initialValues = {
    name: "",
    city_id: "",
    type: "",
    status: "",
    goal: "",
    start_time: "",
    end_time: "",
}
//validation schema
const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    city_id: Yup.number().required("Required"),
    type: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    goal: Yup.number().required("Required"),
    // start_time: Yup.string().required("Required"),
    // end_time: Yup.string().required("Required"),
})



const CreateBounsModal = (props) => {

const [cities, setCities] = useState([]); // Set cities state


// Get cities
  const fetchCities = async () => {
    const cities = await getCities();
    setCities(cities);
    console.log(cities);
  };

  // Fetch cities on component mount
  React.useEffect(() => {
    fetchCities();
  }, []);

const test = {
  name: "Bonus 1",
  type: "Incentive",
  city_id: [1, 2, 3],
  start_time: "2021-01-01T00:00:00.000Z",
  end_time: "2021-01-01T00:00:00.000Z",
  goal: 100,
  payout: 10,
  };


  // date selection handler
  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
  });
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange({
      date_from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
      date_to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
    });
  };
  
  // bounce type options
  const BounceType = [
    {
      name: "Dollar",
    },
    {
      name: "Bonus",
    },
  ];

    return (
      <>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            console.log(values, selectedDateRange);
            const body = {
              name: values.name,
              city_id: values.city_id,
              type: values.type,
              status: values.status,
              goal: parseFloat(values.goal),
              start_time: selectedDateRange.date_from,
              end_time: selectedDateRange.date_to,
            };
            console.log(body);
            await createBonus(body); // Call create bonus function
          }}
        >
          <Modal
            title={
              <Text strong style={{ fontSize: "1.2rem" }}>
                {" "}
                Create New Bounce{" "}
              </Text>
            }
            className="modalStyle"
            open={props.open}
            onCancel={props.onCancel}
            // onOk={props.onOk}
            footer={[
              <SubmitWrapper key="submit" type="primary">
                Submit
              </SubmitWrapper>,
            ]}
          >
            <Form>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">Bonus Title</Text>
                <InputWrapper name="name" placeholder="Bounce Name" />
                <Text type="secondary"> Cities </Text>
                <SelectWrapper
                  name="city_id"
                  placeholder="City"
                  datasource={cities}
                  mode="multiple"
                />
                <Text type="secondary">Bonus Type</Text>
                <SelectWrapper
                  name="type"
                  placeholder="Type"
                  datasource={BounceType}
                />
                <Text type="secondary">Status</Text>
                <SelectWrapper
                  name="status"
                  placeholder="Status"
                  datasource={
                    [
                      {
                        name: "Active",
                      },
                      {
                        name: "Inactive",
                      },
                    ]
                  }
                />
                <Text type="secondary">Goal</Text>
                <InputWrapper name="goal" placeholder="Goal" />
                <Text type="secondary"> Date Range </Text>
                <DateRangePicker
                  value={selectedDateRange}
                  onDateSelect={handleDateSelect}
                  unpresets={true}
                />
              </Space>
            </Form>
          </Modal>
        </Formik>
      </>
    );
}
export default CreateBounsModal